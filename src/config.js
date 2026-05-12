const dotenv = require('dotenv');

function loadConfig() {
  const result = dotenv.config();
  if (result.error) {
    throw result.error;
  }
}

function getConfig() {
  return {
    anthropicApiKey: process.env.ANTHROPIC_API_KEY,
    supabaseUrl: process.env.SUPABASE_URL,
    supabaseKey: process.env.SUPABASE_KEY,
    whatsappToken: process.env.WHATSAPP_TOKEN
  };
}

module.exports = { loadConfig, getConfig };
