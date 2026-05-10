import { createClient } from '@/lib/supabase';
import Testimonials from '@/components/Testimonials';

// Types (same as before)
type User = {
  display_name: string;
  phone: string | null;
  business_name: string | null;
  supplier_type: string | null;
  profile_pic_url: string | null;
};

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
  seller: User;
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

async function getBales(category?: string, search?: string): Promise<Bale[]> {
  const supabase = createClient();

  let query = supabase
    .from('bales')
    .select(
      `
      *,
      seller:users!seller_id (
        display_name,
        phone,
        business_name,
        supplier_type,
        profile_pic_url
      )
    `
    )
    .eq('stock_status', 'instock')
    .order('created_at', { ascending: false });

  if (category && category !== 'all') {
    query = query.eq('category_slug', category);
  }
  if (search) {
    query = query.ilike('bale_name', `%${search}%`);
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
    .order('created_at', { ascending: false });

  if (error || !reviews) return [];
  return reviews;
}

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { category = 'all', search } = await searchParams;
  const allBales = await getBales(category as string, search as string);
  const allReviews = await getAllReviews();

  // Split into featured and regular
  const featuredBales = allBales.filter((b) => b.featured === true);
  const regularBales = allBales.filter((b) => b.featured !== true);

  return (
    <div className="samda-container">
      <style>{`
        /* (all CSS from previous version – keep exactly the same) */
        .samda-container {
          max-width: 1600px;
          margin: 0 auto;
          padding: 1rem;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }
        .category-nav {
          display: flex;
          justify-content: center;
          gap: 12px;
          flex-wrap: wrap;
          margin: 1rem 0 2rem;
        }
        .category-nav a {
          text-decoration: none;
          padding: 8px 20px;
          border-radius: 24px;
          background: white;
          color: #6b21a8;
          font-weight: 600;
          border-bottom: 2px solid #4169e1;
          transition: all 0.2s;
        }
        .category-nav a.active {
          background: #4f46e5;
          color: white;
          border-bottom-color: #4f46e5;
        }
        .search-wrapper {
          max-width: 720px;
          margin: 0 auto 2rem;
        }
        .search-form {
          display: flex;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
        }
        .search-input {
          flex: 1;
          border: none;
          padding: 12px 16px;
          font-size: 0.95rem;
          outline: none;
        }
        .search-btn {
          background: #0f172a;
          color: white;
          border: none;
          padding: 0 20px;
          cursor: pointer;
          display: flex;
          align-items: center;
        }
        .section-title {
          font-size: 1.875rem;
          font-weight: 800;
          color: #0f172a;
          margin: 2rem 0 1rem;
          text-align: center;
        }
        .bales-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1.75rem;
          margin-bottom: 3rem;
        }
        .bale-card {
          background: white;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);
          border: 1px solid #eaeaea;
          transition: transform 0.3s;
        }
        .bale-card:hover {
          transform: translateY(-6px);
        }
        .bale-image-wrapper {
          padding: 12px;
          display: flex;
          gap: 12px;
          border-bottom: 1px solid #eaeaea;
        }
        .bale-main-image {
          flex: 1;
          background: #f8fafc;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          height: 200px;
        }
        .bale-main-image img {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
        }
        .bale-secondary-thumbnails {
          display: flex;
          flex-direction: column;
          gap: 8px;
          width: 60px;
        }
        .bale-secondary-thumbnails a {
          display: block;
          width: 100%;
          height: 60px;
        }
        .bale-secondary-thumbnails img {
          width: 100%;
          height: 60px;
          object-fit: cover;
          border-radius: 8px;
          border: 1px solid #cbd5e1;
          cursor: pointer;
        }
        .no-samples {
          width: 100%;
          height: 60px;
          background: #f1f5f9;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #94a3b8;
          font-size: 11px;
          text-align: center;
        }
        .bale-content {
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
        }
        .bale-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: #0f172a;
          margin-bottom: 0.75rem;
        }
        .bale-author {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 12px;
          padding-bottom: 12px;
          border-bottom: 1px solid #eaeaea;
        }
        .bale-author-avatar {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          object-fit: cover;
          background: #f1f5f9;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
        }
        .bale-author-name {
          font-size: 0.9375rem;
          font-weight: 600;
          color: #334155;
        }
        .seller-badge {
          font-size: 0.75rem;
          font-weight: 700;
          padding: 2px 6px;
          border-radius: 6px;
          margin-left: 6px;
        }
        .seller-badge.ds {
          background: #dbeafe;
          color: #1d4ed8;
          border: 1px solid #93c5fd;
        }
        .seller-badge.rs {
          background: #ffedd5;
          color: #c2410c;
          border: 1px solid #fbbf80;
        }
        .bale-author-rating {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 0.8125rem;
          color: #64748b;
          margin-left: 10px;
        }
        .bale-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 1rem;
        }
        .bale-badge {
          padding: 4px 12px;
          border-radius: 999px;
          font-size: 0.75rem;
          font-weight: 600;
          background: #f1f5f9;
          color: #475569;
        }
        .badge-condition {
          background: #dcfce7;
          color: #166534;
        }
        .badge-origin {
          background: #fef3c7;
          color: #92400e;
        }
        .badge-weight {
          background: #f3e8ff;
          color: #7e22ce;
        }
        .badge-pieces {
          background: #e0f2fe;
          color: #0369a1;
        }
        .bale-price {
          font-size: 1.5rem;
          font-weight: 800;
          color: #1e40af;
          margin-bottom: 1rem;
        }
        .bale-buttons {
          display: flex;
          gap: 12px;
          margin-top: auto;
          padding-top: 12px;
          border-top: 1px solid #eaeaea;
        }
        .bale-btn {
          flex: 1;
          padding: 12px;
          border-radius: 12px;
          font-size: 0.9375rem;
          font-weight: 600;
          text-align: center;
          text-decoration: none;
          border: none;
          display: inline-block;
        }
        .btn-view {
          background: linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%);
          color: white;
        }
        .btn-order {
          background: linear-gradient(135deg, #10b981 0%, #047857 100%);
          color: white;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }
        .no-results {
          text-align: center;
          padding: 3rem;
          color: #64748b;
          font-size: 1.25rem;
        }

        /* Testimonials Section */
        .testimonials-section {
          margin-top: 3rem;
          padding-top: 2rem;
          border-top: 2px solid #eaeaea;
        }
        .testimonials-title {
          text-align: center;
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: 2rem;
          color: #0f172a;
        }
        .testimonials-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1.5rem;
        }
        .testimonial-card {
          background: #f9fafb;
          border-radius: 20px;
          padding: 1.5rem;
          border: 1px solid #eaeaea;
          transition: transform 0.2s;
        }
        .testimonial-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
        }
        .testimonial-text {
          font-size: 0.95rem;
          line-height: 1.5;
          color: #1e293b;
          margin-bottom: 1rem;
          font-style: italic;
        }
        .testimonial-author {
          font-weight: 700;
          color: #475569;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .testimonial-stars {
          display: inline-flex;
          gap: 2px;
          color: #f59e0b;
          font-size: 0.85rem;
        }
        .show-more-btn {
          display: block;
          margin: 2rem auto 0;
          padding: 10px 24px;
          background: #f1f5f9;
          color: #1e293b;
          border: none;
          border-radius: 40px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .show-more-btn:hover {
          background: #e2e8f0;
          transform: translateY(-2px);
        }

        @media (max-width: 640px) {
          .bales-grid {
            grid-template-columns: 1fr;
          }
          .bale-secondary-thumbnails {
            width: 50px;
          }
          .bale-secondary-thumbnails img {
            height: 50px;
          }
          .bale-main-image {
            height: 160px;
          }
          .testimonials-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      {/* Category Navigation */}
      <div className="category-nav">
        <a href="/" className={category === 'all' ? 'active' : ''}>All</a>
        <a href="/?category=men" className={category === 'men' ? 'active' : ''}>Men</a>
        <a href="/?category=ladies" className={category === 'ladies' ? 'active' : ''}>Ladies</a>
        <a href="/?category=kids" className={category === 'kids' ? 'active' : ''}>Kids</a>
        <a href="/?category=accessories" className={category === 'accessories' ? 'active' : ''}>Accessories</a>
        <a href="/?category=mix" className={category === 'mix' ? 'active' : ''}>Mix</a>
      </div>

      {/* Search Form */}
      <div className="search-wrapper">
        <form className="search-form" action="/" method="GET">
          <input
            type="text"
            name="search"
            defaultValue={search || ''}
            placeholder="Search mitumba bales by name, description, or origin..."
            className="search-input"
          />
          {category && category !== 'all' && <input type="hidden" name="category" value={category} />}
          <button type="submit" className="search-btn">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        </form>
      </div>

      {/* Featured Bales Section */}
      {featuredBales.length > 0 && (
        <>
          <h2 className="section-title">🔥 Featured Bales</h2>
          <div className="bales-grid">
            {featuredBales.map((bale) => (
              <div key={bale.id} className="bale-card">
                {/* Same card JSX as below – to avoid duplication, you could extract a component, but for clarity we repeat */}
                <div className="bale-image-wrapper">
                  <div className="bale-main-image">
                    {bale.main_image_url ? (
                      <img src={bale.main_image_url} alt={bale.bale_name} />
                    ) : (
                      <div className="no-samples" style={{ height: '100%', background: '#e2e8f0' }}>No image</div>
                    )}
                  </div>
                  <div className="bale-secondary-thumbnails">
                    {bale.secondary_images?.slice(0, 3).map((url, idx) => (
                      <a key={idx} href={url} target="_blank" rel="noopener noreferrer">
                        <img src={url} alt="Sample" />
                      </a>
                    ))}
                    {(!bale.secondary_images || bale.secondary_images.length === 0) && (
                      <div className="no-samples">No<br />Samples</div>
                    )}
                  </div>
                </div>
                <div className="bale-content">
                  <h3 className="bale-title">{bale.bale_name}</h3>
                  <div className="bale-author">
                    {bale.seller.profile_pic_url ? (
                      <img src={bale.seller.profile_pic_url} alt="" className="bale-author-avatar" />
                    ) : (
                      <div className="bale-author-avatar">{bale.seller.display_name.charAt(0)}</div>
                    )}
                    <div className="bale-author-name">{bale.seller.display_name}</div>
                    {bale.seller.supplier_type && (
                      <span className={`seller-badge ${bale.seller.supplier_type.toLowerCase()}`}>
                        {bale.seller.supplier_type}
                      </span>
                    )}
                    {bale.review_count > 0 && (
                      <div className="bale-author-rating">
                        <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span>{bale.avg_rating.toFixed(1)} ({bale.review_count})</span>
                      </div>
                    )}
                  </div>
                  <div className="bale-meta">
                    {bale.condition && <span className="bale-badge badge-condition">{bale.condition}</span>}
                    {bale.origin && <span className="bale-badge badge-origin">{bale.origin}</span>}
                    {bale.weight_kg && <span className="bale-badge badge-weight">{bale.weight_kg} kg</span>}
                    {bale.pieces && <span className="bale-badge badge-pieces">{bale.pieces} pcs</span>}
                  </div>
                  <div className="bale-price">KES {bale.price.toLocaleString()}</div>
                  <div className="bale-buttons">
                    <a href={`/bale/${bale.id}`} className="bale-btn btn-view">View</a>
                    <a
                      href={`/checkout?bale_id=${bale.id}&bale_name=${encodeURIComponent(bale.bale_name)}&price=${bale.price}`}
                      className="bale-btn btn-order"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M17.472 14.362c-.298-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.298-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                        <path d="M12 2C6.477 2 2 6.477 2 12a9.994 9.994 0 006.838 9.488c.5.087.687-.211.687-.469 0-.233-.008-.845-.013-1.637-2.494.488-3.203-.988-3.478-1.554-.344-.889-.833-1.164-1.233-1.164-.5 0-.833.297-.833.889 0 .52.033 1.164.05 1.313.133.625.875 1.137 1.587 1.286.273.05.625.199 1.125.313.333.074.733.111 1.133.111.4 0 .8-.05 1.199-.15 1-.25 1.866-.763 2.39-1.555.333-.5.5-1.164.5-1.813 0-.624-.167-1.124-.5-1.549-1.45-.175-2.5-1.112-2.5-2.5 0-.75.25-1.425.712-1.912-.017-.175-.325-1.6.075-2.2 0 0 .6-1.913 1.912-1.913.5 0 .925.225 1.237.625.35.437.463 1.012.438 1.587-.138.813-.55 1.463-1.013 1.913-.412.4-.75.675-1.125.887.088.25.163.563.163.913 0 .625-.013 1.125-.013 1.287 0 .15.1.338.438.338.388 0 1.038-.038 1.688-.213-1.125 1.388-2.575 2.212-4.162 2.287z" />
                      </svg>
                      Order Now
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Regular Bales Section */}
      {regularBales.length === 0 && featuredBales.length === 0 ? (
        <div className="no-results">No bales found.</div>
      ) : (
        regularBales.length > 0 && (
          <>
            <h2 className="section-title">📦 All Bales</h2>
            <div className="bales-grid">
              {regularBales.map((bale) => (
                <div key={bale.id} className="bale-card">
                  {/* Same card JSX as featured – consider extracting a component later */}
                  <div className="bale-image-wrapper">
                    <div className="bale-main-image">
                      {bale.main_image_url ? (
                        <img src={bale.main_image_url} alt={bale.bale_name} />
                      ) : (
                        <div className="no-samples" style={{ height: '100%', background: '#e2e8f0' }}>No image</div>
                      )}
                    </div>
                    <div className="bale-secondary-thumbnails">
                      {bale.secondary_images?.slice(0, 3).map((url, idx) => (
                        <a key={idx} href={url} target="_blank" rel="noopener noreferrer">
                          <img src={url} alt="Sample" />
                        </a>
                      ))}
                      {(!bale.secondary_images || bale.secondary_images.length === 0) && (
                        <div className="no-samples">No<br />Samples</div>
                      )}
                    </div>
                  </div>
                  <div className="bale-content">
                    <h3 className="bale-title">{bale.bale_name}</h3>
                    <div className="bale-author">
                      {bale.seller.profile_pic_url ? (
                        <img src={bale.seller.profile_pic_url} alt="" className="bale-author-avatar" />
                      ) : (
                        <div className="bale-author-avatar">{bale.seller.display_name.charAt(0)}</div>
                      )}
                      <div className="bale-author-name">{bale.seller.display_name}</div>
                      {bale.seller.supplier_type && (
                        <span className={`seller-badge ${bale.seller.supplier_type.toLowerCase()}`}>
                          {bale.seller.supplier_type}
                        </span>
                      )}
                      {bale.review_count > 0 && (
                        <div className="bale-author-rating">
                          <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          <span>{bale.avg_rating.toFixed(1)} ({bale.review_count})</span>
                        </div>
                      )}
                    </div>
                    <div className="bale-meta">
                      {bale.condition && <span className="bale-badge badge-condition">{bale.condition}</span>}
                      {bale.origin && <span className="bale-badge badge-origin">{bale.origin}</span>}
                      {bale.weight_kg && <span className="bale-badge badge-weight">{bale.weight_kg} kg</span>}
                      {bale.pieces && <span className="bale-badge badge-pieces">{bale.pieces} pcs</span>}
                    </div>
                    <div className="bale-price">KES {bale.price.toLocaleString()}</div>
                    <div className="bale-buttons">
                      <a href={`/bale/${bale.id}`} className="bale-btn btn-view">View</a>
                      <a
                        href={`/checkout?bale_id=${bale.id}&bale_name=${encodeURIComponent(bale.bale_name)}&price=${bale.price}`}
                        className="bale-btn btn-order"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M17.472 14.362c-.298-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.298-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                          <path d="M12 2C6.477 2 2 6.477 2 12a9.994 9.994 0 006.838 9.488c.5.087.687-.211.687-.469 0-.233-.008-.845-.013-1.637-2.494.488-3.203-.988-3.478-1.554-.344-.889-.833-1.164-1.233-1.164-.5 0-.833.297-.833.889 0 .52.033 1.164.05 1.313.133.625.875 1.137 1.587 1.286.273.05.625.199 1.125.313.333.074.733.111 1.133.111.4 0 .8-.05 1.199-.15 1-.25 1.866-.763 2.39-1.555.333-.5.5-1.164.5-1.813 0-.624-.167-1.124-.5-1.549-1.45-.175-2.5-1.112-2.5-2.5 0-.75.25-1.425.712-1.912-.017-.175-.325-1.6.075-2.2 0 0 .6-1.913 1.912-1.913.5 0 .925.225 1.237.625.35.437.463 1.012.438 1.587-.138.813-.55 1.463-1.013 1.913-.412.4-.75.675-1.125.887.088.25.163.563.163.913 0 .625-.013 1.125-.013 1.287 0 .15.1.338.438.338.388 0 1.038-.038 1.688-.213-1.125 1.388-2.575 2.212-4.162 2.287z" />
                        </svg>
                        Order Now
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )
      )}

      {/* Testimonials Section */}
      {allReviews.length > 0 && <Testimonials initialReviews={allReviews} />}
    </div>
  );
}