import { createClient } from '@/lib/supabase';
import Testimonials from '@/components/Testimonials';

// Types
type BaleRaw = {
  id: number;
  bale_name: string;
  description: string;
  price: number;
  pieces: number | null;
  weight_kg: number | null;
  condition: string;
  origin: string;
  featured: boolean;
  stock_status: string;
  mix_type: string | null;
  category_slug: string;
  main_image_url: string;
  secondary_images: string[];
  created_at: string;
};

type Bale = BaleRaw & {
  avg_rating: number;
  review_count: number;
};

type Review = {
  id: number;
  reviewer_name: string;
  review_text: string;
  rating: number;
};

async function getBales(category?: string): Promise<Bale[]> {
  const supabase = createClient();

  let query = supabase
    .from('bales')
    .select('*')
    .eq('stock_status', 'instock');

  // Filter by category if provided
  if (category && ['men', 'ladies', 'kids', 'accessories', 'mix'].includes(category)) {
    query = query.eq('category_slug', category).order('created_at', { ascending: false }).limit(20);
  } else {
    // No category filter - show only featured bales
    query = query.eq('featured', true).order('created_at', { ascending: false }).limit(8);
  }

  const { data: bales, error } = await query;
  if (error || !bales) return [];

  const baleIds = bales.map((b: BaleRaw) => b.id);
  
  const { data: reviews } = await supabase
    .from('reviews')
    .select('bale_id, rating')
    .in('bale_id', baleIds);

  const ratingMap: Record<number, { sum: number; count: number }> = {};
  reviews?.forEach((r: { bale_id: number; rating: number }) => {
    if (!ratingMap[r.bale_id]) ratingMap[r.bale_id] = { sum: 0, count: 0 };
    ratingMap[r.bale_id].sum += r.rating;
    ratingMap[r.bale_id].count++;
  });

  return bales.map((bale: BaleRaw) => ({
    ...bale,
    avg_rating: ratingMap[bale.id] ? ratingMap[bale.id].sum / ratingMap[bale.id].count : 0,
    review_count: ratingMap[bale.id]?.count || 0,
  }));
}

