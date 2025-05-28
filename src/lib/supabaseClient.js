import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vngjdfckieblyyvdqsdt.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZuZ2pkZmNraWVibHl5dmRxc2R0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg0MDU1NzksImV4cCI6MjA2Mzk4MTU3OX0.PYt4pI8FjOV-iCjXR9yAyVuJ9LZuMKnKLNR7Ug3h8kc';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);