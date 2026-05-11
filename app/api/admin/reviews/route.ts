import { createClient } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { admin_email, bale_id, reviewer_name, rating, review_text, review_date } = body;

    // 1. Authorization
    if (admin_email !== 'fahamu@gmail.com') {
      return NextResponse.json({ error: 'Unauthorized: Invalid admin email' }, { status: 403 });
    }

    // 2. Validation
    if (!bale_id || !reviewer_name || !rating || !review_text) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = createClient();

    // 3. Prepare date
    let created_at = new Date().toISOString();
    if (review_date) {
      const parsed = new Date(review_date);
      if (!isNaN(parsed.getTime())) {
        created_at = parsed.toISOString();
      }
    }

    // 4. Insert review
    // Note: Ensure your 'reviews' table columns match these keys exactly
    const { data, error } = await supabase
      .from('reviews')
      .insert({
        bale_id: bale_id,
        reviewer_name: reviewer_name,
        rating: rating,
        review_text: review_text,
        created_at: created_at,
        // If your table has a 'user_id' column that is NOT nullable, you might need to add it here.
        // user_id: null, 
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase Insert Error:', error); // Check your terminal/Vercel logs for this
      return NextResponse.json({ error: `Database Error: ${error.message}` }, { status: 500 });
    }

    return NextResponse.json({ success: true, review: data });
  } catch (err: any) {
    console.error('API Route Error:', err);
    return NextResponse.json({ error: err.message || 'Internal server error' }, { status: 500 });
  }
}