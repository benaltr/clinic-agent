const { createClient } = require('@supabase/supabase-js');

function createSupabaseClient(url, key) {
  return createClient(url, key);
}

module.exports = { createSupabaseClient };
