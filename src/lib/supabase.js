import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || import.meta.env.SUPABASE_URL || 'https://supabase-evo.portfolioshowcase.tech'
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY || import.meta.env.SUPABASE_KEY || 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTc3NTA3NTEwMCwiZXhwIjo0OTMwNzQ4NzAwLCJyb2xlIjoiYW5vbiJ9.8XuHbebkSnjpVGToKBFvQAaoe7Mq3Pl4dxobY5Z5KeU'

console.log('Supabase URL:', supabaseUrl)

export const supabase = createClient(supabaseUrl, supabaseKey)