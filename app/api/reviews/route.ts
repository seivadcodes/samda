import { createClient } from '@/lib/supabase';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { bale_id, reviewer_name, rating, review_text } = body;

    // Validation
    if (!bale_id || !reviewer_name || !rating || !review_text) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be 1-5' }, { status: 400 });
    }

    const supabase = createClient();

    // Insert review
    const { data, error } = await supabase
      .from('reviews')
      .insert({
        bale_id,
        reviewer_name,
        rating,
        review_text,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: 'Failed to save review' }, { status: 500 });
    }

    return NextResponse.json({ success: true, review: data });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}