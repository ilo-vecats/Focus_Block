#!/bin/bash

# Script to push FocusBlock to GitHub
# Usage: ./push-to-github.sh YOUR_GITHUB_USERNAME REPO_NAME

if [ -z "$1" ] || [ -z "$2" ]; then
    echo "Usage: ./push-to-github.sh YOUR_GITHUB_USERNAME REPO_NAME"
    echo "Example: ./push-to-github.sh johndoe focusblock-enterprise"
    exit 1
fi

GITHUB_USERNAME=$1
REPO_NAME=$2
REPO_URL="https://github.com/${GITHUB_USERNAME}/${REPO_NAME}.git"

echo "🚀 Pushing FocusBlock to GitHub..."
echo "Repository: ${REPO_URL}"
echo ""

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "Initializing git repository..."
    git init
fi

# Check if remote exists
if git remote | grep -q "^origin$"; then
    echo "⚠️  Remote 'origin' already exists. Removing it..."
    git remote remove origin
fi

# Add remote
echo "Adding remote repository..."
git remote add origin "${REPO_URL}"

# Check git config
if [ -z "$(git config user.name)" ]; then
    echo "⚠️  Git user.name not set. Please set it with:"
    echo "   git config user.name 'Your Name'"
    exit 1
fi

if [ -z "$(git config user.email)" ]; then
    echo "⚠️  Git user.email not set. Please set it with:"
    echo "   git config user.email 'your.email@example.com'"
    exit 1
fi

# Stage all files
echo "Staging files..."
git add .

# Check if there are changes to commit
if git diff --staged --quiet; then
    echo "⚠️  No changes to commit. Files may already be committed."
    echo "Skipping commit..."
else
    echo "Creating commit..."
    git commit -m "Initial commit: Enterprise-grade FocusBlock

Features:
- Focus Session state machine (CREATED → SCHEDULED → ACTIVE → COMPLETED/CANCELLED)
- Role-Based Access Control (USER/ADMIN)
- Centralized error handling with custom error classes
- Server-side input validation using express-validator
- Activity logging and audit trail
- Pagination and filtering for all list endpoints
- Full-stack React + Express + MongoDB application
- Chrome extension for website blocking"
fi

# Rename branch to main
echo "Setting branch to main..."
git branch -M main

# Push to GitHub
echo "Pushing to GitHub..."
echo ""
echo "⚠️  Make sure you've created the repository on GitHub first!"
echo "   Go to: https://github.com/new"
echo "   Repository name: ${REPO_NAME}"
echo ""
read -p "Press Enter to continue or Ctrl+C to cancel..."

git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Successfully pushed to GitHub!"
    echo "   View your repo at: ${REPO_URL}"
else
    echo ""
    echo "❌ Push failed. Common issues:"
    echo "   1. Repository doesn't exist on GitHub - create it first"
    echo "   2. Authentication failed - check your GitHub credentials"
    echo "   3. Permission denied - make sure you have access to the repo"
    echo ""
    echo "   See PUSH_TO_GITHUB.md for troubleshooting"
fi

