# Academic Planner AI

A smart semester and career planning assistant powered by AI.

## Features

- AI-powered academic planning using Google Gemini
- Goal tracking and management
- Progress visualization with charts
- Email notifications for goal reminders
- Firebase authentication

## Tech Stack

- **Frontend**: React, TypeScript, Vite, Tailwind CSS
- **Backend**: Node.js, Express.js
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth
- **AI**: Google Gemini API
- **Email**: Nodemailer with Gmail

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Firebase account
- Google Gemini API key
- Gmail account with App Password

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```
   GEMINI_API_KEY=your_gemini_api_key
   GMAIL_USER=your_gmail_address@gmail.com
   GMAIL_APP_PASSWORD=your_app_password
   ```

4. Add your Firebase service account key as `serviceAccountKey.json` in the root directory

5. Run the development servers:
   ```bash
   # Terminal 1: Frontend
   npm run dev
   
   # Terminal 2: Main API server
   node server.cjs
   
   # Terminal 3: Email server
   node emailServer.js
   ```

## Deployment

### Frontend (Firebase Hosting)
1. Install Firebase CLI: `npm install -g firebase-tools`
2. Login: `firebase login`
3. Initialize hosting: `firebase init hosting`
4. Build and deploy: `npm run build` then `firebase deploy`

### Backend (Render)
The backend consists of two services that can be deployed to Render:
1. Main API server (server.cjs)
2. Email server (emailServer.js)

Follow the configuration in `render.json` for easy deployment.

## Environment Variables

- `GEMINI_API_KEY` - Google Gemini API key
- `GMAIL_USER` - Gmail address for sending emails
- `GMAIL_APP_PASSWORD` - App password for Gmail (not your regular password)
- `serviceAccountBase64` - Base64 encoded Firebase service account key (for Render deployment)

## Learn More

- [Vite Documentation](https://vitejs.dev/guide/)
- [React Documentation](https://react.dev/)
- [Firebase Documentation](https://firebase.google.com/docs)
- [Google Gemini API](https://ai.google.dev/)