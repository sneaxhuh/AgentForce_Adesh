# Academic Planner AI

A smart semester and career planning assistant powered by AI.

## Features

- AI-powered academic planning using Google Gemini
- Goal tracking and management
- Progress visualization with charts
- Email notifications for goal reminders
- Firebase authentication

## Tech Stack

- **Frontend**: React, TypeScript, Vite, Tailwind CSS, Recharts, Framer Motion, html2canvas
- **Backend**: Node.js, Express.js, Axios
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth
- **AI**: Google Gemini API
- **Email**: Nodemailer with Gmail

## Project Structure

```
/
├── api/                # Serverless functions for Vercel deployment
├── public/             # Static assets
├── src/
│   ├── assets/         # Images and other assets
│   ├── components/     # React components
│   ├── contexts/       # React context providers
│   ├── hooks/          # Custom React hooks
│   ├── pages/          # Application pages
│   ├── services/       # Services for interacting with APIs
│   ├── styles/         # CSS and other styling files
│   └── App.tsx         # Main application component
├── .env                # Environment variables for local development
├── .env.production     # Environment variables for production
├── vercel.json         # Vercel deployment configuration
├── package.json        # Project dependencies and scripts
└── README.md           # This file
```

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Firebase account
- Google Gemini API key
- Gmail account with App Password

### Installation

1.  Clone the repository:

    ```bash
    git clone https://github.com/your-username/academic-planner-ai.git
    ```

2.  Install the dependencies:

    ```bash
    npm install
    ```

3.  Create a `.env` file in the root directory and add the following environment variables:

    ```
    GEMINI_API_KEY=your_gemini_api_key
    GMAIL_USER=your_gmail_address@gmail.com
    GMAIL_APP_PASSWORD=your_app_password
    ```

4.  Create a `serviceAccountKey.json` file in the root directory with your Firebase service account credentials.

5.  Run the development servers:

    ```bash
    # Terminal 1: Frontend
    npm run dev

    # Terminal 2: Main API server
    node server.cjs

    # Terminal 3: Email server
    node emailServer.js
    ```

## API Endpoints

The backend is composed of two Express servers:

### Main API Server (`server.cjs`)

-   **`POST /api/ai`**: Generates content using the Gemini API. (Protected)
-   **`GET /api/goals`**: Fetches the user's goals from Firestore. (Protected)
-   **`POST /api/send-goal-reminders`**: Sends goal reminders to the user's email. (Protected)

### Email Server (`emailServer.js`)

-   **`POST /send-reminder`**: Sends an email using Nodemailer.

## Context Providers

### `AuthContext`

-   Manages user authentication state using Firebase Authentication.
-   Provides the `user`, `token`, `isAuthenticated`, and `loading` state.

### `AppContext`

-   Manages the main application state.
-   Provides the `userProfile`, `semesterPlans`, `weeklyGoals`, and `notes` state.
-   Fetches and updates data in Firestore.

## Deployment

This project is configured for deployment on Vercel. The `vercel.json` file contains the necessary configuration for the serverless functions and rewrites.

To deploy to Vercel, connect your Git repository to a new Vercel project. Vercel will automatically detect the `vercel.json` file and deploy the project accordingly.

Make sure to set the following environment variables in your Vercel project settings:

-   `GEMINI_API_KEY`
-   `GMAIL_USER`
-   `GMAIL_APP_PASSWORD`
-   `serviceAccountKey.json` (as a secret file)

## Contributing

Contributions are welcome! Please follow these steps to contribute:

1.  Fork the repository.
2.  Create a new branch (`git checkout -b feature/your-feature`).
3.  Make your changes.
4.  Commit your changes (`git commit -m 'Add some feature'`).
5.  Push to the branch (`git push origin feature/your-feature`).
6.  Open a pull request.
