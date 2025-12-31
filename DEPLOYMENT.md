# Production Deployment Guide

## 🚀 Quick Start

This guide will help you deploy LegalVault to production.

---

## 📦 Part 1: MongoDB Atlas Setup

### 1. Create Account

- Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- Sign up for free account

### 2. Create Cluster

- Click "Build a Database"
- Select **FREE** M0 tier
- Choose region closest to you
- Click "Create Cluster"

### 3. Create Database User

- Go to "Database Access"
- Click "Add New Database User"
- Choose "Password" authentication
- **Username**: `legalvault`
- **Password**: Generate strong password (save it!)
- User Privileges: "Read and write to any database"
- Click "Add User"

### 4. Whitelist All IPs

- Go to "Network Access"
- Click "Add IP Address"
- Click "Allow Access From Anywhere" (0.0.0.0/0)
- Click "Confirm"

### 5. Get Connection String

- Go to "Database" → "Connect"
- Click "Connect your application"
- Copy connection string
- Replace `<password>` with your actual password
- Replace `<dbname>` with `legalvault`

**Example:**

```
mongodb+srv://legalvault:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/legalvault?retryWrites=true&w=majority
```

Save this connection string! ✅

---

## 🖥️ Part 2: Backend Deployment (Render)

### 1. Push to GitHub

```bash
cd backend
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/legalvault-backend.git
git push -u origin main
```

### 2. Create Render Account

- Go to [Render](https://render.com)
- Sign up with GitHub

### 3. Create Web Service

- Click "New +" → "Web Service"
- Connect your GitHub repository
- Select `legalvault-backend` repo
- **Name**: `legalvault-backend`
- **Region**: Choose closest to you
- **Branch**: `main`
- **Root Directory**: (leave blank if backend is root, or enter `backend`)
- **Runtime**: Node
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Instance Type**: Free

### 4**. Set Environment Variables**

Click "Advanced" → "Add Environment Variable"

Add these one by one:

```
MONGODB_URI = mongodb+srv://legalvault:YOUR_PASSWORD@...
JWT_SECRET = (click "Generate" button)
JWT_EXPIRE = 7d
GOOGLE_CLIENT_ID = 200000113080-43o3nsgqp2d007v508elm6h0uu1g7tnh.apps.googleusercontent.com
NODE_ENV = production
PORT = 5000
FRONTEND_URL = (leave empty for now, will add after Vercel)
```

### 5. Deploy

- Click "Create Web Service"
- Wait for deployment (5-10 minutes)
- Copy your backend URL (e.g., `https://legalvault-backend.onrender.com`)

✅ Backend deployed!

---

## 🌐 Part 3: Frontend Deployment (Vercel)

### 1. Push to GitHub

```bash
cd frontend
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/legalvault-frontend.git
git push -u origin main
```

### 2. Create Vercel Account

- Go to [Vercel](https://vercel.com)
- Sign up with GitHub

### 3. Import Project

- Click "Add New..." → "Project"
- Import `legalvault-frontend` repo
- **Framework Preset**: Vite
- **Root Directory**: (leave blank if frontend is root, or select `frontend`)
- Click "Environment Variables"

### 4. Add Environment Variables

```
VITE_API_URL = https://legalvault-backend.onrender.com/api
VITE_GOOGLE_CLIENT_ID = 200000113080-43o3nsgqp2d007v508elm6h0uu1g7tnh.apps.googleusercontent.com
```

### 5. Deploy

- Click "Deploy"
- Wait for deployment (2-3 minutes)
- Copy your frontend URL (e.g., `https://legalvault.vercel.app`)

✅ Frontend deployed!

---

## 🔄 Part 4: Final Configuration

### 1. Update Backend with Frontend URL

- Go to Render dashboard
- Select your backend service
- Go to "Environment"
- Update `FRONTEND_URL` = `https://legalvault.vercel.app`
- Service will auto-redeploy

### 2. Update Google OAuth

- Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
- Edit your OAuth Client ID
- **Authorized JavaScript origins**, add:
  - `https://legalvault.vercel.app`
- **Authorized redirect URIs**, add:
  - `https://legalvault.vercel.app`
- Click "Save"

---

## ✅ Test Your Deployment

Visit `https://legalvault.vercel.app` and test:

- ✅ Manual signup
- ✅ Manual login
- ✅ Google signup
- ✅ Google login
- ✅ Create case
- ✅ View case
- ✅ Create note/speech
- ✅ Upload document (Note: Files will be lost on Render restart with free tier)

---

## ⚠️ Important Notes

### File Uploads

- **Free Render tier**: Uploaded files are deleted when service restarts
- **Solution**: Upgrade to Render paid plan ($7/month) OR use Cloudinary (recommended)

### Render Free Tier Limits

- Sleeps after 15 minutes of inactivity
- First request after sleep takes ~30 seconds
- 750 hours/month free

### MongoDB Atlas Free Tier

- 512MB storage
- Shared cluster
- Perfect for testing/small apps

---

## 🔧 Troubleshooting

### Backend won't start

- Check Render logs for errors
- Verify MongoDB connection string
- Ensure all environment variables are set

### Frontend can't connect to backend

- Check `VITE_API_URL` in Vercel
- Verify CORS settings in backend
- Check browser console for errors

### Google OAuth not working

- Verify authorized origins include production URLs
- Check `GOOGLE_CLIENT_ID` matches in both frontend & backend
- Clear browser cache and try again

### MongoDB connection failed

- Check IP whitelist includes 0.0.0.0/0
- Verify username/password in connection string
- Test connection string locally first

---

## 📊 Monitoring

- **Render**: Dashboard shows logs and metrics
- **Vercel**: Analytics tab shows traffic
- **MongoDB Atlas**: Metrics tab shows database usage

---

## 🎉 Success!

Your LegalVault application is now live in production!

**Backend**: `https://your-backend.onrender.com`  
**Frontend**: `https://your-app.vercel.app`  
**Database**: MongoDB Atlas

Need help? Check the logs in Render/Vercel dashboards.
