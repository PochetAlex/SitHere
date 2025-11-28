import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

const SUPABASE_URL = (Constants.expoConfig?.extra?.SUPABASE_URL ?? process.env.EXPO_PUBLIC_SUPABASE_URL) as string | undefined;
const SUPABASE_ANON_KEY = (Constants.expoConfig?.extra?.SUPABASE_ANON_KEY ?? process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY) as string | undefined;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  // warn in dev if keys are not provided
  // Do not throw — allow the app to run so the user can add keys in app.json or env later
  // eslint-disable-next-line no-console
  console.warn('Supabase: missing SUPABASE_URL or SUPABASE_ANON_KEY in app config (expo.extra) or env');
}

export const supabase = createClient(SUPABASE_URL ?? '', SUPABASE_ANON_KEY ?? '', {
  auth: {
    storage: AsyncStorage,
    persistSession: true,
  },
});

export default supabase;