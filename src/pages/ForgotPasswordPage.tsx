// src/pages/ForgotPasswordPage.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../services/api';

type Step = 'email' | 'otp' | 'newpassword' | 'success';

const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOTP = async () => {
    if (!email) {
      toast.error('Please enter your email address.');
      return;
    }
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      toast.success('OTP sent to your email!');
      setStep('otp');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to send OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = () => {
    if (!otp || otp.length !== 6) {
      toast.error('Please enter the 6-digit OTP.');
      return;
    }
    setStep('newpassword');
  };

  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      toast.error('Please fill in all fields.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/reset-password', {
        email,
        otp,
        new_password: newPassword,
      });
      toast.success('Password reset successfully!');
      setStep('success');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Invalid or expired OTP.');
      setStep('otp');
    } finally {
      setLoading(false);
    }
  };

  const inputClass = "w-full border border-gray-300 rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">

        {/* Step: Email */}
        {step === 'email' && (
          <>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Forgot Password</h2>
            <p className="text-gray-500 text-sm mb-6">Enter your registered email address and we'll send you an OTP.</p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && handleSendOTP()}
                  className={inputClass}
                  placeholder="you@example.com"
                />
              </div>
              <button
                onClick={handleSendOTP}
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 rounded-md font-semibold hover:bg-blue-700 transition disabled:opacity-50"
              >
                {loading ? 'Sending OTP...' : 'Send OTP'}
              </button>
              <button
                onClick={() => navigate('/login')}
                className="w-full text-gray-500 text-sm hover:underline"
              >
                Back to Login
              </button>
            </div>
          </>
        )}

        {/* Step: OTP */}
        {step === 'otp' && (
          <>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Enter OTP</h2>
            <p className="text-gray-500 text-sm mb-6">We sent a 6-digit OTP to <strong>{email}</strong>. Check your inbox.</p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">OTP</label>
                <input
                  type="text"
                  value={otp}
                  onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  onKeyPress={e => e.key === 'Enter' && handleVerifyOTP()}
                  className={`${inputClass} text-center text-2xl tracking-widest font-bold`}
                  placeholder="000000"
                  maxLength={6}
                />
              </div>
              <button
                onClick={handleVerifyOTP}
                className="w-full bg-blue-600 text-white py-2 rounded-md font-semibold hover:bg-blue-700 transition"
              >
                Verify OTP
              </button>
              <button
                onClick={handleSendOTP}
                disabled={loading}
                className="w-full text-blue-600 text-sm hover:underline disabled:opacity-50"
              >
                {loading ? 'Resending...' : 'Resend OTP'}
              </button>
              <button
                onClick={() => setStep('email')}
                className="w-full text-gray-500 text-sm hover:underline"
              >
                Change Email
              </button>
            </div>
          </>
        )}

        {/* Step: New Password */}
        {step === 'newpassword' && (
          <>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Set New Password</h2>
            <p className="text-gray-500 text-sm mb-6">Choose a strong new password for your account.</p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">New Password</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className={inputClass}
                  placeholder="Min 6 characters"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  onKeyPress={e => e.key === 'Enter' && handleResetPassword()}
                  className={inputClass}
                  placeholder="Repeat new password"
                />
              </div>
              <button
                onClick={handleResetPassword}
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 rounded-md font-semibold hover:bg-blue-700 transition disabled:opacity-50"
              >
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </div>
          </>
        )}

        {/* Step: Success */}
        {step === 'success' && (
          <div className="text-center">
            <div className="text-6xl mb-4">✅</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Password Reset!</h2>
            <p className="text-gray-500 text-sm mb-6">Your password has been reset successfully. You can now log in with your new password.</p>
            <button
              onClick={() => navigate('/login')}
              className="w-full bg-blue-600 text-white py-2 rounded-md font-semibold hover:bg-blue-700 transition"
            >
              Go to Login
            </button>
          </div>
        )}

        {/* Progress indicator */}
        {step !== 'success' && (
          <div className="flex justify-center gap-2 mt-8">
            {(['email', 'otp', 'newpassword'] as Step[]).map((s, i) => (
              <div
                key={s}
                className={`h-1.5 rounded-full transition-all ${
                  step === s ? 'w-8 bg-blue-600' : 
                  (['email', 'otp', 'newpassword'] as Step[]).indexOf(step) > i ? 'w-4 bg-blue-300' : 'w-4 bg-gray-200'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
