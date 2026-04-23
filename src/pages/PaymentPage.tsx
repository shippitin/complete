// src/pages/PaymentPage.tsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';

declare global {
  interface Window {
    Razorpay: any;
  }
}

const PaymentPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);

  const bookingId = location.state?.bookingId;
  const amount = location.state?.amount;
  const bookingNumber = location.state?.bookingNumber;
  const serviceType = location.state?.serviceType;

  useEffect(() => {
    // Load Razorpay script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => setScriptLoaded(true);
    script.onerror = () => toast.error('Failed to load payment gateway.');
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handlePayment = async () => {
    if (!scriptLoaded) {
      toast.error('Payment gateway is still loading. Please wait.');
      return;
    }

    setLoading(true);

    try {
      // Create order on backend
      const orderResponse = await api.post('/payments/create-order', {
        bookingId,
        amount,
        currency: 'INR',
      });

      const { orderId, keyId } = orderResponse.data.data;

      // Get user from localStorage
      const user = JSON.parse(localStorage.getItem('shippitin_user') || '{}');

      // Open Razorpay checkout
      const options = {
        key: keyId,
        amount: amount * 100, // paise
        currency: 'INR',
        name: 'Shippitin Logistics',
        description: `Payment for ${serviceType} booking ${bookingNumber}`,
        order_id: orderId,
        prefill: {
          name: user.full_name || '',
          email: user.email || '',
          contact: user.phone || '',
        },
        theme: {
          color: '#2563eb',
        },
        handler: async (response: any) => {
          try {
            // Verify payment on backend
            await api.post('/payments/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              bookingId,
            });

            toast.success('Payment successful! 🎉');
            navigate('/payment-success', {
              state: {
                bookingNumber,
                paymentId: response.razorpay_payment_id,
                amount,
                serviceType,
              },
            });
          } catch (error) {
            toast.error('Payment verification failed. Please contact support.');
          }
        },
        modal: {
          ondismiss: () => {
            toast.error('Payment cancelled.');
            setLoading(false);
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to initiate payment.');
    } finally {
      setLoading(false);
    }
  };

  if (!bookingId || !amount) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-2xl shadow-lg text-center">
          <p className="text-gray-600 mb-4">No booking details found.</p>
          <button onClick={() => navigate('/')} className="bg-blue-600 text-white px-6 py-2 rounded-lg">
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg overflow-hidden">

        {/* Header */}
        <div className="bg-blue-600 p-6 text-white text-center">
          <h1 className="text-2xl font-bold">Complete Payment</h1>
          <p className="text-blue-100 text-sm mt-1">Secure payment powered by Razorpay</p>
        </div>

        {/* Booking Summary */}
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-500 uppercase mb-4">Booking Summary</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-500 text-sm">Booking ID</span>
              <span className="font-semibold text-gray-800 text-sm">{bookingNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 text-sm">Service</span>
              <span className="font-semibold text-gray-800 text-sm">{serviceType}</span>
            </div>
            <div className="flex justify-between border-t pt-3">
              <span className="text-gray-800 font-bold">Total Amount</span>
              <span className="text-blue-600 font-black text-xl">₹{amount?.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-500 uppercase mb-4">Accepted Payment Methods</h2>
          <div className="flex flex-wrap gap-2">
            {['UPI', 'Credit Card', 'Debit Card', 'Net Banking', 'Wallets'].map(method => (
              <span key={method} className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full font-medium">
                {method}
              </span>
            ))}
          </div>
        </div>

        {/* Pay Button */}
        <div className="p-6">
          <button
            onClick={handlePayment}
            disabled={loading || !scriptLoaded}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></span>
            ) : (
              <>
                🔒 Pay ₹{amount?.toLocaleString('en-IN')} Securely
              </>
            )}
          </button>
          <p className="text-center text-xs text-gray-400 mt-3">
            Your payment is secured by 256-bit SSL encryption
          </p>
          <button
            onClick={() => navigate(-1)}
            className="w-full text-gray-500 text-sm mt-3 hover:underline"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
