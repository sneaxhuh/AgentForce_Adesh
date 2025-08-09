
const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const cors = require('cors');

const app = express();
const port = 3002;

app.use(express.json());

app.use(cors({
  origin: 'http://localhost:5173'
}));

// Directly use the API key (for testing purposes only - DO NOT DO THIS IN PRODUCTION)
const GEMINI_API_KEY = 'AIzaSyC6nmlR4fkXP3p517mpV8cPnpcy25S1jAQ';
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

app.post('/api/ai', async (req, res) => {
  try {
    const { prompt } = req.body;
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash"});
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    res.json({ text });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to generate content' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
