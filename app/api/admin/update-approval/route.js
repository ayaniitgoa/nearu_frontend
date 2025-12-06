import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const { coachId, isApproved } = body;

    if (!coachId || typeof isApproved !== 'boolean') {
      return NextResponse.json(
        { error: 'coachId and isApproved are required' },
        { status: 400 }
      );
    }

    // Create admin client with service role key
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Update approval status using admin client (bypasses RLS)
    const { data, error } = await supabaseAdmin
      .from('coaches')
      .update({ is_approved: isApproved })
      .eq('id', coachId)
      .select()
      .single();

    if (error) {
      console.error('Error updating approval status:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error('Error in update-approval API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

