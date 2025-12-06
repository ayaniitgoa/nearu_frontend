import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') || '/home';
  const error = requestUrl.searchParams.get('error');
  const errorDescription = requestUrl.searchParams.get('error_description');

  // If there's an error, redirect to login with error message
  if (error) {
    const errorMessage = errorDescription || error;
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(errorMessage)}`, requestUrl.origin)
    );
  }

  // If there's a code, exchange it for a session
  if (code) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.redirect(
        new URL('/login?error=Configuration error', requestUrl.origin)
      );
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (exchangeError) {
      console.error('Error exchanging code for session:', exchangeError);
      return NextResponse.redirect(
        new URL(`/login?error=${encodeURIComponent(exchangeError.message)}`, requestUrl.origin)
      );
    }

    // Get user to determine redirect based on user type
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      const userType = user.user_metadata?.user_type || 'learner';
      const redirectPath = userType === 'institution' ? '/dashboard' : '/home';
      return NextResponse.redirect(new URL(redirectPath, requestUrl.origin));
    }
  }

  // Default redirect
  return NextResponse.redirect(new URL(next, requestUrl.origin));
}

