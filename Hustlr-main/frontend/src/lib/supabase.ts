import { createClient } from '@supabase/supabase-js'
import { RealtimeChannel } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'http://127.0.0.1:54321'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
})

// Real-time subscription helpers
export const subscribeToTable = (
  table: string,
  callback: (payload: any) => void,
  userId?: string
): RealtimeChannel => {
  let channel = supabase.channel(`${table}_changes`)

  if (userId) {
    channel = channel.on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: table,
        filter: `user_id=eq.${userId}`,
      },
      callback
    )
  } else {
    channel = channel.on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: table,
      },
      callback
    )
  }

  channel.subscribe()
  return channel
}

// Types for our database
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          created_at?: string
          updated_at?: string
        }
      }
      clients: {
        Row: {
          id: string
          name: string
          company: string
          email: string
          linkedin: string | null
          twitter: string | null
          is_ghosted: boolean
          user_id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          company?: string
          email: string
          linkedin?: string | null
          twitter?: string | null
          is_ghosted?: boolean
          user_id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          company?: string
          email?: string
          linkedin?: string | null
          twitter?: string | null
          is_ghosted?: boolean
          user_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          title: string
          description: string
          status: 'Urgent AF' | 'Chillin\'' | 'Blocked'
          due_date: string | null
          user_id: string
          client_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string
          status?: 'Urgent AF' | 'Chillin\'' | 'Blocked'
          due_date?: string | null
          user_id: string
          client_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          status?: 'Urgent AF' | 'Chillin\'' | 'Blocked'
          due_date?: string | null
          user_id?: string
          client_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      invoices: {
        Row: {
          id: string
          amount: number
          due_date: string
          status: 'Paid' | 'Pending' | 'Overdue'
          project_id: string | null
          client_name: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          amount: number
          due_date: string
          status?: 'Paid' | 'Pending' | 'Overdue'
          project_id?: string | null
          client_name: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          amount?: number
          due_date?: string
          status?: 'Paid' | 'Pending' | 'Overdue'
          project_id?: string | null
          client_name?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}