'use client';

import { useState } from 'react';

interface AdminReviewFormProps {
  baleId: number;
}

export default function AdminReviewForm({ baleId }: AdminReviewFormProps) {
  const [reviewerName, setReviewerName] = useState('');
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [reviewDate, setReviewDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewerName.trim() || !reviewText.trim()) {
      setMessage({ type: 'error', text: 'Please fill in reviewer name and review.' });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      const res = await fetch('/api/admin/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          // We don't need to send email anymore if we handle auth in API via Session,
          // BUT since your current API expects it, we can send a dummy or rely on the fact
          // that only admins see this form. 
          // Ideally, update API to use Supabase Auth Session instead of email field.
          admin_email: 'fahamu@gmail.com', 
          bale_id: baleId,
          reviewer_name: reviewerName.trim(),
          rating,
          review_text: reviewText.trim(),
          review_date: reviewDate || null,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to add admin review');

      setMessage({ type: 'success', text: 'Admin review added successfully!' });
      setReviewerName('');
      setRating(5);
      setReviewText('');
      setReviewDate('');
      
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Something went wrong.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="admin-review-form" style={{ marginTop: '2rem', padding: '1rem', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '16px' }}>
      <h3 style={{ color: '#0f172a' }}>➕ Add Admin Review</h3>
      {message && (
        <div style={{ padding: '0.5rem', marginBottom: '1rem', borderRadius: '8px', background: message.type === 'success' ? '#dcfce7' : '#fee2e2', color: message.type === 'success' ? '#166534' : '#b91c1c' }}>
          {message.text}
        </div>
      )}
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', color: '#0f172a' }}>Reviewer Name</label>
          <input
            type="text"
            value={reviewerName}
            onChange={(e) => setReviewerName(e.target.value)}
            required
            style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '8px', backgroundColor: '#ffffff', color: '#0f172a' }}
            placeholder="e.g., John Mwangi"
          />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', color: '#0f172a' }}>Rating</label>
          <div style={{ display: 'flex', gap: '0.25rem' }}>
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: star <= rating ? '#f59e0b' : '#cbd5e1', padding: 0 }}
              >
                ★
              </button>
            ))}
          </div>
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', color: '#0f172a' }}>Review Date (optional)</label>
          <input
            type="datetime-local"
            value={reviewDate}
            onChange={(e) => setReviewDate(e.target.value)}
            style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '8px', backgroundColor: '#ffffff', color: '#0f172a' }}
          />
          <small style={{ color: '#475569' }}>Leave blank to use current date/time.</small>
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', fontWeight: '600', marginBottom: '0.5rem', color: '#0f172a' }}>Review Text</label>
          <textarea
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            required
            rows={4}
            style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '8px', fontFamily: 'inherit', resize: 'vertical', backgroundColor: '#ffffff', color: '#0f172a' }}
            placeholder="Write the admin review here..."
          />
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          style={{ background: '#dc2626', color: 'white', padding: '0.5rem 1rem', border: 'none', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', opacity: isSubmitting ? 0.7 : 1 }}
        >
          {isSubmitting ? 'Adding...' : 'Add Admin Review'}
        </button>
      </form>
    </div>
  );
}