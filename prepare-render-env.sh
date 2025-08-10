#!/bin/bash
# Script to prepare environment variables for Render deployment

echo "Preparing environment variables for Render deployment..."

# Check if serviceAccountKey.json exists
if [ ! -f "serviceAccountKey.json" ]; then
  echo "Error: serviceAccountKey.json not found!"
  echo "Please add your Firebase service account key as serviceAccountKey.json"
  exit 1
fi

# Create base64 encoded service account key
echo "Creating base64 encoded service account key..."
SERVICE_ACCOUNT_BASE64=$(base64 -i serviceAccountKey.json | tr -d '\n')

# Save to .env.render file
echo "serviceAccountBase64=$SERVICE_ACCOUNT_BASE64" > .env.render

echo "Environment variables prepared in .env.render"
echo "Use these values when setting up your Render environment variables:"
echo ""
echo "SERVICE_ACCOUNT_BASE64: $SERVICE_ACCOUNT_BASE64"
echo ""
echo "Other required variables:"
echo "GEMINI_API_KEY: YOUR_GEMINI_API_KEY"
echo "GMAIL_USER: YOUR_GMAIL_ADDRESS"
echo "GMAIL_APP_PASSWORD: YOUR_GMAIL_APP_PASSWORD"