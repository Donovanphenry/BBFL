import { createClient } from "@supabase/supabase-js";

const api_key = import.meta.env.VITE_REACT_APP_SUPABASE_API_KEY;
const api_url = import.meta.env.VITE_REACT_APP_SUPABASE_API_URL;
export const supabase = createClient(api_url, api_key);

