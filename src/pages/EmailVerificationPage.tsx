// src/pages/EmailVerificationPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';

const EmailVerificationPage: React.FC = () => {
  const navigate = useNavigate();
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const user = JSON.parse(localStorage.getItem('shippitin_user') || '{}');
  const userId = user?.id;
  const email = user?.email;

  useEffect(() => {
    // If already verified or not logged in redirect
    if (!userId) {
      navigate('/login');
      return;
    }

    // Send OTP on page load
    handleSendOTP();

    // Countdown timer
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleSendOTP = async () => {
    try {
      await api.post('/auth/send-verification-otp', { userId, email });
    } catch (error) {
      console.error('Failed to send OTP:', error);
    }
  };

  const handleResendOTP = async () => {
    setResending(true);
    try {
      await api.post('/auth/send-verification-otp', { userId, email });
      toast.success('OTP resent to your email!');
      setCountdown(60);
      setCanResend(false);

      // Restart countdown
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error) {
      toast.error('Failed to resend OTP.');
    } finally {
      setResending(false);
    }
  };

  const handleVerify = async () => {
    if (!otp || otp.length !== 6) {
      toast.error('Please enter the 6-digit OTP.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/verify-email', { userId, otp });
      toast.success('Email verified successfully! 🎉');

      // Update user in localStorage
      const updatedUser = { ...user, is_verified: true };
      localStorage.setItem('shippitin_user', JSON.stringify(updatedUser));

      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Invalid or expired OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">

        {/* Icon */}
        <div className="text-center mb-6">
          <div className="text-6xl mb-4">📧</div>
          <h2 className="text-2xl font-bold text-gray-800">Verify Your Email</h2>
          <p className="text-gray-500 text-sm mt-2">
            We sent a 6-digit OTP to<br />
            <strong className="text-gray-800">{email}</strong>
          </p>
        </div>

        {/* OTP Input */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Enter OTP</label>
            <input
              type="text"
              value={otp}
              onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              onKeyPress={e => e.key === 'Enter' && handleVerify()}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-center text-2xl tracking-widest font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="000000"
              maxLength={6}
            />
          </div>

          <button
            onClick={handleVerify}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? 'Verifying...' : 'Verify Email'}
          </button>

          {/* Resend */}
          <div className="text-center">
            {canResend ? (
              <button
                onClick={handleResendOTP}
                disabled={resending}
                className="text-blue-600 text-sm hover:underline disabled:opacity-50"
              >
                {resending ? 'Resending...' : 'Resend OTP'}
              </button>
            ) : (
              <p className="text-gray-400 text-sm">
                Resend OTP in <span className="font-bold text-gray-600">{countdown}s</span>
              </p>
            )}
          </div>

          {/* Skip */}
          <button
            onClick={handleSkip}
            className="w-full text-gray-400 text-sm hover:underline mt-2"
          >
            Skip for now
          </button>
        </div>

        {/* Progress dots */}
        <div className="flex justify-center gap-2 mt-8">
          <div className="h-1.5 w-4 rounded-full bg-blue-300"></div>
          <div className="h-1.5 w-8 rounded-full bg-blue-600"></div>
          <div className="h-1.5 w-4 rounded-full bg-gray-200"></div>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationPage;
