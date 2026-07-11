import { createClient } from '@supabase/supabase-js'

// Public anon key — safe to expose client-side, access is scoped by RLS policies
// on the `app_state` table (see supabase/schema.sql).
const SUPABASE_URL = 'https://eecivsunrluqaoufikiq.supabase.co'
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVlY2l2c3Vucmx1cWFvdWZpa2lxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM3ODIwODksImV4cCI6MjA5OTM1ODA4OX0.CAn0ERVw_NkyVskKe9ySMxfkEdJogBrm1yRLiu49hvc'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
