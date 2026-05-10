'use client';

import { useState } from 'react';

type Review = {
  id: number;
  reviewer_name: string;
  review_text: string;
  rating: number;
};

export default function Testimonials({ initialReviews }: { initialReviews: Review[] }) {
  const [visibleCount, setVisibleCount] = useState(6);

  const visibleReviews = initialReviews.slice(0, visibleCount);
  const hasMore = visibleCount < initialReviews.length;

  const handleShowMore = () => {
    setVisibleCount(initialReviews.length);
  };

  return (
    <div className="testimonials-section">
      <h2 className="testimonials-title">What Our Customers Say</h2>
      <div className="testimonials-grid" id="testimonials-grid">
        {visibleReviews.map((review) => (
          <div key={review.id} className="testimonial-card">
            <div className="testimonial-text">“{review.review_text}”</div>
            <div className="testimonial-author">
              <div className="testimonial-stars">
                {'★'.repeat(review.rating)}
                {'☆'.repeat(5 - review.rating)}
              </div>
              <span>— {review.reviewer_name || 'Anonymous'}</span>
            </div>
          </div>
        ))}
      </div>
      {hasMore && (
        <button onClick={handleShowMore} className="show-more-btn">
          Show More Testimonials
        </button>
      )}
    </div>
  );
}