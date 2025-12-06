# Environment Variables Setup

## Required Environment Variables

Create a `.env.local` file in the `frontend` directory with the following variables:

```env
# Your Supabase project URL
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co

# Your Supabase anonymous/public key (safe to expose in frontend)
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Your Supabase service role key (KEEP SECRET - only used in API routes)
# This should NEVER be exposed to the client
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

## How to Get Your Keys

1. Go to your Supabase Dashboard: https://app.supabase.com
2. Select your project
3. Go to **Settings** → **API**
4. Copy the following:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY` (⚠️ Keep this secret!)

## Security Notes

- ✅ `.env.local` is already in `.gitignore` - your keys will NOT be pushed to GitHub
- ⚠️ Never commit `.env.local` or any file containing actual keys
- 🔒 The service role key has admin access - keep it secure
- 🌐 The anon key is safe to expose in frontend code (it's public)

## For Production Deployment

When deploying to production (Vercel, Netlify, etc.), add these environment variables in your hosting platform's dashboard:

1. Go to your project settings
2. Find "Environment Variables" section
3. Add each variable with its value
4. Redeploy your application


