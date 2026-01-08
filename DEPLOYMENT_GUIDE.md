# Frontend Deployment Guide - Render

This guide will walk you through deploying your React frontend to Render and connecting it to your backend API and database.

## Prerequisites

1. Your backend API is already deployed on Render
2. Your database is set up on Render
3. You have a Render account

## Step 1: Update Your Repository

Make sure all changes are committed to your Git repository:

```bash
git add .
git commit -m "Configure frontend for Render deployment"
git push origin main
```

## Step 2: Deploy on Render

### Option A: Using Render Dashboard (Recommended)

1. **Log in to Render Dashboard**
   - Go to https://dashboard.render.com
   - Log in with your GitHub/GitLab/Bitbucket account

2. **Create New Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select the `construction_site` repository
   - Configure the service:

   **Service Configuration:**
   - **Name**: `construction-site-frontend`
   - **Environment**: `Static Site`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`

3. **Environment Variables:**
   - `VITE_API_URL`: `https://construction-site-api.onrender.com/api`
   - `VITE_APP_ENV`: `production`

4. **Advanced Settings**:
   - **Auto-Deploy**: Yes (enabled by default)
   - **Custom Domain**: Optional (e.g., `construction-site-frontend.onrender.com`)

### Option B: Using render.yaml (Already Configured)

If you've already configured `render.yaml` in your root directory:

1. Go to Render Dashboard
2. Click "New +" → "Blueprint"
3. Connect your repository
4. Render will automatically detect and deploy both frontend and backend

## Step 3: Configure CORS

Your backend CORS is already configured to accept requests from the frontend. The allowed origins include:
- `https://construction-site-frontend.onrender.com`
- `https://construction-site-frontend-8llr.onrender.com`

## Step 4: Test the Deployment

1. **Wait for Deployment**: Render will build and deploy your frontend
2. **Access Your App**: Visit `https://construction-site-frontend.onrender.com`
3. **Test Functionality**:
   - Try to register a new user
   - Login with existing credentials
   - Navigate through the application
   - Test API calls

## Step 5: Troubleshooting

### Common Issues and Solutions:

#### 1. CORS Errors
**Problem**: Browser shows CORS errors
**Solution**: 
- Check that the frontend URL is in the backend CORS allowed origins
- Verify the backend is running and accessible

#### 2. API Connection Issues
**Problem**: Frontend can't connect to backend
**Solution**:
- Verify `VITE_API_URL` is correctly set
- Check that the backend is deployed and running
- Test the backend directly: `https://construction-site-api.onrender.com/health`

#### 3. Build Failures
**Problem**: Frontend build fails
**Solution**:
- Check the build logs in Render Dashboard
- Ensure all dependencies are in package.json
- Verify the build command: `npm install && npm run build`

#### 4. 404 Errors on Routes
**Problem**: Refreshing pages shows 404
**Solution**: This is handled by the rewrite rules in render.yaml

## Step 6: Environment Variables Reference

### Frontend (.env.production)
```
VITE_API_URL=https://construction-site-api.onrender.com/api
VITE_APP_ENV=production
```

### Backend Environment Variables (Already Set)
```
NODE_ENV=production
PORT=10000
DATABASE_URL=postgresql://...
JWT_SECRET=auto-generated
FRONTEND_URL=https://construction-site-frontend.onrender.com
SQL_LOGGING=false
```

## Step 7: Custom Domain (Optional)

If you want to use a custom domain:

1. **In Render Dashboard**:
   - Go to your frontend service
   - Click "Custom Domains"
   - Add your domain (e.g., `app.yourdomain.com`)

2. **DNS Configuration**:
   - Add CNAME record pointing to `cname.render.com`

3. **Update CORS**:
   - Add your custom domain to backend CORS allowed origins

## Step 8: Monitoring and Logs

- **Build Logs**: Available in Render Dashboard under your service
- **Runtime Logs**: Accessible from the service dashboard
- **Metrics**: Render provides basic metrics for your services

## Step 9: Security Considerations

1. **Environment Variables**: Never commit sensitive data to Git
2. **HTTPS**: Render automatically provides SSL certificates
3. **API Security**: Your backend already has JWT authentication
4. **CORS**: Properly configured for your frontend domain

## Step 10: Performance Optimization

Your frontend is already optimized with:
- Code splitting via Vite
- Lazy loading for routes
- Optimized build output
- Proper caching headers

## Next Steps

After successful deployment:
1. Test all features thoroughly
2. Set up monitoring alerts
3. Configure backup strategies
4. Plan for scaling if needed

## Support

If you encounter issues:
1. Check Render's documentation: https://render.com/docs
2. Review build and runtime logs
3. Verify environment variables
4. Test API endpoints directly

Your full-stack application is now live on Render! 🎉
