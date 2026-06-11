import { sameDay, today, toKey, DAYS, getWeekStart } from '../utils/dates'
import { getColor } from './TaskCard'

export function MonthView({ baseDate, getDay, onDayClick }) {
  const t = today()
  const first = new Date(baseDate.getFullYear(), baseDate.getMonth(), 1)
  const last = new Date(baseDate.getFullYear(), baseDate.getMonth() + 1, 0)
  const start = getWeekStart(first)

  const cells = []
  const cursor = new Date(start)
  while (cursor <= last || cells.length % 7 !== 0) {
    cells.push(new Date(cursor))
    cursor.setDate(cursor.getDate() + 1)
    if (cells.length > 42) break
  }

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: 10 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 3 }}>
        {DAYS.map(d => (
          <div key={d} style={{ textAlign: 'center', fontSize: 10, fontWeight: 600, color: 'var(--hint)', textTransform: 'uppercase', padding: '3px 0', letterSpacing: '0.07em' }}>
            {d.slice(0, 1)}
          </div>
        ))}
        {cells.map((d, i) => {
          const key = toKey(d)
          const dayTasks = getDay(key)
          const isToday = sameDay(d, t)
          const otherMonth = d.getMonth() !== baseDate.getMonth()

          return (
            <div
              key={i}
              onClick={() => onDayClick(d)}
              style={{
                background: isToday ? '#EEEDFE' : 'var(--card)',
                border: isToday ? '1.5px solid #AFA9EC' : '1px solid var(--border-light)',
                borderRadius: 8,
                padding: '5px 6px',
                minHeight: 64,
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                opacity: otherMonth ? 0.4 : 1,
                transition: 'border-color 0.15s',
              }}
              onMouseEnter={e => { if (!isToday) e.currentTarget.style.borderColor = 'var(--accent-mid)' }}
              onMouseLeave={e => { if (!isToday) e.currentTarget.style.borderColor = 'var(--border-light)' }}
            >
              <span style={{ fontSize: 11, fontWeight: 500, color: isToday ? '#534AB7' : 'var(--text)' }}>{d.getDate()}</span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                {dayTasks.slice(0, 6).map(task => {
                  const c = getColor(task)
                  return (
                    <div key={task.id} style={{ width: 6, height: 6, borderRadius: '50%', background: c.border, opacity: task.done ? 0.3 : 1 }} />
                  )
                })}
              </div>
              {dayTasks.length > 0 && (
                <div style={{ fontSize: 9, color: 'var(--hint)', marginTop: 'auto' }}>
                  {dayTasks.filter(t => !t.done).length} left
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
