// src/pages/PaymentSuccessPage.tsx
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const PaymentSuccessPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const { bookingNumber, paymentId, amount, serviceType } = location.state || {};

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg overflow-hidden text-center">

        <div className="bg-green-500 p-8">
          <div className="text-6xl mb-2">✅</div>
          <h1 className="text-2xl font-bold text-white">Payment Successful!</h1>
          <p className="text-green-100 text-sm mt-1">Your booking is confirmed</p>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-gray-50 rounded-xl p-4 text-left space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-500 text-sm">Booking ID</span>
              <span className="font-bold text-gray-800 text-sm">{bookingNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 text-sm">Payment ID</span>
              <span className="font-bold text-gray-800 text-sm">{paymentId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 text-sm">Service</span>
              <span className="font-bold text-gray-800 text-sm">{serviceType}</span>
            </div>
            <div className="flex justify-between border-t pt-3">
              <span className="text-gray-800 font-bold">Amount Paid</span>
              <span className="text-green-600 font-black text-xl">₹{amount?.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <p className="text-gray-500 text-sm">A confirmation email has been sent to your registered email address.</p>

          <div className="space-y-3">
            <button
              onClick={() => navigate('/my-bookings')}
              className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 transition"
            >
              View My Bookings
            </button>
            <button
              onClick={() => navigate('/')}
              className="w-full text-gray-500 text-sm hover:underline"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;
