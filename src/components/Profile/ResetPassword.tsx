// src/components/Profile/ResetPassword.tsx
import React, { useState } from 'react';
import styles from '../../pages/ProfilePage.module.css'; // Assuming common input styles

const ResetPassword: React.FC = () => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert('New password and confirm password do not match.');
      return;
    }
    console.log('Reset Password Attempt:', { oldPassword, newPassword });
    alert('Password reset initiated. Check your email for confirmation.');
    // Implement actual password reset logic
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 sm:p-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Reset Password</h1>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        <div>
          <label htmlFor="oldPassword" className="block text-gray-600 text-sm mb-1">Current Password</label>
          <input
            id="oldPassword"
            type="password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            className={styles.input}
            placeholder="Enter current password"
            required
          />
        </div>
        <div>
          <label htmlFor="newPassword" className="block text-gray-600 text-sm mb-1">New Password</label>
          <input
            id="newPassword"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className={styles.input}
            placeholder="Enter new password"
            required
          />
        </div>
        <div>
          <label htmlFor="confirmPassword" className="block text-gray-600 text-sm mb-1">Confirm New Password</label>
          <input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={styles.input}
            placeholder="Confirm new password"
            required
          />
        </div>
        <button
          type="submit"
          className="bg-blue-600 text-white py-2 px-6 rounded-md font-semibold hover:bg-blue-700 transition-colors shadow"
        >
          Change Password
        </button>
      </form>
    </div>
  );
};

export default ResetPassword;