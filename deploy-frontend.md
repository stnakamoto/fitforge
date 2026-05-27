# Deploy FitForge Frontend to Vercel

## Quick Steps:

1. **Go to [Vercel.com](https://vercel.com)**
2. **Sign up with GitHub**
3. **Click "Add New Project"**
4. **Upload your `client` folder**

## Build Settings:
- **Framework Preset**: Create React App
- **Root Directory**: `client`
- **Build Command**: `npm run build`
- **Output Directory**: `build`
- **Install Command**: `npm install`

## Environment Variables to Add in Vercel:

```
REACT_APP_API_URL=https://your-backend-url.railway.app/api
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
```

## Result:
Your frontend will be live at: `https://fitforge.vercel.app`

## After Deployment:
1. Update the REACT_APP_API_URL with your actual Railway backend URL
2. Test login and registration
3. Your FitForge app is live! 🎉