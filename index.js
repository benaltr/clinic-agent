require('dotenv').config();
const express = require('express');
const axios = require('axios');
const { chat } = require('./agent');

const app = express();
app.use(express.json());

const VERIFY_TOKEN = 'mytoken123';
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;

// Webhook verification
app.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === VERIFY_TOKEN) {
    console.log('Webhook verified');
    return res.status(200).send(challenge);
  }
  res.sendStatus(403);
});

// Receive messages
app.post('/webhook', async (req, res) => {
  const body = req.body;

  if (body.object !== 'whatsapp_business_account') return res.sendStatus(404);

  const entry = body.entry?.[0]?.changes?.[0]?.value;
  const message = entry?.messages?.[0];

  if (!message || message.type !== 'text') return res.sendStatus(200);

  const from = message.from;
  const text = message.text.body;

  console.log(`Message from ${from}: ${text}`);

  res.sendStatus(200);

  chat(text, from)
    .then(reply => sendWhatsAppMessage(from, reply))
    .catch(err => console.error('Error handling message:', err.message));
});

async function sendWhatsAppMessage(to, text) {
  await axios.post(
    `https://graph.facebook.com/v19.0/${PHONE_NUMBER_ID}/messages`,
    {
      messaging_product: 'whatsapp',
      to,
      type: 'text',
      text: { body: text }
    },
    {
      headers: {
        Authorization: `Bearer ${WHATSAPP_TOKEN}`,
        'Content-Type': 'application/json'
      }
    }
  );
}

app.listen(3000, () => console.log('Webhook listening on port 3000'));
