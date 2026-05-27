# Deploy FitForge Backend to Railway

## Quick Steps:

1. **Go to [Railway.app](https://railway.app)**
2. **Sign up with GitHub**
3. **Click "Deploy from GitHub repo"**
4. **Upload your FitForge folder**

## Environment Variables to Add in Railway:

```
MONGODB_URI=mongodb+srv://satoshinakamoto:MyMongo27@cluster0.ghjavta.mongodb.net/fitforge?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=fitforge_super_secret_jwt_key_2024_change_in_production
NODE_ENV=production
PORT=5000
STRIPE_SECRET_KEY=your_stripe_secret_key_here
```

## Build Settings:
- **Start Command**: `npm start`
- **Build Command**: `npm install`
- **Root Directory**: `/` (root)

## Result:
Your backend will be live at: `https://your-app-name.railway.app`