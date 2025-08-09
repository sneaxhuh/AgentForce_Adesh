import express from 'express';
import nodemailer from 'nodemailer';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 3003;

app.use(cors({
  origin: 'http://localhost:5173'
}));
app.use(express.json());

// Nodemailer transporter setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER, // Your Gmail address
    pass: process.env.GMAIL_APP_PASSWORD, // Your generated App password
  },
});

// API endpoint to send email
app.post('/send-reminder', async (req, res) => {
  const { subject, text, html } = req.body;
  const to = process.env.RECIPIENT_EMAIL;

  if (!to) {
    return res.status(400).json({ error: 'Recipient email not configured on server.' });
  }

  if (!subject || (!text && !html)) {
    return res.status(400).json({ error: 'Missing required email fields' });
  }

  try {
    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to,
      subject,
      text,
      html,
    });
    res.status(200).json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ error: 'Failed to send email' });
  }
});

app.listen(port, () => {
  console.log(`Email server listening at http://localhost:${port}`);
});