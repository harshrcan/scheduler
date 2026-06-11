import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import { Auth } from './components/Auth'
import { useTasks } from './hooks/useTasks'
import { WeekView } from './components/WeekView'
import { MonthView } from './components/MonthView'
import { DayView } from './components/DayView'
import { ChecklistPanel } from './components/ChecklistPanel'
import { today, formatPeriod } from './utils/dates'

const btn = {
  background: 'none', border: '1px solid var(--border)', borderRadius: 7,
  padding: '5px 9px', cursor: 'pointer', color: 'var(--muted)',
  fontSize: 14, fontFamily: 'inherit',
}

function getInitials(name) {
  if (!name) return '?'
  const parts = name.trim().split(' ')
  if (parts.length === 1) return parts[0][0].toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export default function App() {
  const [session, setSession] = useState(null)
  const [loadingAuth, setLoadingAuth] = useState(true)
  const [view, setView] = useState('week')
  const [baseDate, setBaseDate] = useState(today())
  const [showChecklist, setShowChecklist] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setLoadingAuth(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })
    return () => subscription.unsubscribe()
  }, [])

  const { getDay, addTask, toggleTask, deleteTask, syncing } = useTasks(session?.user?.id)

  function navigate(dir) {
    setBaseDate(prev => {
      const d = new Date(prev)
      if (view === 'week') d.setDate(d.getDate() + dir * 7)
      else if (view === 'month') d.setMonth(d.getMonth() + dir)
      else d.setDate(d.getDate() + dir)
      return d
    })
  }

  async function handleSignOut() {
    await supabase.auth.signOut()
  }

  if (loadingAuth) return (
    <div style={{
      height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg)', color: 'var(--muted)', fontFamily: 'var(--font-sans)',
      fontSize: 13,
    }}>
      Loading...
    </div>
  )

  if (!session) return <Auth />

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--bg)', fontFamily: 'var(--font-sans)', color: 'var(--text)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', background: 'var(--card)', borderBottom: '1px solid var(--border)', flexShrink: 0, flexWrap: 'wrap' }}>

        <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--accent)', letterSpacing: '-0.5px', marginRight: 4 }}>dayframe</span>

        <button onClick={() => navigate(-1)} style={btn}>←</button>
        <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)', minWidth: 200, textAlign: 'center' }}>
          {formatPeriod(baseDate, view)}
        </span>
        <button onClick={() => navigate(1)} style={btn}>→</button>
        <button onClick={() => setBaseDate(today())} style={{ ...btn, fontSize: 11, padding: '5px 10px' }}>Today</button>

        <div style={{ display: 'flex', gap: 2, background: 'var(--surface)', borderRadius: 8, padding: 2, marginLeft: 'auto' }}>
          {['month', 'week', 'day'].map(v => (
            <button key={v} onClick={() => setView(v)} style={{
              padding: '4px 12px', borderRadius: 6, border: 'none', fontSize: 12,
              cursor: 'pointer', fontFamily: 'inherit',
              background: view === v ? 'var(--card)' : 'none',
              color: view === v ? 'var(--text)' : 'var(--muted)',
              fontWeight: view === v ? 600 : 400,
              boxShadow: view === v ? '0 0 0 1px var(--border)' : 'none',
            }}>{v}</button>
          ))}
        </div>

        <button onClick={() => setShowChecklist(s => !s)} style={{
          ...btn, fontSize: 11, padding: '5px 10px',
          background: showChecklist ? '#EEEDFE' : 'none',
          borderColor: showChecklist ? '#AFA9EC' : 'var(--border)',
          color: showChecklist ? '#534AB7' : 'var(--muted)',
          fontWeight: showChecklist ? 600 : 400,
        }}>☑ Checklist</button>

        {/* User avatar + name + sign out */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ position: 'relative' }}>
            {session.user.user_metadata?.avatar_url ? (
              <img
                src={session.user.user_metadata.avatar_url}
                alt="avatar"
                style={{ width: 30, height: 30, borderRadius: '50%', border: '1px solid var(--border)', display: 'block' }}
              />
            ) : (
              <div style={{
                width: 30, height: 30, borderRadius: '50%',
                background: 'var(--accent)', color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 700, letterSpacing: '-0.3px',
              }}>
                {getInitials(session.user.user_metadata?.full_name || session.user.email)}
              </div>
            )}
          </div>
          <span style={{ fontSize: 12, color: 'var(--muted)', maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {session.user.user_metadata?.full_name?.split(' ')[0] || session.user.email?.split('@')[0]}
          </span>
          <button onClick={handleSignOut} style={{ ...btn, fontSize: 11, padding: '5px 10px' }}>Sign out</button>
        </div>

        {syncing && <span style={{ fontSize: 11, color: 'var(--muted)' }}>syncing…</span>}
        {!syncing && <span style={{ fontSize: 11, color: '#3B6D11' }}>● synced</span>}
      </div>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {view === 'week' && <WeekView baseDate={baseDate} getDay={getDay} onToggle={toggleTask} onDelete={deleteTask} onAdd={addTask} />}
          {view === 'month' && <MonthView baseDate={baseDate} getDay={getDay} onDayClick={d => { setBaseDate(d); setView('day') }} />}
          {view === 'day' && <DayView baseDate={baseDate} getDay={getDay} onToggle={toggleTask} onDelete={deleteTask} onAdd={addTask} />}
        </div>
        {showChecklist && <ChecklistPanel baseDate={baseDate} view={view} getDay={getDay} onToggle={toggleTask} />}
      </div>
    </div>
  )
}
