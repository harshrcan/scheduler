import { useState } from 'react'
import { supabase } from '../lib/supabase'

export function Auth() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function handleGoogleLogin() {
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin
      }
    })
    if (error) { setError(error.message); setLoading(false) }
  }

  return (
    <div style={{
      height: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg)', fontFamily: 'var(--font-sans)',
      gap: 24,
    }}>
      <div style={{ textAlign: 'center', marginBottom: 8 }}>
        <div style={{ fontSize: 32, fontWeight: 700, color: 'var(--accent)', letterSpacing: '-1px', marginBottom: 8 }}>
          dayframe
        </div>
        <div style={{ fontSize: 14, color: 'var(--muted)' }}>
          Your personal time planner
        </div>
      </div>

      <div style={{
        background: 'var(--card)', border: '1px solid var(--border)',
        borderRadius: 14, padding: '32px 40px', display: 'flex',
        flexDirection: 'column', alignItems: 'center', gap: 16,
        minWidth: 300,
      }}>
        <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--text)', marginBottom: 4 }}>
          Sign in to sync across devices
        </div>

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '10px 20px', borderRadius: 8, cursor: 'pointer',
            border: '1px solid var(--border)', background: 'var(--card)',
            fontSize: 14, fontWeight: 500, color: 'var(--text)',
            fontFamily: 'inherit', width: '100%', justifyContent: 'center',
            transition: 'background 0.15s', opacity: loading ? 0.6 : 1,
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'var(--surface)'}
          onMouseLeave={e => e.currentTarget.style.background = 'var(--card)'}
        >
          <svg width="18" height="18" viewBox="0 0 18 18">
            <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 002.38-5.88c0-.57-.05-.66-.15-1.18z"/>
            <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 01-7.18-2.54H1.83v2.07A8 8 0 008.98 17z"/>
            <path fill="#FBBC05" d="M4.5 10.52a4.8 4.8 0 010-3.04V5.41H1.83a8 8 0 000 7.18l2.67-2.07z"/>
            <path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 001.83 5.4L4.5 7.49a4.77 4.77 0 014.48-3.3z"/>
          </svg>
          {loading ? 'Redirecting...' : 'Continue with Google'}
        </button>

        {error && (
          <div style={{ fontSize: 12, color: '#993C1D', textAlign: 'center' }}>{error}</div>
        )}

        <div style={{ fontSize: 11, color: 'var(--hint)', textAlign: 'center', lineHeight: 1.6 }}>
          No password needed. Your data is<br/>private and only visible to you.
        </div>
      </div>
    </div>
  )
}
