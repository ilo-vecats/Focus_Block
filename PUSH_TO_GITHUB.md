# Push to GitHub - Step by Step Guide

## Quick Commands (Copy & Paste)

### Step 1: Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `focusblock-enterprise` (or your preferred name)
3. Description: `Enterprise-grade productivity app with state management, RBAC, error handling, validation, and audit logging`
4. Visibility: **Public** (recommended for portfolio) or Private
5. **DO NOT** check "Initialize with README" (we already have one)
6. Click **"Create repository"**

### Step 2: Copy the Repository URL

After creating the repo, GitHub will show you commands. Copy the repository URL (it will look like):
```
https://github.com/YOUR_USERNAME/focusblock-enterprise.git
```

### Step 3: Run These Commands

Open your terminal in this directory and run:

```bash
# Make sure you're in the project directory
cd "/Users/user1/Desktop/focusblock-main 3"

# Set your git identity (if not already set)
git config user.name "Your Name"
git config user.email "your.email@example.com"

# Create initial commit
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

# Add remote repository (replace YOUR_USERNAME and REPO_NAME)
git remote add origin https://github.com/YOUR_USERNAME/focusblock-enterprise.git

# Rename branch to main (if needed)
git branch -M main

# Push to GitHub
git push -u origin main
```

## Alternative: Using GitHub CLI (if installed)

If you have GitHub CLI (`gh`) installed:

```bash
# Create repo and push in one command
gh repo create focusblock-enterprise --public --source=. --remote=origin --push
```

## Troubleshooting

### "remote origin already exists"
```bash
git remote remove origin
git remote add origin https://github.com/YOUR_USERNAME/focusblock-enterprise.git
```

### "Permission denied" or authentication errors
- Use SSH instead: `git remote set-url origin git@github.com:USERNAME/REPO.git`
- Or use GitHub Personal Access Token:
  1. Go to GitHub Settings → Developer settings → Personal access tokens
  2. Generate new token with `repo` permissions
  3. Use token as password when pushing

### "Large files" error
- Check `.gitignore` is working
- Don't commit `node_modules/` or `.env` files
- If needed: `git rm --cached large-file`

## Verify

After pushing, visit:
```
https://github.com/YOUR_USERNAME/focusblock-enterprise
```

You should see all your files there!