async function getAllReviews(): Promise<Review[]> {
  const supabase = createClient();
  
  const { data: reviews, error } = await supabase
    .from('reviews')
    .select('id, reviewer_name, review_text, rating')
    .order('created_at', { ascending: false })
    .limit(6);

  if (error || !reviews) return [];
  return reviews;
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const category = params.category as string;
  const bales = await getBales(category);
  const allReviews = await getAllReviews();

  const categories = [
    { label: "Men's Wear", icon: '👔', filter: 'men' },
    { label: "Ladies' Fashion", icon: '👗', filter: 'ladies' },
    { label: "Kids' Collection", icon: '🧒', filter: 'kids' },
    { label: 'Accessories', icon: '🧣', filter: 'accessories' },
    { label: 'Mixed Bales', icon: '🔄', filter: 'mix' },
  ];

  const getCategoryLink = (filter: string) => `/?category=${filter}`;
  const isActiveCategory = (filter: string) => category === filter;
  const getCategoryLabel = () => categories.find(c => c.filter === category)?.label;

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans">
      <style>{`
        /* ===== GLOBAL RESET & TYPOGRAPHY ===== */
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { 
          background: #ffffff; 
          color: #111827; 
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
          -webkit-font-smoothing: antialiased;
        }

        /* ===== UTILITIES ===== */
        .container { 
          max-width: 1400px; 
          margin: 0 auto; 
          padding: 0 1.5rem; 
        }
        .section { padding: 4rem 0; }
        .section-title {
          font-size: 2.25rem;
          font-weight: 800;
          text-align: center;
          margin-bottom: 1rem;
          color: #111827;
        }
        .section-subtitle {
          text-align: center;
          color: #6b7280;
          max-width: 600px;
          margin: 0 auto 3rem;
          font-size: 1.125rem;
        }

        /* ===== HERO SECTION ===== */
        .hero {
          background: linear-gradient(135deg, #1e40af 0%, #1d4ed8 60%, #3b82f6 100%);
          color: white;
          padding: 5rem 0;
          position: relative;
          overflow: hidden;
        }
        .hero::before {
          content: '';
          position: absolute;
          top: -50%;
          right: -20%;
          width: 600px;
          height: 600px;
          border-radius: 50%;
          background: rgba(255,255,255,0.08);
          pointer-events: none;
        }
        .hero-content {
          max-width: 700px;
          position: relative;
          z-index: 2;
        }
        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(255,255,255,0.15);
          padding: 0.5rem 1.25rem;
          border-radius: 999px;
          font-size: 0.875rem;
          font-weight: 600;
          margin-bottom: 1.5rem;
          backdrop-filter: blur(4px);
        }
        .hero-title {
          font-size: 3rem;
          font-weight: 900;
          line-height: 1.1;
          margin-bottom: 1.5rem;
          letter-spacing: -0.025em;
        }
        .hero-subtitle {
          font-size: 1.25rem;
          opacity: 0.95;
          margin-bottom: 2.5rem;
          max-width: 550px;
        }
        .hero-ctas {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }
        .btn-primary {
          background: #ffffff;
          color: #1e40af;
          padding: 1rem 2rem;
          border-radius: 12px;
          font-weight: 700;
          font-size: 1.05rem;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          transition: transform 0.2s, box-shadow 0.2s;
          box-shadow: 0 4px 14px rgba(0,0,0,0.15);
        }
        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.2);
        }
        .btn-secondary {
          background: transparent;
          color: white;
          padding: 1rem 2rem;
          border-radius: 12px;
          font-weight: 700;
          font-size: 1.05rem;
          text-decoration: none;
          border: 2px solid rgba(255,255,255,0.8);
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          transition: all 0.2s;
        }
        .btn-secondary:hover {
          background: rgba(255,255,255,0.1);
          border-color: white;
        }
        .hero-trust {
          display: flex;
          gap: 2rem;
          margin-top: 3rem;
          flex-wrap: wrap;
        }
        .trust-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 0.95rem;
          opacity: 0.95;
        }
        .trust-icon {
          width: 24px;
          height: 24px;
          color: #fbbf24;
        }

        /* ===== CATEGORIES - BEAUTIFUL WRAPPED GRID ===== */
        .categories {
          background: #f9fafb;
          padding: 1.5rem 0;
          border-bottom: 1px solid #e5e7eb;
        }
        .categories-grid {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 0.75rem;
        }
        .category-chip {
          background: white;
          border: 1px solid #e5e7eb;
          padding: 0.6rem 1.25rem;
          border-radius: 999px;
          font-weight: 600;
          font-size: 0.9rem;
          color: #374151;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          transition: all 0.2s;
          white-space: nowrap;
        }
        .category-chip:hover,
        .category-chip.active {
          background: #1e40af;
          color: white;
          border-color: #1e40af;
          transform: translateY(-1px);
        }
        @media (max-width: 640px) {
          .category-chip {
            font-size: 0.85rem;
            padding: 0.5rem 1rem;
          }
        }

        /* ===== FEATURED BALES GRID ===== */
        .bales-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 2rem;
          margin-top: 2rem;
        }
        .bale-card {
          background: white;
          border-radius: 20px;
          overflow: hidden;
          border: 1px solid #e5e7eb;
          box-shadow: 0 4px 20px rgba(0,0,0,0.06);
          transition: transform 0.3s, box-shadow 0.3s;
          display: flex;
          flex-direction: column;
        }
        .bale-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 12px 32px rgba(0,0,0,0.12);
        }
        .bale-image {
          position: relative;
          height: 220px;
          background: #f3f4f6;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }
        .bale-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.4s;
        }
        .bale-card:hover .bale-image img {
          transform: scale(1.04);
        }
        .bale-badge {
          position: absolute;
          top: 1rem;
          left: 1rem;
          background: #10b981;
          color: white;
          padding: 0.35rem 0.85rem;
          border-radius: 999px;
          font-size: 0.8rem;
          font-weight: 700;
          z-index: 2;
        }
        .bale-rating {
          position: absolute;
          top: 1rem;
          right: 1rem;
          background: rgba(255,255,255,0.95);
          color: #111827;
          padding: 0.35rem 0.75rem;
          border-radius: 999px;
          font-size: 0.8rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 0.25rem;
          z-index: 2;
        }
        .bale-content {
          padding: 1.5rem;
          flex: 1;
          display: flex;
          flex-direction: column;
        }
        .bale-title {
          font-size: 1.35rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
          color: #111827;
        }
        .bale-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin: 0.75rem 0;
        }
        .meta-tag {
          background: #f3f4f6;
          color: #4b5563;
          padding: 0.25rem 0.75rem;
          border-radius: 6px;
          font-size: 0.8rem;
          font-weight: 500;
        }
        .bale-description {
          color: #6b7280;
          font-size: 0.95rem;
          margin: 1rem 0;
          line-height: 1.5;
        }
        .bale-price-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: auto;
          padding-top: 1rem;
          border-top: 1px solid #f3f4f6;
        }
        .bale-price {
          font-size: 1.75rem;
          font-weight: 800;
          color: #1e40af;
        }
        .bale-price span {
          font-size: 1rem;
          font-weight: 500;
          color: #6b7280;
        }
        .btn-whatsapp {
          background: #25D366;
          color: white;
          padding: 0.85rem 1.5rem;
          border-radius: 12px;
          font-weight: 700;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          transition: background 0.2s;
          font-size: 0.95rem;
        }
        .btn-whatsapp:hover {
          background: #128C7E;
        }
        .btn-view {
          background: #1e40af;
          color: white;
          padding: 0.7rem 1.25rem;
          border-radius: 10px;
          font-weight: 600;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          transition: background 0.2s, transform 0.2s;
          font-size: 0.9rem;
          margin-top: 0.75rem;
        }
        .btn-view:hover {
          background: #1d4ed8;
          transform: translateY(-1px);
        }

        /* ===== VALUE PROPS SECTION ===== */
        .value-props {
          background: #f9fafb;
        }
        .props-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 2rem;
          margin-top: 2rem;
        }
        .prop-card {
          text-align: center;
          padding: 1.5rem;
        }
        .prop-icon {
          width: 64px;
          height: 64px;
          margin: 0 auto 1rem;
          background: #dbeafe;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #1e40af;
        }
        .prop-title {
          font-weight: 700;
          font-size: 1.1rem;
          margin-bottom: 0.5rem;
        }
        .prop-desc {
          color: #6b7280;
          font-size: 0.95rem;
        }

        /* ===== TESTIMONIALS ===== */
        .testimonials-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1.5rem;
          margin-top: 2rem;
        }
        .testimonial-card {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 16px;
          padding: 1.75rem;
          box-shadow: 0 4px 12px rgba(0,0,0,0.04);
        }
        .testimonial-stars {
          color: #f59e0b;
          margin-bottom: 0.75rem;
          font-size: 1.1rem;
        }
        .testimonial-text {
          color: #374151;
          font-size: 1rem;
          line-height: 1.6;
          margin-bottom: 1rem;
          font-style: italic;
        }
        .testimonial-author {
          font-weight: 700;
          color: #111827;
        }
        .testimonials-cta {
          text-align: center;
          margin-top: 2rem;
        }
        .btn-more-reviews {
          background: transparent;
          color: #1e40af;
          border: 2px solid #1e40af;
          padding: 0.85rem 2rem;
          border-radius: 12px;
          font-weight: 700;
          font-size: 1rem;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          transition: all 0.2s;
        }
        .btn-more-reviews:hover {
          background: #1e40af;
          color: white;
        }

        /* ===== CTA BANNER ===== */
        .cta-banner {
          background: linear-gradient(135deg, #065f46 0%, #047857 100%);
          color: white;
          text-align: center;
          padding: 3.5rem 2rem;
          border-radius: 24px;
          margin: 3rem 0;
        }
        .cta-title {
          font-size: 2rem;
          font-weight: 800;
          margin-bottom: 1rem;
        }
        .cta-subtitle {
          opacity: 0.95;
          max-width: 600px;
          margin: 0 auto 2rem;
          font-size: 1.1rem;
        }
        .btn-cta {
          background: white;
          color: #065f46;
          padding: 1rem 2.5rem;
          border-radius: 14px;
          font-weight: 800;
          font-size: 1.1rem;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 0.75rem;
          transition: transform 0.2s;
        }
        .btn-cta:hover {
          transform: translateY(-2px);
        }

        /* ===== FOOTER ===== */
        .footer {
          background: #111827;
          color: #d1d5db;
          padding: 3rem 0 2rem;
          margin-top: 4rem;
        }
        .footer-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 2rem;
        }
        .footer-col h4 {
          color: white;
          font-weight: 700;
          margin-bottom: 1rem;
          font-size: 1.1rem;
        }
        .footer-col a {
          display: block;
          color: #9ca3af;
          text-decoration: none;
          padding: 0.35rem 0;
          transition: color 0.2s;
        }
        .footer-col a:hover {
          color: white;
        }
        .payment-details {
          background: rgba(255,255,255,0.08);
          padding: 1rem;
          border-radius: 12px;
          margin-top: 0.5rem;
        }
        .payment-details p {
          margin: 0.25rem 0;
          font-size: 0.9rem;
        }
        .payment-details strong {
          color: white;
        }
        .location-details {
          margin-top: 0.5rem;
          font-size: 0.9rem;
          color: #9ca3af;
          line-height: 1.5;
        }
        .footer-bottom {
          text-align: center;
          padding-top: 2rem;
          margin-top: 2rem;
          border-top: 1px solid #374151;
          font-size: 0.9rem;
          color: #6b7280;
        }

        /* ===== RESPONSIVE ===== */
        @media (max-width: 768px) {
          .hero-title { font-size: 2.25rem; }
          .hero-subtitle { font-size: 1.1rem; }
          .section { padding: 3rem 0; }
          .bales-grid { grid-template-columns: 1fr; }
          .hero-ctas { flex-direction: column; }
          .hero-trust { gap: 1.5rem; }
          .categories-grid { gap: 0.5rem; }
        }
      `}</style>

      {/* ===== HERO SECTION ===== */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <div className="hero-badge">
              <svg className="trust-icon" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
              </svg>
              Kenya's #1 Premium Mitumba Supplier
            </div>
            <h1 className="hero-title">Premium Mitumba Bales Delivered Nationwide</h1>
            <p className="hero-subtitle">
              Curated premium bales from Canada, UK, USA, China & more. Verified grades. Fast M-Pesa checkout. Trusted by 5,000+ Kenyan retailers.
            </p>
            <div className="hero-ctas">
              <a href="#featured" className="btn-primary">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
                </svg>
                Shop Premium Bales
              </a>
              <a href="https://wa.me/254757248296" className="btn-secondary">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.362c-.298-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.298-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                  <path d="M12 2C6.477 2 2 6.477 2 12a9.994 9.994 0 006.838 9.488c.5.087.687-.211.687-.469 0-.233-.008-.845-.013-1.637-2.494.488-3.203-.988-3.478-1.554-.344-.889-.833-1.164-1.233-1.164-.5 0-.833.297-.833.889 0 .52.033 1.164.05 1.313.133.625.875 1.137 1.587 1.286.273.05.625.199 1.125.313.333.074.733.111 1.133.111.4 0 .8-.05 1.199-.15 1-.25 1.866-.763 2.39-1.555.333-.5.5-1.164.5-1.813 0-.624-.167-1.124-.5-1.549-1.45-.175-2.5-1.112-2.5-2.5 0-.75.25-1.425.712-1.912-.017-.175-.325-1.6.075-2.2 0 0 .6-1.913 1.912-1.913.5 0 .925.225 1.237.625.35.437.463 1.012.438 1.587-.138.813-.55 1.463-1.013 1.913-.412.4-.75.675-1.125.887.088.25.163.563.163.913 0 .625-.013 1.125-.013 1.287 0 .15.1.338.438.338.388 0 1.038-.038 1.688-.213-1.125 1.388-2.575 2.212-4.162 2.287z"/>
                </svg>
                Order via WhatsApp
              </a>
            </div>
            <div className="hero-trust">
              <div className="trust-item">
                <svg className="trust-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                </svg>
                100% Quality Guaranteed
              </div>
              <div className="trust-item">
                <svg className="trust-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
                </svg>
                All Deliveries Within 1 Day Nationwide
              </div>
              <div className="trust-item">
                <svg className="trust-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"/>
                </svg>
                M-Pesa Paybill: 625625
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== CATEGORY NAVIGATION ===== */}
      <div className="categories">
        <div className="container">
          <div className="categories-grid">
            {categories.map((cat) => (
              <a 
                key={cat.filter} 
                href={getCategoryLink(cat.filter)}
                className={`category-chip ${isActiveCategory(cat.filter) ? 'active' : ''}`}
              >
                <span>{cat.icon}</span>
                {cat.label}
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* ===== BALES GRID - FILTERED BY CATEGORY ===== */}
      <section id="featured" className="section">
        <div className="container">
          <h2 className="section-title">
            {category ? `✨ ${getCategoryLabel()}` : '✨ Curated Premium Mitumba Bales'}
          </h2>
          <p className="section-subtitle">
            {category 
              ? `All available ${getCategoryLabel()?.toLowerCase()} bales in stock. Verified quality, ready to ship.` 
              : 'Hand-selected bales with verified quality grades. Limited stock — order before they\'re gone.'
            }
          </p>
          
          {bales.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
              <p className="text-gray-500">
                {category 
                  ? `No ${getCategoryLabel()?.toLowerCase()} bales currently in stock. ` 
                  : 'Premium bales loading... '
                }
                <a href="https://wa.me/254757248296" className="text-blue-600 font-medium">Contact us directly</a> for availability.
              </p>
            </div>
          ) : (
            <div className="bales-grid">
              {bales.map((bale) => (
                <article key={bale.id} className="bale-card">
                  <div className="bale-image">
                    {bale.main_image_url ? (
                      <img src={bale.main_image_url} alt={bale.bale_name} loading="lazy" />
                    ) : (
                      <div className="text-gray-400 text-sm">Premium bale image</div>
                    )}
                    <span className="bale-badge">In Stock</span>
                    {bale.review_count > 0 && (
                      <span className="bale-rating">
                        ★ {bale.avg_rating.toFixed(1)}
                      </span>
                    )}
                  </div>
                  <div className="bale-content">
                    <h3 className="bale-title">{bale.bale_name}</h3>
                    <div className="bale-meta">
                      {bale.condition && <span className="meta-tag">📌 {bale.condition}</span>}
                      {bale.origin && <span className="meta-tag">🌍 {bale.origin}</span>}
                      {bale.weight_kg && <span className="meta-tag">⚖️ {bale.weight_kg}kg</span>}
                      {bale.pieces && <span className="meta-tag">👕 {bale.pieces}pcs</span>}
                    </div>
                    <p className="bale-description">{bale.description}</p>
                    <div className="bale-price-row">
                      <div className="bale-price">
                        {bale.price.toLocaleString()}<span>/=</span>
                      </div>
                      <a 
                        href={`https://wa.me/254757248296?text=Hi Samda, I want to order: ${encodeURIComponent(bale.bale_name)} (${bale.price.toLocaleString()}/=)`}
                        className="btn-whatsapp"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M17.472 14.362c-.298-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.298-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                          <path d="M12 2C6.477 2 2 6.477 2 12a9.994 9.994 0 006.838 9.488c.5.087.687-.211.687-.469 0-.233-.008-.845-.013-1.637-2.494.488-3.203-.988-3.478-1.554-.344-.889-.833-1.164-1.233-1.164-.5 0-.833.297-.833.889 0 .52.033 1.164.05 1.313.133.625.875 1.137 1.587 1.286.273.05.625.199 1.125.313.333.074.733.111 1.133.111.4 0 .8-.05 1.199-.15 1-.25 1.866-.763 2.39-1.555.333-.5.5-1.164.5-1.813 0-.624-.167-1.124-.5-1.549-1.45-.175-2.5-1.112-2.5-2.5 0-.75.25-1.425.712-1.912-.017-.175-.325-1.6.075-2.2 0 0 .6-1.913 1.912-1.913.5 0 .925.225 1.237.625.35.437.463 1.012.438 1.587-.138.813-.55 1.463-1.013 1.913-.412.4-.75.675-1.125.887.088.25.163.563.163.913 0 .625-.013 1.125-.013 1.287 0 .15.1.338.438.338.388 0 1.038-.038 1.688-.213-1.125 1.388-2.575 2.212-4.162 2.287z"/>
                        </svg>
                        Order Now
                      </a>
                    </div>
                    <a href={`/bale/${bale.id}`} className="btn-view">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      View Details
                    </a>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ===== VALUE PROPOSITIONS ===== */}
      <section className="section value-props">
        <div className="container">
          <h2 className="section-title">Why 5,000+ Kenyan Retailers Trust Samda</h2>
          <div className="props-grid">
            <div className="prop-card">
              <div className="prop-icon">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                </svg>
              </div>
              <h3 className="prop-title">Verified Quality</h3>
              <p className="prop-desc">Every premium bale inspected & graded. No surprises — just consistent, sellable stock.</p>
            </div>
            <div className="prop-card">
              <div className="prop-icon">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z"/>
                </svg>
              </div>
              <h3 className="prop-title">1-Day Nationwide Delivery</h3>
              <p className="prop-desc">All orders dispatched same-day. Delivered anywhere in Kenya within 24 hours via trusted logistics partners.</p>
            </div>
            <div className="prop-card">
              <div className="prop-icon">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"/>
                </svg>
              </div>
              <h3 className="prop-title">Easy M-Pesa</h3>
              <p className="prop-desc">Pay securely via M-Pesa Paybill. Instant confirmation.</p>
            </div>
            <div className="prop-card">
              <div className="prop-icon">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"/>
                </svg>
              </div>
              <h3 className="prop-title">24/7 Support</h3>
              <p className="prop-desc">Get answers fast when you need them.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      {allReviews.length > 0 && (
        <section className="section">
          <div className="container">
            <h2 className="section-title">What Our Customers Say</h2>
            <p className="section-subtitle">Feedback from mitumba retailers across Kenya</p>
            <Testimonials initialReviews={allReviews} />
            <div className="testimonials-cta">
              <a href="/testimonials" className="btn-more-reviews">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                View more Testimonials
              </a>
            </div>
          </div>
        </section>
      )}

      {/* ===== CTA BANNER ===== */}
      <div className="container">
        <div className="cta-banner">
          <h3 className="cta-title">Ready to Order Premium Mitumba?</h3>
          <p className="cta-subtitle">
            Message us directly on WhatsApp with the bale you want. Instant confirmation. Fast dispatch
          </p>
          <a 
            href="https://wa.me/254757248296?text=Hi Samda, I'd like to place an order for premium mitumba bales. Please assist."
            className="btn-cta"
            target="_blank"
            rel="noopener noreferrer"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.362c-.298-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.298-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
              <path d="M12 2C6.477 2 2 6.477 2 12a9.994 9.994 0 006.838 9.488c.5.087.687-.211.687-.469 0-.233-.008-.845-.013-1.637-2.494.488-3.203-.988-3.478-1.554-.344-.889-.833-1.164-1.233-1.164-.5 0-.833.297-.833.889 0 .52.033 1.164.05 1.313.133.625.875 1.137 1.587 1.286.273.05.625.199 1.125.313.333.074.733.111 1.133.111.4 0 .8-.05 1.199-.15 1-.25 1.866-.763 2.39-1.555.333-.5.5-1.164.5-1.813 0-.624-.167-1.124-.5-1.549-1.45-.175-2.5-1.112-2.5-2.5 0-.75.25-1.425.712-1.912-.017-.175-.325-1.6.075-2.2 0 0 .6-1.913 1.912-1.913.5 0 .925.225 1.237.625.35.437.463 1.012.438 1.587-.138.813-.55 1.463-1.013 1.913-.412.4-.75.675-1.125.887.088.25.163.563.163.913 0 .625-.013 1.125-.013 1.287 0 .15.1.338.438.338.388 0 1.038-.038 1.688-.213-1.125 1.388-2.575 2.212-4.162 2.287z"/>
            </svg>
            Order on WhatsApp Now
          </a>
        </div>
      </div>

      {/* ===== FOOTER WITH UPDATED PAYMENT & LOCATION ===== */}
      <footer className="footer">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-col">
              <h4>Samda Mitumba</h4>
              <p style={{color: '#9ca3af', fontSize: '0.95rem', lineHeight: 1.6}}>
                Kenya's trusted source for premium mitumba bales. Quality guaranteed. Nationwide delivery within 1 day.
              </p>
            </div>
            <div className="footer-col">
              <h4>Shop</h4>
              <a href="/?category=men">Men's Wear</a>
              <a href="/?category=ladies">Ladies' Fashion</a>
              <a href="/?category=kids">Kids' Collection</a>
              <a href="/?category=accessories">Accessories</a>
            </div>
            <div className="footer-col">
              <h4>Payment Details</h4>
              <div className="payment-details">
                <p><strong>PAYBILL:</strong> 625625</p>
                <p><strong>A/C:</strong> 01201254723500</p>
                <p><strong>MPESA:</strong> 0757 248 296</p>
              </div>
            </div>
            <div className="footer-col">
              <h4>Our Locations</h4>
              <div className="location-details">
                <p>📍 7th Floor, WACIAMA Building,<br/>Gikomba, Nairobi.</p>
                <p style={{marginTop: '0.75rem'}}>📍 Old Uchumi Building,<br/>Nakuru.</p>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            &copy; {new Date().getFullYear()} Samda Mitumba Kenya. All rights reserved. | Premium Quality • M-Pesa Secure • 1-Day Delivery Nationwide
          </div>
        </div>
      </footer>
    </div>
  );
}