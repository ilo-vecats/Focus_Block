# GitHub Repository Setup Guide

Follow these steps to create a GitHub repository and push your FocusBlock project.

## Quick Setup Script

Run these commands in your terminal:

```bash
# Navigate to project directory
cd "/Users/user1/Desktop/focusblock-main 3"

# Initialize git repository
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: Enterprise-grade FocusBlock with state management, RBAC, error handling, validation, and audit logging"

# Create repository on GitHub first, then run:
# git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
# git branch -M main
# git push -u origin main
```

## Detailed Steps

### 1. Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `focusblock-enterprise` (or your preferred name)
3. Description: "Enterprise-grade productivity app with state management, RBAC, and comprehensive backend features"
4. Visibility: Public (recommended for portfolio) or Private
5. **DO NOT** initialize with README, .gitignore, or license (we already have these)
6. Click "Create repository"

### 2. Initialize Local Git Repository

```bash
cd "/Users/user1/Desktop/focusblock-main 3"
git init
```

### 3. Stage All Files

```bash
git add .
```

### 4. Create Initial Commit

```bash
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
```

### 5. Connect to GitHub

Replace `YOUR_USERNAME` and `YOUR_REPO_NAME` with your actual values:

```bash
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git push -u origin main
```

### 6. Verify

Visit your GitHub repository URL to verify all files are pushed:
```
https://github.com/YOUR_USERNAME/YOUR_REPO_NAME
```

## Repository Structure

Your repository should contain:

```
focusblock-enterprise/
├── backend/
│   ├── config/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── utils/
│   ├── .env.example
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── ...
├── focusblock-extension/
│   ├── background.js
│   ├── manifest.json
│   └── popup.html
├── .gitignore
├── README.md
├── DEPLOYMENT.md
└── render.yaml
```

## Next Steps

After pushing to GitHub:

1. **Follow DEPLOYMENT.md** to deploy on Render
2. **Update README.md** if needed with your repository URL
3. **Add topics/tags** on GitHub:
   - `nodejs`
   - `express`
   - `react`
   - `mongodb`
   - `state-machine`
   - `rbac`
   - `backend`
   - `full-stack`

## Troubleshooting

### "fatal: not a git repository"
- Make sure you're in the project directory
- Run `git init` first

### "remote origin already exists"
- Remove existing remote: `git remote remove origin`
- Add new remote: `git remote add origin YOUR_URL`

### "Permission denied"
- Check your GitHub credentials
- Use SSH instead: `git remote set-url origin git@github.com:USERNAME/REPO.git`
- Or use GitHub CLI: `gh repo create`

### Large files
- Check `.gitignore` is working
- Don't commit `node_modules/` or `.env` files

---

**Once pushed to GitHub, proceed to DEPLOYMENT.md for Render deployment instructions.**

