'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase';

export default function CheckoutForm({ params }: { params: { bale_id?: string; bale_name?: string; price?: string } }) {
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [mpesaMessage, setMpesaMessage] = useState('');
  const [deliveryLocation, setDeliveryLocation] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      
      const { error: insertError } = await supabase
        .from('orders')
        .insert({
          bale_id: params.bale_id,
          bale_name: params.bale_name,
          price: params.price ? parseInt(params.price) : 0,
          mpesa_message: mpesaMessage.trim(),
          delivery_location: deliveryLocation.trim(),
          contact_phone: contactPhone.trim(),
          notes: notes.trim() || null,
          status: 'pending',
          created_at: new Date().toISOString(),
        });

      if (insertError) throw insertError;
      setStep('success');
    } catch (err: any) {
      console.error('Order submission error:', err);
      setError(err.message || 'Failed to submit order. Please check your details and try again.');
    } finally {
      setLoading(false);
    }
  };

  if (step === 'success') {
    return (
      <>
        <div className="text-center py-8">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Submitted!</h2>
          <p className="text-gray-600 mb-6">
            Thank you! Your order is being processed. We'll contact you on <strong>{contactPhone}</strong> to confirm delivery.
          </p>
          
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 text-left">
            <p className="text-blue-900 font-medium mb-2">📋 Order Summary</p>
            <p className="text-blue-800 text-sm">Bale: {params.bale_name}</p>
            <p className="text-blue-800 text-sm">Amount: KES {params.price ? parseInt(params.price).toLocaleString() : '0'}</p>
            <p className="text-blue-800 text-sm">Delivery: {deliveryLocation}</p>
          </div>

          <div className="space-y-3">
            <a 
              href={`https://wa.me/254757248296?text=Hi Samda, I just submitted an order for ${encodeURIComponent(params.bale_name || 'Item')} (KES ${params.price}). Please confirm.`}
              className="inline-flex items-center justify-center gap-2 w-full px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.362c-.298-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.298-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                <path d="M12 2C6.477 2 2 6.477 2 12a9.994 9.994 0 006.838 9.488c.5.087.687-.211.687-.469 0-.233-.008-.845-.013-1.637-2.494.488-3.203-.988-3.478-1.554-.344-.889-.833-1.164-1.233-1.164-.5 0-.833.297-.833.889 0 .52.033 1.164.05 1.313.133.625.875 1.137 1.587 1.286.273.05.625.199 1.125.313.333.074.733.111 1.133.111.4 0 .8-.05 1.199-.15 1-.25 1.866-.763 2.39-1.555.333-.5.5-1.164.5-1.813 0-.624-.167-1.124-.5-1.549-1.45-.175-2.5-1.112-2.5-2.5 0-.75.25-1.425.712-1.912-.017-.175-.325-1.6.075-2.2 0 0 .6-1.913 1.912-1.913.5 0 .925.225 1.237.625.35.437.463 1.012.438 1.587-.138.813-.55 1.463-1.013 1.913-.412.4-.75.675-1.125.887.088.25.163.563.163.913 0 .625-.013 1.125-.013 1.287 0 .15.1.338.438.338.388 0 1.038-.038 1.688-.213-1.125 1.388-2.575 2.212-4.162 2.287z"/>
              </svg>
              Confirm on WhatsApp
            </a>
            <a href="/" className="inline-flex items-center justify-center gap-2 w-full px-6 py-3 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-lg transition-colors">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Shop
            </a>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Order Summary */}
      <div className="order-card" style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '16px', padding: '1.5rem', marginBottom: '1.5rem' }}>
        <h2 className="order-card-title" style={{ fontSize: '1.125rem', fontWeight: 700, color: '#111827', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          Order Summary
        </h2>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px solid #e5e7eb' }}>
          <span style={{ color: '#6b7280', fontSize: '0.95rem' }}>Bale Name</span>
          <span style={{ fontWeight: 600, color: '#111827', textAlign: 'right' }}>{params.bale_name || `Bale #${params.bale_id}`}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem 0', borderBottom: '1px solid #e5e7eb' }}>
          <span style={{ color: '#6b7280', fontSize: '0.95rem' }}>Bale ID</span>
          <span style={{ fontWeight: 600, color: '#111827', textAlign: 'right' }}>#{params.bale_id}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '1rem', marginTop: '1rem', borderTop: '2px solid #e5e7eb', fontSize: '1.25rem', fontWeight: 800 }}>
          <span style={{ color: '#111827' }}>Total Amount</span>
          <span style={{ color: '#1e40af' }}>KES {params.price ? parseInt(params.price).toLocaleString() : '0'}</span>
        </div>
      </div>

      {/* Payment Instructions */}
      <div className="payment-card" style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '16px', padding: '1.5rem', marginBottom: '1.5rem' }}>
        <h2 className="payment-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1.125rem', fontWeight: 700, color: '#166534', marginBottom: '1rem' }}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
          Step 1: Make M-Pesa Payment
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
            <span style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#10b981', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, flexShrink: 0, marginTop: '2px' }}>1</span>
            <p style={{ color: '#166534', fontSize: '0.95rem', lineHeight: 1.5 }}>Go to <strong style={{ color: '#111827', fontWeight: 700 }}>M-Pesa</strong> on your phone</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
            <span style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#10b981', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, flexShrink: 0, marginTop: '2px' }}>2</span>
            <p style={{ color: '#166534', fontSize: '0.95rem', lineHeight: 1.5 }}>Select <strong style={{ color: '#111827', fontWeight: 700 }}>Lipa Na M-Pesa</strong> → <strong style={{ color: '#111827', fontWeight: 700 }}>Pay Bill</strong></p>
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
            <span style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#10b981', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, flexShrink: 0, marginTop: '2px' }}>3</span>
            <p style={{ color: '#166534', fontSize: '0.95rem', lineHeight: 1.5 }}>Enter details & complete payment</p>
          </div>
        </div>
        
        <div style={{ background: 'white', border: '1px dashed #86efac', borderRadius: '12px', padding: '1rem', marginTop: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', fontSize: '0.95rem' }}>
            <span style={{ color: '#6b7280' }}>Business Number</span>
            <span style={{ fontWeight: 600, color: '#111827', fontFamily: 'monospace' }}>625625</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', fontSize: '0.95rem' }}>
            <span style={{ color: '#6b7280' }}>Account Number</span>
            <span style={{ fontWeight: 600, color: '#111827', fontFamily: 'monospace' }}>01201254723500</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0', fontSize: '0.95rem' }}>
            <span style={{ color: '#6b7280' }}>Amount</span>
            <span style={{ fontWeight: 600, color: '#111827', fontFamily: 'monospace' }}>KES {params.price ? parseInt(params.price).toLocaleString() : '0'}</span>
          </div>
        </div>
        
        <p style={{ marginTop: '1rem', fontSize: '0.875rem', color: '#166534', lineHeight: 1.5 }}>
          <strong style={{ color: '#111827', fontWeight: 700 }}>Tip:</strong> Keep the M-Pesa confirmation SMS handy. You'll paste it below.
        </p>
      </div>

      {/* Delivery Details Form */}
      <div className="order-card" style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: '16px', padding: '1.5rem', marginBottom: '1.5rem' }}>
        <h2 className="order-card-title" style={{ fontSize: '1.125rem', fontWeight: 700, color: '#111827', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          Step 2: Delivery Details
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* M-Pesa Message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              M-Pesa Confirmation Message <span className="text-red-500">*</span>
            </label>
            <textarea
              value={mpesaMessage}
              onChange={(e) => setMpesaMessage(e.target.value)}
              placeholder="Paste the entire M-Pesa SMS here (e.g., QGH45XYZ12 paid to...)"
              required
              rows={3}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
            />
            <p className="text-xs text-gray-500 mt-1">We use this to verify your payment instantly</p>
          </div>

          {/* Delivery Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Delivery Location <span className="text-red-500">*</span>
            </label>
            <textarea
              value={deliveryLocation}
              onChange={(e) => setDeliveryLocation(e.target.value)}
              placeholder="Kisumu"
              required
              rows={2}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
            />
            <p className="text-xs text-gray-500 mt-1">Town, estate, or landmark for delivery</p>
          </div>

          {/* Contact Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contact Phone Number <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              placeholder="e.g., 0712 345 678"
              required
              pattern="^0[79]\d{8}$"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            />
            <p className="text-xs text-gray-500 mt-1">We'll call or WhatsApp you to confirm delivery</p>
          </div>

          {/* Optional Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Additional Notes <span className="text-gray-400">(optional)</span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g., Call before delivery, nearby landmark, etc."
              rows={2}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !mpesaMessage || !deliveryLocation || !contactPhone}
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Submitting Order...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Complete Order & Submit
              </>
            )}
          </button>
        </form>
      </div>

      {/* Support Note */}
      <div style={{ textAlign: 'center', padding: '1.5rem', background: '#f9fafb', borderRadius: '12px' }}>
        <p style={{ color: '#6b7280', fontSize: '0.9rem', marginBottom: '0.5rem' }}>Need help?</p>
        <a href="https://wa.me/254757248296" style={{ color: '#1e40af', fontWeight: 600, textDecoration: 'none' }}>Chat with us on WhatsApp</a>
        <p style={{ marginTop: '0.5rem', color: '#6b7280', fontSize: '0.9rem' }}>📞 +254 757 248 296 | 🕐 Mon-Sat, 8AM-8PM</p>
      </div>
    </>
  );
}