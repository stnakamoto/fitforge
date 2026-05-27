# FitForge Deployment Guide

## Quick Deployment Steps

### 1. Backend Deployment (Railway)

1. **Sign up at [Railway.app](https://railway.app)**
2. **Connect your GitHub repository**
3. **Create a new project** → Deploy from GitHub repo
4. **Add environment variables** in Railway dashboard:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/fitforge
   JWT_SECRET=your_super_secret_jwt_key_here
   NODE_ENV=production
   STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
   PORT=5000
   ```
5. **Deploy** - Railway will automatically build and deploy your backend

### 2. Database Setup (MongoDB Atlas)

1. **Sign up at [MongoDB Atlas](https://www.mongodb.com/atlas)**
2. **Create a free cluster**
3. **Create database user** with read/write permissions
4. **Get connection string** and add to Railway environment variables
5. **Whitelist Railway's IP** (or use 0.0.0.0/0 for all IPs)

### 3. Frontend Deployment (Vercel)

1. **Sign up at [Vercel.com](https://vercel.com)**
2. **Import your GitHub repository**
3. **Set build settings**:
   - Framework Preset: Create React App
   - Root Directory: `client`
   - Build Command: `npm run build`
   - Output Directory: `build`
4. **Add environment variables**:
   ```
   REACT_APP_API_URL=https://your-railway-app.railway.app
   REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_publishable_key
   ```
5. **Deploy** - Vercel will build and deploy your frontend

### 4. Domain Setup (Optional)

- **Custom Domain**: Add your domain in Vercel dashboard
- **SSL**: Automatically provided by Vercel
- **DNS**: Point your domain to Vercel's nameservers

## Alternative Deployment Options

### All-in-One Deployment (Render)
- Deploy both frontend and backend on Render
- Simpler setup but potentially slower

### Self-Hosted (VPS)
- Use DigitalOcean, Linode, or AWS EC2
- Requires more technical setup but full control

## Environment Variables Checklist

### Backend (Railway)
- [ ] MONGODB_URI
- [ ] JWT_SECRET
- [ ] NODE_ENV=production
- [ ] STRIPE_SECRET_KEY
- [ ] PORT=5000

### Frontend (Vercel)
- [ ] REACT_APP_API_URL
- [ ] REACT_APP_STRIPE_PUBLISHABLE_KEY

## Post-Deployment

1. **Test all features** on the live site
2. **Set up monitoring** (Railway provides basic monitoring)
3. **Configure custom domain** if desired
4. **Set up SSL certificates** (automatic with Vercel/Railway)

## Estimated Costs

- **Railway**: Free tier available, $5/month for production
- **Vercel**: Free tier available, $20/month for pro features
- **MongoDB Atlas**: Free tier (512MB), $9/month for 2GB
- **Total**: Can start completely free, ~$15-35/month for production

## Support

- Railway: [docs.railway.app](https://docs.railway.app)
- Vercel: [vercel.com/docs](https://vercel.com/docs)
- MongoDB: [docs.atlas.mongodb.com](https://docs.atlas.mongodb.com)