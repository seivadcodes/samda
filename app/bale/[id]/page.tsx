'use client';

import { useState, useEffect } from 'react';
import { notFound, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { createClient } from '@/lib/supabase';
import AddReviewForm from '@/components/AddReviewForm';
import AdminReviewForm from '@/components/AdminReviewForm';
import BaleGallery from '@/components/BaleGallery';
import { Loader2 } from 'lucide-react';

// 🔑 ADMIN CONFIGURATION
const ADMIN_EMAILS = [
  'fahamu@gmail.com',
];

type Review = {
  id: number;
  reviewer_name: string | null;
  review_text: string;
  rating: number;
  created_at: string;
};

type BaleSeller = {
  id: string;
  display_name: string;
  supplier_type: string | null;
  profile_pic_url: string | null;
};

type BaleData = {
  id: number;
  bale_name: string;
  main_image_url: string | null;
  secondary_images: string[] | null;
  condition: string | null;
  origin: string | null;
  weight_kg: number | null;
  pieces: number | null;
  mix_type: string | null;
  price: number;
  description: string | null;
  seller: BaleSeller;
};

type PageProps = {
  params: Promise<{ id: string }>;
};

export default function BalePage({ params }: PageProps) {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [bale, setBale] = useState<BaleData | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [avgRating, setAvgRating] = useState(0);
  const [loading, setLoading] = useState(true);

  // Check admin status - EXACTLY LIKE TREND PAGE
  const isAdmin = user?.email ? ADMIN_EMAILS.includes(user.email) : false;

  useEffect(() => {
    async function loadData() {
      try {
        const { id } = await params;
        const baleId = parseInt(id);
        
        if (isNaN(baleId)) {
          notFound();
          return;
        }

        const supabase = createClient();

        // Fetch bale data
        const { data: baleData, error: baleError } = await supabase
          .from('bales')
          .select(`
            *,
            seller:users!seller_id (
              id,
              display_name,
              supplier_type,
              profile_pic_url
            )
          `)
          .eq('id', baleId)
          .single<BaleData>();

        if (baleError || !baleData) {
          notFound();
          return;
        }

        setBale(baleData);

        // Fetch ALL reviews for this seller across ALL their bales
        // Step 1: Get all bale IDs from this seller
        const { data: sellerBales } = await supabase
          .from('bales')
          .select('id')
          .eq('seller_id', baleData.seller.id);

        const baleIds = sellerBales?.map(b => b.id) || [baleId];

        // Step 2: Get all reviews for those bales
        const { data: reviewsData } = await supabase
          .from('reviews')
          .select(`
            id, 
            reviewer_name, 
            review_text, 
            rating, 
            created_at,
            bale_id
          `)
          .in('bale_id', baleIds)
          .order('created_at', { ascending: false })
          .returns<Review[]>();

        const reviewsList = reviewsData || [];
        setReviews(reviewsList);

        // Calculate average rating
        if (reviewsList.length > 0) {
          const sum = reviewsList.reduce((acc: number, r: Review) => acc + r.rating, 0);
          setAvgRating(sum / reviewsList.length);
        }

      } catch (error) {
        console.error('Error loading bale:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [params]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!bale) {
    notFound();
    return null;
  }

  return (
    <div className="bale-detail-container">
      <style>{`
        .bale-detail-container {
          max-width: 1200px;
          margin: 2rem auto;
          padding: 0 1rem;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }
        .back-link {
          display: inline-block;
          margin-bottom: 1.5rem;
          color: #4f46e5;
          text-decoration: none;
          font-weight: 500;
        }
        .back-link:hover {
          text-decoration: underline;
        }
        .bale-detail {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
          background: white;
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 10px 25px -5px rgba(0,0,0,0.1);
          border: 1px solid #eaeaea;
        }
        .bale-gallery {
          padding: 1.5rem;
        }
        .main-image {
          width: 100%;
          aspect-ratio: 1;
          background: #f8fafc;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          margin-bottom: 1rem;
        }
        .main-image img {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
        }
        .thumbnails {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
        }
        .thumbnails img {
          width: 80px;
          height: 80px;
          object-fit: cover;
          border-radius: 8px;
          transition: all 0.2s ease;
          cursor: pointer;
        }
        .thumbnails img:hover {
          transform: scale(1.05);
        }
        .bale-info {
          padding: 1.5rem;
        }
        .bale-name {
          font-size: 2rem;
          font-weight: 800;
          color: #0f172a;
          margin-bottom: 0.5rem;
        }
        .bale-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin: 1rem 0;
        }
        .meta-badge {
          background: #f1f5f9;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 0.875rem;
          font-weight: 500;
          color: #1e293b;
        }
        .price {
          font-size: 2.5rem;
          font-weight: 800;
          color: #1e40af;
          margin: 1rem 0;
        }
        .order-buttons {
          display: flex;
          gap: 1rem;
          margin: 1.5rem 0;
          flex-wrap: wrap;
        }
        .order-btn {
          flex: 1;
          padding: 12px 24px;
          border-radius: 12px;
          font-weight: 600;
          text-align: center;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: opacity 0.2s;
        }
        .order-btn:hover {
          opacity: 0.9;
        }
        .btn-whatsapp {
          background: #25D366;
          color: white;
        }
        .btn-call {
          background: #f59e0b;
          color: white;
        }
        .btn-website {
          background: #1d4ed8;
          color: white;
        }
        .description {
          margin: 1.5rem 0;
          line-height: 1.6;
          color: #334155;
        }
        .reviews-section {
          margin-top: 3rem;
          border-top: 2px solid #eaeaea;
          padding-top: 2rem;
        }
        .reviews-title {
          font-size: 1.5rem;
          font-weight: 700;
          margin-bottom: 1.5rem;
          color: #ffffff; 
        }
        .review-card {
          background: #f8fafc;
          border-radius: 16px;
          padding: 1rem;
          margin-bottom: 1rem;
        }
        .review-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.5rem;
        }
        .reviewer-name {
          font-weight: 600;
          color: #1e293b;
        }
        .review-stars {
          color: #f59e0b;
        }
        .review-text {
          color: #475569;
          line-height: 1.5;
        }
        .add-review-form, .admin-review-form {
          margin-top: 2rem;
          padding: 1rem;
          border-radius: 16px;
        }
        .add-review-form {
          background: #f9fafb;
        }
        .admin-review-form {
          background: #fffbeb;
          border: 1px solid #fde68a;
        }
        @media (max-width: 768px) {
          .bale-detail {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <Link href="/" className="back-link">← Back to Home</Link>

      <div className="bale-detail">
        {/* Left: Gallery */}
        <BaleGallery 
          mainImage={bale.main_image_url} 
          secondaryImages={bale.secondary_images} 
          baleName={bale.bale_name}
        />

        {/* Right: Info */}
        <div className="bale-info">
          <h1 className="bale-name">{bale.bale_name}</h1>

          <div className="bale-meta">
            {bale.condition && <span className="meta-badge">📌 {bale.condition}</span>}
            {bale.origin && <span className="meta-badge">🌍 {bale.origin}</span>}
            {bale.weight_kg && <span className="meta-badge">⚖️ {bale.weight_kg} kg</span>}
            {bale.pieces && <span className="meta-badge">👕 {bale.pieces} pcs</span>}
            {bale.mix_type && <span className="meta-badge">🔄 {bale.mix_type === 'men_ladies' ? 'Men & Ladies' : 'Adults & Kids'}</span>}
          </div>

          <div className="price">KES {bale.price.toLocaleString()}</div>

          <div className="order-buttons">
            <a
              href={`https://wa.me/254757248296?text=Hi%2C%20I%20want%20to%20order%20${encodeURIComponent(bale.bale_name)}%20(ID%3A%20${bale.id})%20for%20KES%20${bale.price}`}
              target="_blank"
              rel="noopener noreferrer"
              className="order-btn btn-whatsapp"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.362c-.298-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.298-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                <path d="M12 2C6.477 2 2 6.477 2 12a9.994 9.994 0 006.838 9.488c.5.087.687-.211.687-.469 0-.233-.008-.845-.013-1.637-2.494.488-3.203-.988-3.478-1.554-.344-.889-.833-1.164-1.233-1.164-.5 0-.833.297-.833.889 0 .52.033 1.164.05 1.313.133.625.875 1.137 1.587 1.286.273.05.625.199 1.125.313.333.074.733.111 1.133.111.4 0 .8-.05 1.199-.15 1-.25 1.866-.763 2.39-1.555.333-.5.5-1.164.5-1.813 0-.624-.167-1.124-.5-1.549-1.45-.175-2.5-1.112-2.5-2.5 0-.75.25-1.425.712-1.912-.017-.175-.325-1.6.075-2.2 0 0 .6-1.913 1.912-1.913.5 0 .925.225 1.237.625.35.437.463 1.012.438 1.587-.138.813-.55 1.463-1.013 1.913-.412.4-.75.675-1.125.887.088.25.163.563.163.913 0 .625-.013 1.125-.013 1.287 0 .15.1.338.438.338.388 0 1.038-.038 1.688-.213-1.125 1.388-2.575 2.212-4.162 2.287z"/>
              </svg>
              Order on WhatsApp
            </a>
            <a href="tel:+254757248296" className="order-btn btn-call">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502.95l-1.257.942a16 16 0 005.405 5.405l.942-1.257a1 1 0 01.95-.502l4.493 1.498a1 1 0 01.684.948V19a2 2 0 01-2 2h-1c-5.523 0-10-4.477-10-10V5z" />
              </svg>
              Call Us
            </a>
            <a
              href={`/checkout?bale_id=${bale.id}&bale_name=${encodeURIComponent(bale.bale_name)}&price=${bale.price}`}
              className="order-btn btn-website"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              Order on Website
            </a>
          </div>

          {bale.description && (
            <div className="description">
              <h3>Description</h3>
              <p>{bale.description}</p>
            </div>
          )}
        </div>
      </div>

      {/* Reviews Section */}
      {reviews.length > 0 && (
        <div className="reviews-section">
          <h2 className="reviews-title">Customer Reviews ({reviews.length})</h2>
          {reviews.map((review: Review) => (
            <div key={review.id} className="review-card">
              <div className="review-header">
                <span className="reviewer-name">{review.reviewer_name || 'Anonymous'}</span>
                <span className="review-stars">{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span>
              </div>
              <div className="review-text">"{review.review_text}"</div>
            </div>
          ))}
        </div>
      )}

      {/* Public Review Form */}
      <AddReviewForm baleId={bale.id} />

      {/* Admin Review Form - ONLY SHOW IF ADMIN (EXACTLY LIKE TREND PAGE) */}
      {isAdmin && (
        <AdminReviewForm baleId={bale.id} />
      )}
    </div>
  );
}