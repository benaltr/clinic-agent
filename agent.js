const OpenAI = require('openai');
const { createClient } = require('@supabase/supabase-js');

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

const SYSTEM_PROMPT = `אתה נציג שירות לקוחות של קליניקה לרפואה משלימה ובריאות הוליסטית בישראל, שמשוחח עם לקוחות דרך וואטסאפ.

כללים:
- ענה תמיד בעברית בלבד
- היה חם, אדיב ומקצועי
- שמור על תשובות קצרות ותמציתיות — זה וואטסאפ, לא אימייל
- אל תכתוב פסקאות ארוכות; עדיף משפט-שניים או נקודות קצרות
- תוכל לעזור עם: קביעת תורים, מידע על הקליניקה, שירותי הקליניקה, ושאלות כלליות על בריאות ורווחה
- אם נדרש מידע ספציפי שאין לך (כמו שעות פתיחה מדויקות או מחירים), הצע ללקוח להשאיר פרטים ותחזור אליו
- אל תמציא מידע רפואי ספציפי — הפנה לאנשי המקצוע בקליניקה`;

async function loadHistory(phoneNumber) {
  const { data, error } = await supabase
    .from('conversations')
    .select('role, content')
    .eq('phone_number', phoneNumber)
    .order('created_at', { ascending: true })
    .limit(10);

  if (error) throw error;
  return data;
}

async function saveMessage(phoneNumber, role, content) {
  const { error } = await supabase
    .from('conversations')
    .insert({ phone_number: phoneNumber, role, content });

  if (error) throw error;
}

async function chat(userMessage, phoneNumber) {
  await saveMessage(phoneNumber, 'user', userMessage);

  const history = await loadHistory(phoneNumber);

  const response = await client.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: SYSTEM_PROMPT },
      ...history
    ]
  });

  const reply = response.choices[0].message.content;
  await saveMessage(phoneNumber, 'assistant', reply);
  return reply;
}

module.exports = { chat };
