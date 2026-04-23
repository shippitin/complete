// src/components/Profile/ResetPassword.tsx
import React, { useState } from 'react';
import { userAPI } from '../../services/api';
import toast from 'react-hot-toast';

const inputClass = "w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent";

const ResetPassword: React.FC = () => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error('New password and confirm password do not match.');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      await userAPI.changePassword({
        current_password: oldPassword,
        new_password: newPassword,
      });
      toast.success('Password changed successfully!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to change password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 sm:p-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Reset Password</h1>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        <div>
          <label className="block text-gray-600 text-sm mb-1">Current Password</label>
          <input type="password" value={oldPassword} onChange={e => setOldPassword(e.target.value)} className={inputClass} placeholder="Enter current password" required />
        </div>
        <div>
          <label className="block text-gray-600 text-sm mb-1">New Password</label>
          <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className={inputClass} placeholder="Enter new password (min 6 characters)" required />
        </div>
        <div>
          <label className="block text-gray-600 text-sm mb-1">Confirm New Password</label>
          <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className={inputClass} placeholder="Confirm new password" required />
        </div>
        <button type="submit" disabled={loading}
          className="bg-blue-600 text-white py-2 px-6 rounded-md font-semibold hover:bg-blue-700 transition-colors shadow disabled:opacity-50">
          {loading ? 'Changing...' : 'Change Password'}
        </button>
      </form>
    </div>
  );
};

export default ResetPassword;