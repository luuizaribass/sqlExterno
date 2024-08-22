// supabaseClient.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = '';
const SUPABASE_KEY = '';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  localStorage: AsyncStorage,
  detectSessionInUrl: false,
});
