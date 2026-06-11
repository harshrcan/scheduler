import { useState } from 'react'
import { getWeekDays, sameDay, today, toKey, DAYS } from '../utils/dates'
import { getColor } from './TaskCard'

export function ChecklistPanel({ baseDate, view, getDay, onToggle }) {
  const [filter, setFilter] = useState('all')

  const getDays = () => {
    if (view === 'day') return [new Date(baseDate)]
    if (view === 'week') return getWeekDays(baseDate)
    // month: all days in month
    const days = []
    const d = new Date(baseDate.getFullYear(), baseDate.getMonth(), 1)
    while (d.getMonth() === baseDate.getMonth()) {
      days.push(new Date(d))
      d.setDate(d.getDate() + 1)
    }
    return days
  }

  const days = getDays()
  const t = today()

  let totalAll = 0, totalDone = 0
  const groups = []

  days.forEach(d => {
    const key = toKey(d)
    const all = getDay(key)
    totalAll += all.length
    totalDone += all.filter(t => t.done).length

    const filtered = all.filter(task => {
      if (filter === 'done') return task.done
      if (filter === 'todo') return !task.done
      return true
    })
    if (!filtered.length) return

    const label = sameDay(d, t) ? 'Today' : `${DAYS[d.getDay()]} ${d.getDate()}`
    groups.push({ label, tasks: filtered, date: d, key })
  })

  const pct = totalAll > 0 ? Math.round((totalDone / totalAll) * 100) : 0

  return (
    <div style={{ width: 250, borderLeft: '1px solid var(--border)', background: 'var(--card)', display: 'flex', flexDirection: 'column', overflow: 'hidden', flexShrink: 0 }}>
      {/* Header */}
      <div style={{ padding: '12px 14px 8px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 8 }}>
          {view === 'day' ? 'Day view' : view === 'month' ? 'This month' : 'This week'}
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {['all', 'todo', 'done'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '3px 9px', borderRadius: 5, fontSize: 11, cursor: 'pointer', fontFamily: 'inherit',
                border: filter === f ? '1px solid #AFA9EC' : '1px solid var(--border)',
                background: filter === f ? '#EEEDFE' : 'none',
                color: filter === f ? '#534AB7' : 'var(--muted)',
                fontWeight: filter === f ? 600 : 400,
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Task list */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {groups.length === 0 ? (
          <div style={{ padding: '28px 14px', textAlign: 'center', color: 'var(--hint)', fontSize: 12, lineHeight: 1.7 }}>
            {filter === 'done' ? 'Nothing done yet.' : filter === 'todo' ? 'All caught up! 🎉' : 'No tasks yet.\nAdd some from the calendar.'}
          </div>
        ) : groups.map(g => (
          <div key={g.key} style={{ marginBottom: 2 }}>
            <div style={{ padding: '6px 14px 3px', fontSize: 10, fontWeight: 700, color: 'var(--hint)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'flex', justifyContent: 'space-between' }}>
              <span>{g.label}</span>
              <span style={{ fontWeight: 400 }}>{g.tasks.filter(t => !t.done).length} left</span>
            </div>
            {g.tasks.map(task => {
              const c = getColor(task)
              return (
                <div
                  key={task.id}
                  onClick={() => onToggle(g.key, task.id)}
                  style={{ padding: '6px 14px', display: 'flex', alignItems: 'flex-start', gap: 8, cursor: 'pointer', transition: 'background 0.1s' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--surface)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  {/* Color dot indicator */}
                  <div style={{ width: 3, height: '100%', alignSelf: 'stretch', borderRadius: 2, background: c.border, flexShrink: 0, marginTop: 3 }} />
                  {/* Check */}
                  <div style={{
                    width: 14, height: 14, borderRadius: 3, flexShrink: 0, marginTop: 1,
                    border: `1.5px solid ${c.border}`,
                    background: task.done ? c.border : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {task.done && (
                      <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                        <path d="M1.5 4L3.5 6L6.5 2" stroke={c.text} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, color: task.done ? 'var(--hint)' : 'var(--text)', textDecoration: task.done ? 'line-through' : 'none', lineHeight: 1.4 }}>
                      {task.text}
                    </div>
                    {task.tag && (
                      <div style={{ fontSize: 10, color: c.text, fontWeight: 600, marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{task.tag}</div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div style={{ padding: '8px 14px 10px', borderTop: '1px solid var(--border)', flexShrink: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--muted)', marginBottom: 5 }}>
          <span>{totalDone} of {totalAll} done</span>
          <span style={{ fontWeight: 600, color: pct === 100 ? '#3B6D11' : 'var(--accent)' }}>{pct}%</span>
        </div>
        <div style={{ height: 4, background: 'var(--surface)', borderRadius: 2, overflow: 'hidden', border: '1px solid var(--border-light)' }}>
          <div style={{ height: '100%', width: `${pct}%`, background: pct === 100 ? '#97C459' : 'var(--accent)', borderRadius: 2, transition: 'width 0.4s ease' }} />
        </div>
      </div>
    </div>
  )
}
