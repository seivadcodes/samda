'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase';

export default function AdminReviewForm({ baleId }: { baleId: number }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  
  // Review State
  const [rating, setRating] = useState(5);
  const [name, setName] = useState('Admin');
  const [text, setText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Simple admin check (Note: In production, use proper server-side auth)
  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    // Replace 'your-secret-password' with your actual desired password or logic
    if (password === 'admin123') { 
      setIsAuthenticated(true);
    } else {
      alert('Incorrect password');
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const supabase = createClient();

    const { error } = await supabase.from('reviews').insert({
      bale_id: baleId,
      reviewer_name: name,
      review_text: text,
      rating: rating,
    });

    setIsSubmitting(false);

    if (error) {
      alert('Error submitting review: ' + error.message);
    } else {
      window.location.reload();
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="admin-auth-form">
        <h3>Admin Access</h3>
        <form onSubmit={handleAuth}>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter Admin Password"
            style={{ padding: '0.5rem', borderRadius: '8px', border: '1px solid #cbd5e1', marginRight: '0.5rem' }}
          />
          <button type="submit" style={{ padding: '0.5rem 1rem', borderRadius: '8px', background: '#f59e0b', color: 'white', border: 'none', cursor: 'pointer' }}>
            Login
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="admin-review-form">
      <h3>Admin: Add Review</h3>
      <form onSubmit={handleSubmitReview}>
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
          <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
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
            background: '#f59e0b',
            color: 'white',
            padding: '0.75rem 1.5rem',
            borderRadius: '8px',
            border: 'none',
            fontWeight: 600,
            cursor: isSubmitting ? 'not-allowed' : 'pointer'
          }}
        >
          {isSubmitting ? 'Submitting...' : 'Post Admin Review'}
        </button>
      </form>
    </div>
  );
}