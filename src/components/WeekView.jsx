import { useState } from 'react'
import { getWeekDays, sameDay, today, toKey, DAYS } from '../utils/dates'
import { TaskCard, AddTaskForm } from './TaskCard'

export function WeekView({ baseDate, getDay, onToggle, onDelete, onAdd }) {
  const [addingFor, setAddingFor] = useState(null)
  const days = getWeekDays(baseDate)
  const t = today()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
      {/* Day headers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', background: 'var(--card)', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        {days.map(d => {
          const isToday = sameDay(d, t)
          return (
            <div key={toKey(d)} style={{ padding: '8px 10px', borderRight: '1px solid var(--border-light)', display: 'flex', flexDirection: 'column', gap: 2 }}>
              <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>{DAYS[d.getDay()]}</span>
              <div style={{
                width: 26, height: 26, borderRadius: '50%',
                background: isToday ? 'var(--accent)' : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ fontSize: 14, fontWeight: 500, color: isToday ? '#fff' : 'var(--text)' }}>{d.getDate()}</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Day columns */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', flex: 1, overflow: 'hidden' }}>
        {days.map(d => {
          const key = toKey(d)
          const dayTasks = getDay(key)
          const isToday = sameDay(d, t)

          return (
            <div
              key={key}
              style={{
                borderRight: '1px solid var(--border-light)',
                padding: 6,
                display: 'flex',
                flexDirection: 'column',
                gap: 5,
                overflowY: 'auto',
                background: isToday ? 'color-mix(in srgb, var(--accent) 4%, var(--bg))' : 'var(--bg)',
                minHeight: 0,
              }}
            >
              {dayTasks.map(task => (
                <TaskCard
                  key={task.id}
                  task={task}
                  dateKey={key}
                  onToggle={onToggle}
                  onDelete={onDelete}
                  compact
                />
              ))}

              {addingFor === key ? (
                <AddTaskForm
                  onSave={({ text, tag, color }) => {
                    onAdd({ dateKey: key, text, tag, color })
                    setAddingFor(null)
                  }}
                  onCancel={() => setAddingFor(null)}
                />
              ) : (
                <button
                  onClick={() => setAddingFor(key)}
                  style={{
                    background: 'none',
                    border: '1px dashed var(--border)',
                    borderRadius: 7,
                    padding: '6px 8px',
                    fontSize: 11,
                    color: 'var(--hint)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.15s',
                    fontFamily: 'inherit',
                    width: '100%',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent-mid)'; e.currentTarget.style.color = 'var(--accent)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--hint)' }}
                >
                  + add
                </button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
