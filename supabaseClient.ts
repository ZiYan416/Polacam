/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';

// Access environment variables using Vite's import.meta.env
// Fix: Added vite/client reference to resolve import.meta.env type error
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Supabase credentials missing! Cloud features will be disabled.");
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseAnonKey || 'placeholder'
);