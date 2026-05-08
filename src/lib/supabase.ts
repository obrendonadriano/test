import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const missingConfigError = {
  message: 'Supabase não está configurado. Crie um arquivo .env com VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.',
};

const disabledResponse = () => Promise.resolve({ data: null, error: missingConfigError });
const disabledSelect = () => ({
  order: disabledResponse,
  eq: () => ({
    order: disabledResponse,
  }),
});
const disabledMutation = () => ({
  data: null,
  error: missingConfigError,
  select: () => ({
    single: disabledResponse,
  }),
  eq: disabledResponse,
});

const disabledSupabase = {
  from: () => ({
    insert: disabledMutation,
    select: disabledSelect,
    delete: () => ({
      eq: disabledResponse,
    }),
    update: disabledMutation,
  }),
} as unknown as ReturnType<typeof createClient>;

export const supabase = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey)
  : disabledSupabase;
