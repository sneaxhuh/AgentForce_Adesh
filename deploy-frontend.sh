#!/bin/bash
# Deployment script for Firebase Hosting

# Exit on any error
set -e

# Build the project
echo "Building the project..."
npm run build

# Deploy to Firebase Hosting
echo "Deploying to Firebase Hosting..."
firebase deploy --only hosting

echo "Frontend deployment complete!"