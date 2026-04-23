import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

const SignUpPage: React.FC = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    company_name: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignup = async () => {
    if (!formData.full_name || !formData.email || !formData.phone || !formData.password) {
      toast.error('Please fill in all required fields.');
      return;
    }
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      const response = await authAPI.register(formData);
      const { token, user } = response.data.data;

      localStorage.setItem('shippitin_token', token);
      localStorage.setItem('shippitin_user', JSON.stringify(user));

      toast.success(`Welcome to Shippitin, ${user.full_name?.split(' ')[0]}! 🎉`);
navigate('/verify-email');
    } catch (err: any) {
      const message = err.response?.data?.message || 'Signup failed';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-logistics-doodle bg-repeat bg-fixed flex items-center justify-center px-4">
      <div className="bg-white shadow-xl rounded-xl w-full max-w-md p-6 md:p-8">
        <h2 className="text-2xl font-bold text-center text-[#333333] mb-6">
          Create Your Shippitin Account
        </h2>

        <div className="space-y-5">
          <div>
            <label className="block text-sm text-[#666666] mb-1">Full Name <span className="text-red-500">*</span></label>
            <input type="text" name="full_name" value={formData.full_name} onChange={handleChange}
              className="w-full border rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5A7A97] border-[#E0E0E0] text-[#333333] placeholder-[#666666]"
              placeholder="John Doe" />
          </div>

          <div>
            <label className="block text-sm text-[#666666] mb-1">Email Address <span className="text-red-500">*</span></label>
            <input type="email" name="email" value={formData.email} onChange={handleChange}
              className="w-full border rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5A7A97] border-[#E0E0E0] text-[#333333] placeholder-[#666666]"
              placeholder="you@example.com" />
          </div>

          <div>
            <label className="block text-sm text-[#666666] mb-1">Phone Number <span className="text-red-500">*</span></label>
            <input type="tel" name="phone" value={formData.phone} onChange={handleChange}
              className="w-full border rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5A7A97] border-[#E0E0E0] text-[#333333] placeholder-[#666666]"
              placeholder="+91 9876543210" />
          </div>

          <div>
            <label className="block text-sm text-[#666666] mb-1">Company Name (Optional)</label>
            <input type="text" name="company_name" value={formData.company_name} onChange={handleChange}
              className="w-full border rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5A7A97] border-[#E0E0E0] text-[#333333] placeholder-[#666666]"
              placeholder="Your Company Pvt Ltd" />
          </div>

          <div>
            <label className="block text-sm text-[#666666] mb-1">Password <span className="text-red-500">*</span></label>
            <input type="password" name="password" value={formData.password} onChange={handleChange}
              className="w-full border rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5A7A97] border-[#E0E0E0] text-[#333333] placeholder-[#666666]"
              placeholder="••••••••" />
          </div>

          <button onClick={handleSignup} disabled={loading}
            className="w-full bg-[#34495E] text-white py-2 rounded-md hover:bg-[#2C3E50] transition disabled:opacity-50">
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </div>

        <p className="mt-4 text-center text-sm text-[#666666]">
          Already have an account?{' '}
          <span className="text-[#34495E] hover:underline cursor-pointer" onClick={() => navigate('/login')}>
            Login
          </span>
        </p>
      </div>
    </div>
  );
};

export default SignUpPage;