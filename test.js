const SYSTEM_PROMPT = 'test';
const message = 'hi';
const GEMINI_API_KEY = 'AIzaSyCyGpMeiywKL5-cAybjoc9p3yDHWtBNSTY';

async function test() {
  const gContents = [];
  gContents.push({ role: 'user', parts: [{ text: message }] });

  const gReq = {
    system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
    contents: gContents
  };

  try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(gReq)
      });
      const data = await response.json();
      if (!response.ok) {
         console.error('ERROR DATA:', JSON.stringify(data, null, 2));
      } else {
         console.log('SUCCESS:', data.candidates[0].content.parts[0].text);
      }
  } catch (err) {
      console.error('FETCH ERR:', err.message);
  }
}
test();
