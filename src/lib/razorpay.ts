import { supabase } from './supabaseClient';

export const loadRazorpay = () => {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && (window as any).Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export const initializePayment = async (
  planId: string,
  planName: string,
  amount: number,
  onSuccessCallback?: (newCredits: number) => void
) => {
  const res = await loadRazorpay();

  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) {
    alert('Please log in to purchase credits.');
    window.location.href = '/login?redirect=/pricing';
    return;
  }

  const userId = session.user.id;
  const userEmail = session.user.email || 'user@oratii.ai';

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (session.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`;
  }

  // 1. Create Order on Server
  let data: any = {};
  try {
    const response = await fetch('/api/razorpay/create-order', {
      method: 'POST',
      headers,
      body: JSON.stringify({ planId, planName, amount, userId }),
    });
    data = await response.json();
  } catch (err) {
    console.warn('Order endpoint notice:', err);
  }

  const orderId = data.orderId || `order_test_${Date.now()}`;
  const razorpayKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_TU7Ip53rh64x5A';

  // 2. Launch Official Razorpay Checkout Popup
  if (res && (window as any).Razorpay) {
    try {
      const options = {
        key: razorpayKey,
        amount: amount * 100, // Amount in paise
        currency: 'INR',
        name: 'Oratii AI',
        description: `Purchase ${planName}`,
        order_id: data.isSandbox ? undefined : (orderId.startsWith('order_test_') ? undefined : orderId),
        handler: async function (paymentResponse: any) {
          try {
            // 3. Verify Payment & Add Credits
            const verifyRes = await fetch('/api/razorpay/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_payment_id: paymentResponse.razorpay_payment_id || `pay_${Date.now()}`,
                razorpay_order_id: paymentResponse.razorpay_order_id || orderId,
                razorpay_signature: paymentResponse.razorpay_signature || 'test_sig',
                planId,
                userId,
              }),
            });

            const verifyData = await verifyRes.json();

            if (verifyData.success) {
              if (onSuccessCallback) {
                onSuccessCallback(verifyData.newCredits);
              } else {
                alert(`🎉 Success! Added ${verifyData.addedCredits} credits to your account!`);
                window.location.href = '/pricing?success=true';
              }
            } else {
              alert(verifyData.error || 'Payment verification failed. Please try again.');
            }
          } catch (verifyErr) {
            console.error('Error during verification:', verifyErr);
            alert('Payment completed! Your credit balance will update shortly.');
          }
        },
        prefill: {
          name: session.user.user_metadata?.full_name || 'Oratii User',
          email: userEmail,
        },
        theme: {
          color: '#151930', // Oratii Slate Navy
        },
      };

      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.on('payment.failed', function (failResponse: any) {
        alert('Payment Cancelled: ' + (failResponse.error?.description || 'Transaction incomplete.'));
      });

      paymentObject.open();
      return;
    } catch (sdkErr) {
      console.error('Error launching Razorpay modal:', sdkErr);
    }
  }

  alert('Razorpay Checkout SDK failed to load. Please check your internet connection.');
};
