import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Environment variables with fallbacks
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://vcjrtkfnempqatvbrqrz.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZjanJ0a2ZuZW1wcWF0dmJycXJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY0NzA0MjQsImV4cCI6MjA2MjA0NjQyNH0.Yftey4dJ77ATPQ0aocqjM-Im0GWt8if5oPtlu4FLo9Y";

// Enhanced Supabase client with defense-grade configuration
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  },
  global: {
    headers: {
      'X-Client-Info': 'cryptipic-defense@1.0.0'
    }
  }
});

// Enhanced error handling and logging
export const supabaseWithLogging = {
  ...supabase,
  auth: {
    ...supabase.auth,
    signIn: async (credentials: any) => {
      try {
        console.log('[Auth] Attempting sign in...');
        const result = await supabase.auth.signInWithPassword(credentials);
        if (result.error) {
          console.error('[Auth] Sign in failed:', result.error.message);
        } else {
          console.log('[Auth] Sign in successful');
        }
        return result;
      } catch (error) {
        console.error('[Auth] Unexpected error:', error);
        throw error;
      }
    },
    signUp: async (credentials: any) => {
      try {
        console.log('[Auth] Attempting sign up...');
        const result = await supabase.auth.signUp(credentials);
        if (result.error) {
          console.error('[Auth] Sign up failed:', result.error.message);
        } else {
          console.log('[Auth] Sign up successful');
        }
        return result;
      } catch (error) {
        console.error('[Auth] Unexpected error:', error);
        throw error;
      }
    }
  }
};