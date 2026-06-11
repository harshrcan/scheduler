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
      options: { redirectTo: window.location.origin }
    })
    if (error) { setError(error.message); setLoading(false) }
  }

  return (
    <div style={{
      height: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg)', fontFamily: 'var(--font-sans)',
    }}>
      {/* Logo */}
      <div style={{ marginBottom: 40, textAlign: 'center' }}>
        <div style={{ fontSize: 38, fontWeight: 800, color: 'var(--accent)', letterSpacing: '-2px' }}>
          dayframe
        </div>
        <div style={{ fontSize: 13, color: 'var(--hint)', marginTop: 6, letterSpacing: '0.02em' }}>
          plan your days, simply.
        </div>
      </div>

      {/* Card */}
      <div style={{
        background: 'var(--card)',
        border: '1px solid var(--border)',
        borderRadius: 16,
        padding: '36px 44px',
        width: 360,
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
        boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
      }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--text)', marginBottom: 6 }}>
            Welcome back
          </div>
          <div style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.6 }}>
            Sign in to access your planner and sync across all your devices.
          </div>
        </div>

        {/* Google button */}
        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
            padding: '11px 20px', borderRadius: 10, cursor: loading ? 'not-allowed' : 'pointer',
            border: '1px solid var(--border)', background: 'var(--card)',
            fontSize: 14, fontWeight: 500, color: 'var(--text)',
            fontFamily: 'inherit', width: '100%',
            transition: 'all 0.15s', opacity: loading ? 0.6 : 1,
          }}
          onMouseEnter={e => { if (!loading) e.currentTarget.style.background = 'var(--surface)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'var(--card)' }}
        >
          {/* Google SVG */}
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 002.38-5.88c0-.57-.05-.66-.15-1.18z"/>
            <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 01-7.18-2.54H1.83v2.07A8 8 0 008.98 17z"/>
            <path fill="#FBBC05" d="M4.5 10.52a4.8 4.8 0 010-3.04V5.41H1.83a8 8 0 000 7.18l2.67-2.07z"/>
            <path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 001.83 5.4L4.5 7.49a4.77 4.77 0 014.48-3.3z"/>
          </svg>
          {loading ? 'Redirecting to Google...' : 'Continue with Google'}
        </button>

        {error && (
          <div style={{
            fontSize: 12, color: '#993C1D', background: '#FAECE7',
            border: '1px solid #F0997B', borderRadius: 8, padding: '8px 12px',
          }}>
            {error}
          </div>
        )}

        <div style={{
          fontSize: 11, color: 'var(--hint)', textAlign: 'center',
          lineHeight: 1.7, borderTop: '1px solid var(--border)', paddingTop: 16,
        }}>
          No password needed · Your data is private<br/>and only visible to you
        </div>
      </div>
    </div>
  )
}
