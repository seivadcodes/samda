import { Suspense } from 'react';
import CheckoutForm from '@/components/CheckoutForm';

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ bale_id?: string; bale_name?: string; price?: string }>;
}) {
  const params = await searchParams;
  const baleId = params.bale_id;
  const baleName = params.bale_name ? decodeURIComponent(params.bale_name) : '';
  const price = params.price;

  if (!baleId) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Invalid Order</h1>
          <p className="text-gray-600 mb-6">No bale selected. Please choose a product to continue.</p>
          <a href="/" className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Shop
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-gray-900">
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #ffffff; color: #111827; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; }
        .container { max-width: 700px; margin: 0 auto; padding: 2rem 1.5rem; }
        .checkout-header { text-align: center; padding-bottom: 2rem; border-bottom: 1px solid #e5e7eb; margin-bottom: 2rem; }
        .checkout-title { font-size: 1.875rem; font-weight: 800; color: #111827; margin-bottom: 0.5rem; }
        .checkout-subtitle { color: #6b7280; font-size: 1rem; }
        .progress-steps { display: flex; justify-content: center; gap: 1rem; margin: 1.5rem 0; }
        .progress-step { display: flex; align-items: center; gap: 0.5rem; font-size: 0.875rem; color: #6b7280; }
        .progress-step.active { color: #1e40af; font-weight: 600; }
        .progress-step.completed { color: #10b981; }
        .step-dot { width: 24px; height: 24px; border-radius: 50%; background: #e5e7eb; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 600; color: #6b7280; }
        .progress-step.active .step-dot { background: #1e40af; color: white; }
        .progress-step.completed .step-dot { background: #10b981; color: white; }
        .footer-note { text-align: center; padding-top: 2rem; margin-top: 2rem; border-top: 1px solid #e5e7eb; color: #9ca3af; font-size: 0.875rem; }
        @media (max-width: 640px) { .container { padding: 1.5rem 1rem; } .checkout-title { font-size: 1.5rem; } .progress-steps { flex-wrap: wrap; } }
      `}</style>

      <div className="container">
        <div className="checkout-header">
          <h1 className="checkout-title">Complete Your Order</h1>
          <p className="checkout-subtitle">Secure checkout with M-Pesa</p>
          <div className="progress-steps">
            <div className="progress-step completed">
              <span className="step-dot">✓</span>
              <span>Cart</span>
            </div>
            <div className="progress-step active">
              <span className="step-dot">2</span>
              <span>Payment</span>
            </div>
            <div className="progress-step">
              <span className="step-dot">3</span>
              <span>Confirmation</span>
            </div>
          </div>
        </div>

        <Suspense fallback={
          <div className="text-center py-12">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading checkout...</p>
          </div>
        }>
          <CheckoutForm params={{ bale_id: baleId, bale_name: baleName, price }} />
        </Suspense>

        <div className="footer-note">
          <p>🔒 Your payment is secure. Samda Mitumba never stores your M-Pesa details.</p>
          <p style={{marginTop: '0.25rem'}}>© {new Date().getFullYear()} Samda Mitumba Kenya. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}