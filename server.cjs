const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const cors = require('cors');
const admin = require('firebase-admin'); // Import firebase-admin

// Initialize Firebase Admin SDK
const serviceAccount = require('./serviceAccountKey.json'); // Path to your service account key

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const app = express();
const port = 3002;

app.use(express.json());

app.use(cors({
  origin: 'http://localhost:5173'
}));

// Paste your Gemini API key here
const GEMINI_API_KEY = "AIzaSyDkA5bwlAGVtQKMF02_GbHXA4qIv--lLtg"; // <-- Replace with your actual API key

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// Middleware to authenticate Firebase ID Token
async function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) return res.sendStatus(401); // No token

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken; // Attach decoded token to request
    next();
  } catch (error) {
    console.error('Error verifying Firebase ID token:', error);
    res.sendStatus(403); // Invalid token
  }
}

// Protected AI route
app.post('/api/ai', authenticateToken, async (req, res) => {
  try {
    const { prompt } = req.body;
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
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
