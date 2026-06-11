import { useState, useEffect, useCallback } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase'

const LS_KEY = 'dayframe_tasks'

function loadLocal() {
  try {
    const raw = localStorage.getItem(LS_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function saveLocal(tasks) {
  localStorage.setItem(LS_KEY, JSON.stringify(tasks))
}

export function useTasks() {
  const [tasks, setTasksState] = useState(loadLocal)
  const [syncing, setSyncing] = useState(false)
  const [online, setOnline] = useState(isSupabaseConfigured)

  // Persist to localStorage on every change
  const setTasks = useCallback((updater) => {
    setTasksState(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      saveLocal(next)
      return next
    })
  }, [])

  // Pull all tasks from Supabase on mount
  useEffect(() => {
    if (!isSupabaseConfigured) return
    setSyncing(true)
    supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: true })
      .then(({ data, error }) => {
        if (error) { console.error('Supabase fetch error:', error); setOnline(false); return }
        // Merge remote into local keyed by date_key
        const remote = {}
        data.forEach(row => {
          if (!remote[row.date_key]) remote[row.date_key] = []
          remote[row.date_key].push({
            id: row.id,
            text: row.text,
            tag: row.tag,
            color: row.color,
            done: row.done,
            created_at: row.created_at,
          })
        })
        setTasks(remote)
        setOnline(true)
      })
      .finally(() => setSyncing(false))
  }, [setTasks])

  // Real-time subscription
  useEffect(() => {
    if (!isSupabaseConfigured) return
    const channel = supabase
      .channel('tasks-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, payload => {
        if (payload.eventType === 'INSERT') {
          const r = payload.new
          setTasks(prev => {
            const key = r.date_key
            const existing = prev[key] || []
            if (existing.find(t => t.id === r.id)) return prev
            return { ...prev, [key]: [...existing, { id: r.id, text: r.text, tag: r.tag, color: r.color, done: r.done }] }
          })
        }
        if (payload.eventType === 'UPDATE') {
          const r = payload.new
          setTasks(prev => {
            const key = r.date_key
            return {
              ...prev,
              [key]: (prev[key] || []).map(t => t.id === r.id ? { ...t, done: r.done, text: r.text, color: r.color } : t)
            }
          })
        }
        if (payload.eventType === 'DELETE') {
          const id = payload.old.id
          const key = payload.old.date_key
          setTasks(prev => ({ ...prev, [key]: (prev[key] || []).filter(t => t.id !== id) }))
        }
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [setTasks])

  const addTask = useCallback(async ({ dateKey, text, tag, color }) => {
    const tempId = `local_${Date.now()}_${Math.random()}`
    const newTask = { id: tempId, text, tag: tag || null, color: color || 'purple', done: false }

    // Optimistic update
    setTasks(prev => ({ ...prev, [dateKey]: [...(prev[dateKey] || []), newTask] }))

    if (!isSupabaseConfigured) return

    const { data, error } = await supabase
      .from('tasks')
      .insert({ date_key: dateKey, text, tag: tag || null, color: color || 'purple', done: false })
      .select()
      .single()

    if (error) { console.error('Insert error:', error); return }

    // Replace temp id with real id
    setTasks(prev => ({
      ...prev,
      [dateKey]: (prev[dateKey] || []).map(t => t.id === tempId ? { ...t, id: data.id } : t)
    }))
  }, [setTasks])

  const toggleTask = useCallback(async (dateKey, taskId) => {
    let newDone = false
    setTasks(prev => {
      const updated = (prev[dateKey] || []).map(t => {
        if (t.id === taskId) { newDone = !t.done; return { ...t, done: !t.done } }
        return t
      })
      return { ...prev, [dateKey]: updated }
    })
    if (!isSupabaseConfigured || String(taskId).startsWith('local_')) return
    await supabase.from('tasks').update({ done: newDone }).eq('id', taskId)
  }, [setTasks])

  const deleteTask = useCallback(async (dateKey, taskId) => {
    setTasks(prev => ({ ...prev, [dateKey]: (prev[dateKey] || []).filter(t => t.id !== taskId) }))
    if (!isSupabaseConfigured || String(taskId).startsWith('local_')) return
    await supabase.from('tasks').delete().eq('id', taskId)
  }, [setTasks])

  const getDay = useCallback((dateKey) => tasks[dateKey] || [], [tasks])

  return { tasks, getDay, addTask, toggleTask, deleteTask, syncing, online }
}
