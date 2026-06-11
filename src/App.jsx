import { useState } from 'react'
import { useTasks } from './hooks/useTasks'
import { WeekView } from './components/WeekView'
import { MonthView } from './components/MonthView'
import { DayView } from './components/DayView'
import { ChecklistPanel } from './components/ChecklistPanel'
import { today, formatPeriod } from './utils/dates'

const navBtnStyle = {
  background: 'none',
  border: '1px solid var(--border)',
  borderRadius: 7,
  padding: '5px 9px',
  cursor: 'pointer',
  color: 'var(--muted)',
  fontSize: 14,
  fontFamily: 'inherit',
  transition: 'background 0.15s',
}

export default function App() {
  const [view, setView] = useState('week')
  const [baseDate, setBaseDate] = useState(today())
  const [showChecklist, setShowChecklist] = useState(true)
  const { getDay, addTask, toggleTask, deleteTask, syncing, online } = useTasks()

  function navigate(dir) {
    setBaseDate(prev => {
      const d = new Date(prev)
      if (view === 'week') d.setDate(d.getDate() + dir * 7)
      else if (view === 'month') d.setMonth(d.getMonth() + dir)
      else d.setDate(d.getDate() + dir)
      return d
    })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: 'var(--bg)', fontFamily: 'var(--font-sans)', color: 'var(--text)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', background: 'var(--card)', borderBottom: '1px solid var(--border)', flexShrink: 0, flexWrap: 'wrap' }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--accent)', letterSpacing: '-0.5px', marginRight: 4 }}>dayframe</div>
        <button onClick={() => navigate(-1)} style={navBtnStyle}>←</button>
        <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text)', minWidth: 200, textAlign: 'center' }}>
          {formatPeriod(baseDate, view)}
        </span>
        <button onClick={() => navigate(1)} style={navBtnStyle}>→</button>
        <button onClick={() => setBaseDate(today())} style={{ ...navBtnStyle, fontSize: 11, padding: '5px 10px' }}>Today</button>
        <div style={{ display: 'flex', gap: 2, background: 'var(--surface)', borderRadius: 8, padding: 2, marginLeft: 'auto' }}>
          {['month', 'week', 'day'].map(v => (
            <button key={v} onClick={() => setView(v)} style={{
              padding: '4px 12px', borderRadius: 6, border: 'none', fontSize: 12, cursor: 'pointer',
              background: view === v ? 'var(--card)' : 'none',
              color: view === v ? 'var(--text)' : 'var(--muted)',
              fontWeight: view === v ? 600 : 400,
              boxShadow: view === v ? '0 0 0 1px var(--border)' : 'none',
              fontFamily: 'inherit', transition: 'all 0.15s',
            }}>{v}</button>
          ))}
        </div>
        <button onClick={() => setShowChecklist(s => !s)} style={{
          ...navBtnStyle, fontSize: 11, padding: '5px 10px',
          background: showChecklist ? '#EEEDFE' : 'none',
          borderColor: showChecklist ? '#AFA9EC' : 'var(--border)',
          color: showChecklist ? '#534AB7' : 'var(--muted)',
          fontWeight: showChecklist ? 600 : 400,
        }}>☑ Checklist</button>
        {syncing && <span style={{ fontSize: 11, color: 'var(--muted)' }}>syncing…</span>}
        {!syncing && online && <span style={{ fontSize: 11, color: '#3B6D11' }}>● synced</span>}
        {!online && <span style={{ fontSize: 11, color: '#854F0B' }} title="Running locally — configure Supabase to sync">○ local only</span>}
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
