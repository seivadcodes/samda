'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase';

export default function AddReviewForm({ baleId }: { baleId: number }) {
  const [rating, setRating] = useState(5);
  const [name, setName] = useState('');
  const [text, setText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const supabase = createClient();

    const { error } = await supabase.from('reviews').insert({
      bale_id: baleId,
      reviewer_name: name || 'Anonymous',
      review_text: text,
      rating: rating,
    });

    setIsSubmitting(false);

    if (error) {
      alert('Error submitting review: ' + error.message);
    } else {
      // Refresh the page to show the new review
      window.location.reload();
    }
  };

  return (
    <div className="add-review-form">
      <h3>Leave a Review</h3>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Rating</label>
          <select 
            value={rating} 
            onChange={(e) => setRating(Number(e.target.value))}
            style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
          >
            {[5, 4, 3, 2, 1].map((num) => (
              <option key={num} value={num}>{num} Stars</option>
            ))}
          </select>
        </div>
        
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Name (Optional)</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
          />
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Review</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            required
            rows={4}
            style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
          />
        </div>

        <button 
          type="submit" 
          disabled={isSubmitting}
          style={{
            background: '#4f46e5',
            color: 'white',
            padding: '0.75rem 1.5rem',
            borderRadius: '8px',
            border: 'none',
            fontWeight: 600,
            cursor: isSubmitting ? 'not-allowed' : 'pointer'
          }}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Review'}
        </button>
      </form>
    </div>
  );
}