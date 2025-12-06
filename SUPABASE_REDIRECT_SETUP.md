# Supabase Email Confirmation Redirect Setup

This guide explains how to configure Supabase to redirect users to your application after email confirmation, instead of localhost:3000.

## Problem

When users click the email confirmation link, Supabase redirects them to `localhost:3000` by default. This happens because:
1. The redirect URL is configured in the Supabase dashboard
2. The redirect URL needs to match your actual application URL

## Solution

### Step 1: Update Supabase Dashboard Settings

1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Navigate to **Authentication** → **URL Configuration**
4. Find the **Redirect URLs** section
5. Add your application URLs:

#### For Development:
```
http://localhost:3000/auth/callback
```

#### For Production (Netlify):
```
https://yoyohoneysingh123.netlify.app/auth/callback
https://your-custom-domain.com/auth/callback
```

**Your specific URL to add:**
```
https://yoyohoneysingh123.netlify.app/auth/callback
```

**Important:** Add ALL URLs where your app will be accessible (development, staging, production).

### Step 2: Update Site URL (Optional but Recommended)

In the same **URL Configuration** section:

1. Set **Site URL** to your production URL:
   - For development: `http://localhost:3000`
   - For production: `https://yoyohoneysingh123.netlify.app` (your Netlify URL)

2. This is used as a fallback redirect URL when no specific redirect is provided.

### Step 3: Verify Email Template (Optional)

1. Go to **Authentication** → **Email Templates**
2. Click on **Confirm signup** template
3. Verify the redirect link in the email template uses:
   ```
   {{ .ConfirmationURL }}
   ```
   This variable automatically uses the correct redirect URL.

### Step 4: Test the Flow

1. Register a new user
2. Check your email for the confirmation link
3. Click the confirmation link
4. You should be redirected to `/auth/callback` which then redirects to:
   - `/dashboard` for institutions
   - `/home` for learners

## How It Works

1. **User Registration**: When a user signs up, the code sets `emailRedirectTo` to `/auth/callback`
2. **Email Confirmation**: Supabase sends an email with a confirmation link
3. **Link Click**: The link contains a code and redirects to `/auth/callback?code=...`
4. **Callback Handler**: The `/auth/callback` route:
   - Exchanges the code for a session
   - Gets the user's metadata (user_type)
   - Redirects to the appropriate page (`/dashboard` or `/home`)

## Troubleshooting

### Still redirecting to localhost:3000?

1. **Check Redirect URLs**: Make sure you added the correct URL in Supabase dashboard
2. **Clear Browser Cache**: Sometimes old redirects are cached
3. **Check Email Link**: The link in the email should point to your app, not localhost
4. **Verify Environment**: Make sure you're testing with the correct environment (dev vs production)

### Getting "Invalid redirect URL" error?

- The redirect URL in your code must match one of the URLs in Supabase dashboard
- Make sure there are no trailing slashes or extra characters
- Check that the URL is exactly as configured in Supabase

### Email confirmation not working?

1. Check Supabase logs: **Authentication** → **Logs**
2. Verify email is being sent: Check spam folder
3. Check if email confirmation is required: **Authentication** → **Settings** → **Email Auth**

## Code Changes Made

1. **Created `/app/auth/callback/route.js`**: Handles the OAuth callback and redirects users
2. **Updated `/app/register/page.jsx`**: Added `emailRedirectTo` option to signUp call
3. **Updated `/lib/supabase.js`**: Added default redirect configuration

## Additional Notes

- The callback route uses PKCE flow for better security
- The redirect automatically determines user type and routes accordingly
- Error handling is included for failed confirmations

