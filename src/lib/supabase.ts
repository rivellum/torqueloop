import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

let supabase: SupabaseClient

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    'Missing Supabase environment variables. Database features will be unavailable.'
  )
  supabase = createClient('https://placeholder.supabase.co', 'placeholder-key')
} else {
  supabase = createClient(supabaseUrl, supabaseAnonKey)
}

export { supabase }
