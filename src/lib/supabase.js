import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || supabaseUrl === 'https://your-project.supabase.co') {
  console.warn(
    '⚠️  Supabase not configured yet.\n' +
    'Copy .env.example → .env and fill in your project URL and anon key.\n' +
    'Running in LOCAL-ONLY mode (localStorage only, no sync).'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
export const isSupabaseConfigured =
  supabaseUrl && supabaseUrl !== 'https://your-project.supabase.co'
