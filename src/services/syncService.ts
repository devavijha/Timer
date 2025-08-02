import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function syncChangeToBackend(change: any) {
  // Example: handle different change types
  switch (change.type) {
    case 'ADD_TASK':
      return supabase.from('tasks').insert([change.payload]);
    case 'UPDATE_TASK':
      return supabase.from('tasks').update(change.payload).eq('id', change.payload.id);
    case 'DELETE_TASK':
      return supabase.from('tasks').delete().eq('id', change.payload.id);
    case 'ADD_HABIT':
      return supabase.from('habits').insert([change.payload]);
    case 'UPDATE_HABIT':
      return supabase.from('habits').update(change.payload).eq('id', change.payload.id);
    case 'DELETE_HABIT':
      return supabase.from('habits').delete().eq('id', change.payload.id);
    case 'ADD_MEDITATION_LOG':
      return supabase.from('meditation_logs').insert([change.payload]);
    case 'UPDATE_MEDITATION_LOG':
      return supabase.from('meditation_logs').update(change.payload).eq('id', change.payload.id);
    case 'DELETE_MEDITATION_LOG':
      return supabase.from('meditation_logs').delete().eq('id', change.payload.id);
    case 'SYNC_BIOMETRIC_DATA':
      return supabase.from('biometrics').insert([change.payload]);
    default:
      throw new Error('Unknown change type');
  }
}
