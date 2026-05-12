const { getConfig } = require('./config');
const { createSupabaseClient } = require('./tools');
const { Anthropic } = require('@anthropic-ai/sdk');

async function initializeAgent(payload) {
  const config = getConfig();
  const client = new Anthropic({ apiKey: config.anthropicApiKey });
  const supabase = createSupabaseClient(config.supabaseUrl, config.supabaseKey);

  // Example placeholder logic for handling an incoming WhatsApp message
  const userMessage = payload.message || 'Hello';
  const response = await client.completions.create({
    model: 'claude-3.5',
    prompt: `You are a clinic assistant. Respond to the following message:\n${userMessage}`,
    max_tokens_to_sample: 300
  });

  // Placeholder: store or use Supabase as needed
  await supabase.from('messages').insert([{ message: userMessage, response: response.completion }]);

  return { reply: response.completion };
}

module.exports = { initializeAgent };
