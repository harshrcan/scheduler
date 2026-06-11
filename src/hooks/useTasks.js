import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useTasks(userId) {
  const [tasks, setTasksState] = useState({})
  const [syncing, setSyncing] = useState(false)

  const setTasks = useCallback((updater) => {
    setTasksState(prev => typeof updater === 'function' ? updater(prev) : updater)
  }, [])

  useEffect(() => {
    if (!userId) return
    setSyncing(true)
    supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
      .then(({ data, error }) => {
        if (error) { console.error(error); return }
        const remote = {}
        data.forEach(row => {
          if (!remote[row.date_key]) remote[row.date_key] = []
          remote[row.date_key].push({ id: row.id, text: row.text, tag: row.tag, color: row.color, done: row.done })
        })
        setTasks(remote)
      })
      .finally(() => setSyncing(false))
  }, [userId, setTasks])

  useEffect(() => {
    if (!userId) return
    const channel = supabase
      .channel('tasks-' + userId)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks', filter: `user_id=eq.${userId}` }, payload => {
        if (payload.eventType === 'INSERT') {
          const r = payload.new
          setTasks(prev => {
            const existing = prev[r.date_key] || []
            if (existing.find(t => t.id === r.id)) return prev
            return { ...prev, [r.date_key]: [...existing, { id: r.id, text: r.text, tag: r.tag, color: r.color, done: r.done }] }
          })
        }
        if (payload.eventType === 'UPDATE') {
          const r = payload.new
          setTasks(prev => ({
            ...prev,
            [r.date_key]: (prev[r.date_key] || []).map(t => t.id === r.id ? { ...t, done: r.done, text: r.text, color: r.color } : t)
          }))
        }
        if (payload.eventType === 'DELETE') {
          const id = payload.old.id
          const key = payload.old.date_key
          setTasks(prev => ({ ...prev, [key]: (prev[key] || []).filter(t => t.id !== id) }))
        }
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [userId, setTasks])

  const addTask = useCallback(async ({ dateKey, text, tag, color }) => {
    if (!userId) return
    const tempId = `local_${Date.now()}`
    setTasks(prev => ({ ...prev, [dateKey]: [...(prev[dateKey] || []), { id: tempId, text, tag: tag || null, color: color || 'purple', done: false }] }))
    const { data, error } = await supabase
      .from('tasks')
      .insert({ user_id: userId, date_key: dateKey, text, tag: tag || null, color: color || 'purple', done: false })
      .select().single()
    if (error) { console.error(error); return }
    setTasks(prev => ({ ...prev, [dateKey]: (prev[dateKey] || []).map(t => t.id === tempId ? { ...t, id: data.id } : t) }))
  }, [userId, setTasks])

  const toggleTask = useCallback(async (dateKey, taskId) => {
    let newDone = false
    setTasks(prev => {
      const updated = (prev[dateKey] || []).map(t => {
        if (t.id === taskId) { newDone = !t.done; return { ...t, done: !t.done } }
        return t
      })
      return { ...prev, [dateKey]: updated }
    })
    await supabase.from('tasks').update({ done: newDone }).eq('id', taskId)
  }, [setTasks])

  const deleteTask = useCallback(async (dateKey, taskId) => {
    setTasks(prev => ({ ...prev, [dateKey]: (prev[dateKey] || []).filter(t => t.id !== taskId) }))
    await supabase.from('tasks').delete().eq('id', taskId)
  }, [setTasks])

  const getDay = useCallback((dateKey) => tasks[dateKey] || [], [tasks])

  return { tasks, getDay, addTask, toggleTask, deleteTask, syncing }
}
