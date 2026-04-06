import { createClient } from '@supabase/supabase-js'

const env = window.__ENV__ || {}
const supabaseUrl = env.VITE_SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL || '/supabase'
const supabaseKey = env.VITE_SUPABASE_KEY || import.meta.env.VITE_SUPABASE_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)