import { useState } from 'react'

const COLORS = {
  purple: { bg: '#EEEDFE', border: '#AFA9EC', text: '#534AB7' },
  blue:   { bg: '#E6F1FB', border: '#85B7EB', text: '#185FA5' },
  teal:   { bg: '#E1F5EE', border: '#5DCAA5', text: '#0F6E56' },
  coral:  { bg: '#FAECE7', border: '#F0997B', text: '#993C1D' },
  amber:  { bg: '#FAEEDA', border: '#EF9F27', text: '#854F0B' },
  pink:   { bg: '#FBEAF0', border: '#ED93B1', text: '#993556' },
  green:  { bg: '#EAF3DE', border: '#97C459', text: '#3B6D11' },
}

export const TAG_COLORS = {
  work:     'blue',
  personal: 'purple',
  urgent:   'coral',
  health:   'green',
}

export function getColor(task) {
  if (task.color && COLORS[task.color]) return COLORS[task.color]
  if (task.tag && TAG_COLORS[task.tag]) return COLORS[TAG_COLORS[task.tag]]
  return COLORS.purple
}

export function TaskCard({ task, dateKey, onToggle, onDelete, compact = false }) {
  const [hovered, setHovered] = useState(false)
  const c = getColor(task)

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: c.bg,
        border: `1px solid ${c.border}`,
        borderRadius: 8,
        padding: compact ? '6px 8px' : '8px 10px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: 8,
        opacity: task.done ? 0.5 : 1,
        transition: 'opacity 0.15s, box-shadow 0.15s',
        boxShadow: hovered ? `0 0 0 2px ${c.border}` : 'none',
        cursor: 'default',
      }}
    >
      {/* Checkbox */}
      <button
        onClick={() => onToggle(dateKey, task.id)}
        title={task.done ? 'Mark incomplete' : 'Mark done'}
        style={{
          width: compact ? 13 : 15,
          height: compact ? 13 : 15,
          borderRadius: 3,
          border: `1.5px solid ${c.border}`,
          background: task.done ? c.border : 'transparent',
          flexShrink: 0,
          marginTop: 2,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'background 0.15s',
          padding: 0,
        }}
      >
        {task.done && (
          <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
            <path d="M1.5 4L3.5 6L6.5 2" stroke={c.text} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </button>

      {/* Text body */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: compact ? 11 : 12,
          color: c.text,
          fontWeight: 500,
          lineHeight: 1.4,
          textDecoration: task.done ? 'line-through' : 'none',
          wordBreak: 'break-word',
        }}>
          {task.text}
        </div>
        {task.tag && (
          <div style={{
            display: 'inline-block',
            marginTop: 3,
            padding: '1px 6px',
            borderRadius: 4,
            fontSize: 10,
            fontWeight: 600,
            background: c.border + '55',
            color: c.text,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}>
            {task.tag}
          </div>
        )}
      </div>

      {/* Delete */}
      <button
        onClick={() => onDelete(dateKey, task.id)}
        title="Remove"
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: c.border,
          padding: 0,
          opacity: hovered ? 1 : 0,
          transition: 'opacity 0.15s',
          lineHeight: 1,
          fontSize: 14,
          flexShrink: 0,
        }}
      >
        ×
      </button>
    </div>
  )
}

export function AddTaskForm({ onSave, onCancel }) {
  const [text, setText] = useState('')
  const [tag, setTag] = useState('')
  const [color, setColor] = useState('')

  function handleSave() {
    const v = text.trim()
    if (!v) return
    onSave({ text: v, tag, color: color || (tag ? TAG_COLORS[tag] : 'purple') })
    setText(''); setTag(''); setColor('')
  }

  return (
    <div style={{
      background: 'var(--surface)',
      border: '1px solid var(--accent-mid)',
      borderRadius: 8,
      padding: '8px 10px',
      display: 'flex',
      flexDirection: 'column',
      gap: 6,
    }}>
      <input
        autoFocus
        value={text}
        onChange={e => setText(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') onCancel() }}
        placeholder="What needs to get done?"
        style={{ fontSize: 12, padding: '5px 8px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--card)', color: 'var(--text)', fontFamily: 'inherit', width: '100%', boxSizing: 'border-box' }}
      />
      <div style={{ display: 'flex', gap: 4 }}>
        <select
          value={tag}
          onChange={e => { setTag(e.target.value); if (!color && e.target.value) setColor(TAG_COLORS[e.target.value] || '') }}
          style={{ flex: 1, fontSize: 11, padding: '4px 6px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--card)', color: 'var(--text)', fontFamily: 'inherit' }}
        >
          <option value="">no tag</option>
          <option value="work">work</option>
          <option value="personal">personal</option>
          <option value="urgent">urgent</option>
          <option value="health">health</option>
        </select>
        {/* Color picker dots */}
        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          {Object.entries(COLORS).map(([name, c]) => (
            <button
              key={name}
              onClick={() => setColor(name)}
              title={name}
              style={{
                width: 14, height: 14, borderRadius: '50%',
                background: c.bg,
                border: color === name ? `2px solid ${c.text}` : `1.5px solid ${c.border}`,
                cursor: 'pointer', padding: 0, transition: 'transform 0.1s',
                transform: color === name ? 'scale(1.25)' : 'scale(1)',
              }}
            />
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 4 }}>
        <button onClick={handleSave} style={{ flex: 1, padding: '4px 8px', fontSize: 11, borderRadius: 6, border: 'none', background: 'var(--accent)', color: '#fff', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>Add</button>
        <button onClick={onCancel} style={{ flex: 1, padding: '4px 8px', fontSize: 11, borderRadius: 6, border: '1px solid var(--border)', background: 'none', color: 'var(--muted)', cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
      </div>
    </div>
  )
}

export { COLORS }
