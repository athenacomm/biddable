import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://aohvglbdmnelrxkpjhca.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFvaHZnbGJkbW5lbHJ4a3BqaGNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1MTUwNzYsImV4cCI6MjA2MzA5MTA3Nn0.zk8EU_3uYFFI1TjMyIbOcuDkW8D3TUhky65kq5QhPVY'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
