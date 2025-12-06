# Netlify Deployment Guide

## Prerequisites

1. A Netlify account (sign up at https://www.netlify.com)
2. Your frontend code pushed to GitHub (already done ✅)
3. Your Supabase environment variables ready

## Step 1: Connect Repository to Netlify

1. Go to [Netlify Dashboard](https://app.netlify.com)
2. Click **"Add new site"** → **"Import an existing project"**
3. Choose **GitHub** as your Git provider
4. Authorize Netlify to access your GitHub account (if needed)
5. Select the repository: `ayaniitgoa/nearu_frontend`
6. Click **"Import"**

## Step 2: Configure Build Settings

Netlify should auto-detect Next.js, but verify these settings:

### Build Settings:
- **Base directory:** `frontend` (if deploying from monorepo) or leave empty (if repo is just frontend)
- **Build command:** `npm run build`
- **Publish directory:** `.next` (Next.js default) or `out` (if using static export)

**Note:** For Next.js 14, the default is `.next`. If you're using static export, change publish directory to `out`.

## Step 3: Set Environment Variables

1. In your Netlify site dashboard, go to **Site settings** → **Environment variables**
2. Click **"Add a variable"** and add each of these:

### Required Environment Variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

### How to Get Your Keys:

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **Settings** → **API**
4. Copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY` ⚠️ Keep secret!

## Step 4: Deploy

1. After setting environment variables, Netlify will automatically trigger a new deployment
2. Or click **"Trigger deploy"** → **"Deploy site"**
3. Wait for the build to complete
4. Your site will be live at: `https://your-site-name.netlify.app`

## Step 5: Configure Custom Domain (Optional)

1. Go to **Site settings** → **Domain management**
2. Click **"Add custom domain"**
3. Follow the instructions to configure your domain

## Important Notes

### For Next.js on Netlify:

- **Next.js Runtime:** The `netlify.toml` file includes `@netlify/plugin-nextjs` which handles Next.js automatically
- **API Routes:** Your API routes in `app/api/` will work automatically as Netlify Functions
- **Server-side Rendering:** Fully supported
- **Image Optimization:** Works with Netlify's Next.js plugin
- **Automatic Configuration:** The `netlify.toml` file handles most settings automatically

### Environment Variables:

- ✅ All environment variables set in Netlify dashboard are available at build time
- ✅ Variables starting with `NEXT_PUBLIC_` are exposed to the browser
- ⚠️ `SUPABASE_SERVICE_ROLE_KEY` is only used in API routes (server-side only)
- 🔒 Never commit actual keys to GitHub

### Build Optimization:

- Netlify automatically optimizes Next.js builds
- Static pages are pre-rendered
- Dynamic routes use serverless functions

## Troubleshooting

### Build Fails:

1. Check build logs in Netlify dashboard
2. Verify all environment variables are set correctly
3. Ensure `package.json` has correct build script: `"build": "next build"`
4. Check Node.js version (Netlify uses Node 18 by default, which is fine for Next.js 14)

### Environment Variables Not Working:

1. Make sure variable names match exactly (case-sensitive)
2. Redeploy after adding/changing environment variables
3. Check that `NEXT_PUBLIC_` prefix is used for client-side variables

### API Routes Not Working:

1. Ensure `SUPABASE_SERVICE_ROLE_KEY` is set (for admin API routes)
2. Check Netlify Functions logs in dashboard
3. Verify API route files are in `app/api/` directory

## Next Steps After Deployment

1. Test all functionality:
   - User registration
   - User login
   - Listing creation
   - Image uploads
   - Google Maps links

2. Set up continuous deployment:
   - Every push to `main` branch will auto-deploy
   - Configure branch previews for pull requests

3. Monitor:
   - Check Netlify Analytics
   - Monitor build logs
   - Set up error tracking (optional)

## Support

For issues:
- Check Netlify [Documentation](https://docs.netlify.com)
- Check Next.js [Deployment Docs](https://nextjs.org/docs/deployment)
- Review build logs in Netlify dashboard

