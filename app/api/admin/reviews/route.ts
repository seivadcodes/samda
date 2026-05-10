import { createClient } from '@/lib/supabase';
import { NextResponse } from 'next/server';

const ADMIN_SECRET = process.env.ADMIN_REVIEW_SECRET; // set in .env.local

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { admin_email, admin_secret, bale_id, reviewer_name, rating, review_text, review_date } = body;

    // Authorization
    if (!admin_secret || admin_secret !== ADMIN_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (admin_email !== 'fahamu@gmail.com') {
      return NextResponse.json({ error: 'Only fahamu@gmail.com can add admin reviews' }, { status: 403 });
    }

    // Validation
    if (!bale_id || !reviewer_name || !rating || !review_text) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be 1-5' }, { status: 400 });
    }

    const supabase = createClient();

    // Prepare date
    let created_at = new Date().toISOString();
    if (review_date) {
      const parsed = new Date(review_date);
      if (!isNaN(parsed.getTime())) {
        created_at = parsed.toISOString();
      }
    }

    // Insert review
    const { data, error } = await supabase
      .from('reviews')
      .insert({
        bale_id,
        reviewer_name,
        rating,
        review_text,
        created_at,
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