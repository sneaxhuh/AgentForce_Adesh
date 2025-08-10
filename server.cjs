const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const cors = require('cors');
const admin = require('firebase-admin'); // Import firebase-admin
const axios = require('axios'); // Import axios
require('dotenv').config(); 

// Initialize Firebase Admin SDK
let serviceAccount;
if (process.env.serviceAccountBase64) {
  // Use service account from environment variable (for Render deployment)
  const serviceAccountJson = Buffer.from(process.env.serviceAccountBase64, 'base64').toString('utf8');
  serviceAccount = JSON.parse(serviceAccountJson);
} else {
  // Use local service account file (for local development)
  serviceAccount = require('./serviceAccountKey.json');
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const app = express();
const port = 3002;

app.use(express.json());

app.use(cors({
  origin: '*' // Allow all origins for debugging
}));

// Paste your Gemini API key here
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;// <-- Replace with your actual API key

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

// New route to get user's goals
app.get('/api/goals', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.uid;
    const db = admin.firestore();
    const goalsRef = db.collection('users').doc(userId).collection('goals');
    const snapshot = await goalsRef.get();
    
    if (snapshot.empty) {
      return res.status(200).json({ message: 'No goals found for this user.' });
    }
    
    const goals = [];
    snapshot.forEach(doc => {
      goals.push({ id: doc.id, ...doc.data() });
    });
    
    res.status(200).json(goals);
  } catch (error) {
    console.error('Error fetching goals:', error);
    res.status(500).json({ error: 'Failed to fetch goals' });
  }
});

// New route to send goal reminders
app.post('/api/send-goal-reminders', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.uid;
    const userEmail = req.user.email; // Assuming user's email is in the token
    const db = admin.firestore();
    const goalsRef = db.collection('users').doc(userId).collection('goals');
    const snapshot = await goalsRef.get();
    
    let emailHtml = '<h1>Your Goal Status</h1>';
    if (snapshot.empty) {
      emailHtml += '<p>You have no pending goals at the moment.</p>';
    } else {
      emailHtml += '<ul>';
      snapshot.forEach(doc => {
        const goal = doc.data();
        emailHtml += `<li>${goal.title}: ${goal.completed ? 'Completed' : 'Pending'}</li>`;
      });
      emailHtml += '</ul>';
    }

    // Send email using the email server
    await axios.post('https://academic-planner-email.onrender.com/send-reminder', {
      to: userEmail,
      subject: 'Your Goal Status Reminder',
      html: emailHtml,
    });
    
    res.status(200).json({ message: 'Reminder email sent successfully' });
  } catch (error) {
    console.error('Error sending goal reminders:', error);
    res.status(500).json({ error: 'Failed to send reminder email' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});