# Deployment Guide

## Frontend Deployment (Firebase Hosting)

1. Install Firebase CLI globally:
   ```bash
   npm install -g firebase-tools
   ```

2. Login to Firebase:
   ```bash
   firebase login
   ```

3. Initialize Firebase in the project (if not already done):
   ```bash
   firebase init hosting
   ```
   When prompted, use `dist` as the public directory and configure as a single-page app.

4. Build and deploy the frontend:
   ```bash
   ./deploy-frontend.sh
   ```

   Or manually:
   ```bash
   npm run build
   firebase deploy --only hosting
   ```

## Backend Deployment (Render)

The backend consists of two services:
1. Main API server (server.cjs)
2. Email server (emailServer.js)

Both services are configured in `render.json` for deployment to Render.

### Steps:
1. Create an account at [Render](https://render.com)
2. Connect your GitHub repository to Render
3. Render will automatically detect the `render.json` configuration
4. Set the following environment variables in Render dashboard:
   - `GEMINI_API_KEY` - Your Google Gemini API key
   - `GMAIL_USER` - Your Gmail address
   - `GMAIL_APP_PASSWORD` - Your Gmail app password
   - For the service account key, you can either:
     a. Add it as an environment variable (base64 encoded)
     b. Upload it as a file in Render

### Environment Variables Required:
- `GEMINI_API_KEY` - Google Gemini API key
- `GMAIL_USER` - Gmail address for sending emails
- `GMAIL_APP_PASSWORD` - App password for Gmail (not your regular password)
- `serviceAccountBase64` - Base64 encoded Firebase service account key

## Updating API Endpoints

The frontend is already configured to use the deployed backend URLs through environment variables. When you build for production, it will automatically use the URLs specified in `.env.production`.