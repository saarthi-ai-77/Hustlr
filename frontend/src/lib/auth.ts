import { supabase } from './supabase'
import type { AuthResponse, UserCredentials } from './api'

export interface AuthUser {
  id: string
  email: string
}

// Sign up with email and password
export async function signUp(credentials: UserCredentials): Promise<AuthResponse> {
  const { data, error } = await supabase.auth.signUp({
    email: credentials.email,
    password: credentials.password,
  })

  if (error) {
    throw new Error(error.message)
  }

  if (!data.user) {
    throw new Error('Failed to create user')
  }

  return {
    access_token: data.session?.access_token || '',
    token_type: 'bearer',
    user_id: data.user.id
  }
}

// Sign in with email and password
export async function signIn(credentials: UserCredentials): Promise<AuthResponse> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: credentials.email,
    password: credentials.password,
  })

  if (error) {
    throw new Error(error.message)
  }

  if (!data.user) {
    throw new Error('Failed to sign in')
  }

  return {
    access_token: data.session?.access_token || '',
    token_type: 'bearer',
    user_id: data.user.id
  }
}

// Sign in with social providers (Google, GitHub)
export async function signInWithSocial(provider: 'google' | 'github'): Promise<void> {
  const { error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${window.location.origin}/dashboard`
    }
  })

  if (error) {
    throw new Error(error.message)
  }
}

// Sign out
export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut()
  if (error) {
    throw new Error(error.message)
  }
}

// Get current user
export async function getCurrentUser(): Promise<AuthUser | null> {
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error) {
    console.error('Error getting current user:', error)
    return null
  }

  if (!user) {
    return null
  }

  return {
    id: user.id,
    email: user.email || ''
  }
}

// Listen to auth state changes
export function onAuthStateChange(callback: (user: AuthUser | null) => void) {
  return supabase.auth.onAuthStateChange((event, session) => {
    if (session?.user) {
      callback({
        id: session.user.id,
        email: session.user.email || ''
      })
    } else {
      callback(null)
    }
  })
}