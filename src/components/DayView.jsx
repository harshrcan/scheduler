import { useState } from 'react'
import { sameDay, today, toKey, DAYS, MONTHS } from '../utils/dates'
import { TaskCard, AddTaskForm } from './TaskCard'

export function DayView({ baseDate, getDay, onToggle, onDelete, onAdd }) {
  const [adding, setAdding] = useState(false)
  const [focusNote, setFocusNote] = useState(() => {
    try { return JSON.parse(localStorage.getItem('dayframe_focus') || '{}') } catch { return {} }
  })

  const key = toKey(baseDate)
  const dayTasks = getDay(key)
  const isToday = sameDay(baseDate, today())

  function saveFocus(val) {
    const next = { ...focusNote, [key]: val }
    setFocusNote(next)
    localStorage.setItem('dayframe_focus', JSON.stringify(next))
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: '12px 18px', borderBottom: '1px solid var(--border)', background: 'var(--card)', flexShrink: 0, display: 'flex', alignItems: 'baseline', gap: 10 }}>
        <span style={{ fontSize: 24, fontWeight: 600, color: 'var(--text)' }}>
          {isToday ? 'Today' : `${d(baseDate)} ${MONTHS[baseDate.getMonth()]}`}
        </span>
        <span style={{ fontSize: 14, color: 'var(--muted)' }}>{DAYS[baseDate.getDay()]}{isToday ? ` · ${d(baseDate)} ${MONTHS[baseDate.getMonth()]}` : ''}</span>
        <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--hint)' }}>
          {dayTasks.filter(t => t.done).length}/{dayTasks.length} done
        </span>
      </div>

      {/* Focus note */}
      <div style={{ padding: '8px 18px', background: '#EEEDFE22', borderBottom: '1px solid var(--border-light)', flexShrink: 0, display: 'flex', gap: 8, alignItems: 'center' }}>
        <span style={{ fontSize: 11, color: 'var(--accent)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', whiteSpace: 'nowrap' }}>⚡ Focus</span>
        <input
          value={focusNote[key] || ''}
          onChange={e => saveFocus(e.target.value)}
          placeholder="One thing to focus on today..."
          style={{ flex: 1, border: 'none', background: 'transparent', fontSize: 13, color: 'var(--text)', fontFamily: 'inherit', outline: 'none' }}
        />
      </div>

      {/* Tasks */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 18px', display: 'flex', flexDirection: 'column', gap: 7 }}>
        {dayTasks.map(task => (
          <TaskCard
            key={task.id}
            task={task}
            dateKey={key}
            onToggle={onToggle}
            onDelete={onDelete}
          />
        ))}

        {adding ? (
          <AddTaskForm
            onSave={({ text, tag, color }) => { onAdd({ dateKey: key, text, tag, color }); setAdding(false) }}
            onCancel={() => setAdding(false)}
          />
        ) : (
          <button
            onClick={() => setAdding(true)}
            style={{
              background: 'none', border: '1px dashed var(--border)', borderRadius: 8, padding: '10px 12px',
              fontSize: 13, color: 'var(--hint)', cursor: 'pointer', textAlign: 'left',
              fontFamily: 'inherit', transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent-mid)'; e.currentTarget.style.color = 'var(--accent)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--hint)' }}
          >
            + Add task for this day
          </button>
        )}
      </div>
    </div>
  )
}

function d(date) { return date.getDate() }
