# Deployment Guide

Follow these steps to deploy your full-stack application.

## Prerequisites

1.  **Git**: Ensure Git is installed and initialized.
2.  **GitHub Account**: Create a new repository.
3.  **Render Account**: For backend deployment.
4.  **Netlify Account**: For frontend deployment.
5.  **MongoDB Atlas Account**: You already have this!

## Step 1: Push to GitHub

1.  Create a new repository on GitHub (e.g., `sparky-data-hub`).
2.  Run the following commands in your terminal:
    ```bash
    git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
    git branch -M main
    git push -u origin main
    ```

## Step 2: Deploy Backend to Render

1.  Log in to [Render](https://render.com/).
2.  Click "New +" -> "Web Service".
3.  Connect your GitHub repository.
4.  Configure the service:
    -   **Name**: `sparky-backend` (or similar)
    -   **Root Directory**: `server`
    -   **Build Command**: `npm install`
    -   **Start Command**: `node index.js`
    -   **Instance Type**: Free
5.  **Environment Variables**:
    -   Key: `MONGODB_URI`
    -   Value: `mongodb+srv://poovarasan:poovarasan2005@poovarasan2005.6rjew3m.mongodb.net/?appName=poovarasan2005`
    -   Key: `PORT`
    -   Value: `5000` (optional but good practice)
6.  Click **Create Web Service**.
7.  Wait for deployment to finish. Copy the **Service URL** (e.g., `https://sparky-backend.onrender.com`).

## Step 3: Configure Frontend for Production

1.  Open `netlify.toml` in your project root.
2.  Update the URL in the `redirects` section:
    ```toml
    [[redirects]]
      from = "/api/*"
      to = "https://YOUR_RENDER_SERVICE_URL/api/:splat"  <-- Paste your Render URL here!
      status = 200
      force = true
    ```
3.  Commit and push this change:
    ```bash
    git add netlify.toml
    git commit -m "Update API URL for production"
    git push
    ```

## Step 4: Deploy Frontend to Netlify

1.  Log in to [Netlify](https://www.netlify.com/).
2.  Click "Add new site" -> "Import from Git".
3.  Connect your GitHub repository.
4.  Configure build settings:
    -   **Build command**: `npm run build`
    -   **Publish directory**: `dist`
5.  Click **Deploy site**.

## Verification

Visit your Netlify URL. The application should load, and data operations (uploading datasets) should work by communicating with your Render backend and MongoDB Atlas key.
