import { Suspense } from 'react';

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
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <h1>Invalid Order</h1>
        <p>No bale selected. <a href="/">Go back home</a></p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '600px', margin: '2rem auto', padding: '1rem' }}>
      <h1>Complete Your Order</h1>
      <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '12px', margin: '1rem 0' }}>
        <p><strong>Bale:</strong> {baleName}</p>
        <p><strong>Price:</strong> KES {price}</p>
        <p><strong>Bale ID:</strong> {baleId}</p>
      </div>
      <div style={{ background: '#f0fdf4', padding: '1rem', borderRadius: '12px', margin: '1rem 0' }}>
        <h3>M-Pesa Payment Instructions</h3>
        <p><strong>Paybill:</strong> 625625</p>
        <p><strong>Account Number:</strong> 01201254723500</p>
        <p><small>Enter your phone number as the account number.</small></p>
      </div>
      <a href="/" style={{ display: 'inline-block', marginTop: '1rem', color: '#4f46e5' }}>← Back to Home</a>
    </div>
  );
}