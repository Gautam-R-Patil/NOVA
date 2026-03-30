const { GoogleGenAI } = require('@google/genai');

async function test() {
  const ai = new GoogleGenAI({ apiKey: 'AIzaSyCyGpMeiywKL5-cAybjoc9p3yDHWtBNSTY' });
  const response = await ai.models.generateContent({
    model: 'gemini-1.5-flash',
    contents: 'hi',
    config: { systemInstruction: 'you are a helpful assistant' }
  });
  console.log(response.text);
}
test().catch(console.error);
