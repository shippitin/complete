// src/pages/SignUpPage.tsx
import React from 'react';

const SignUpPage: React.FC = () => {
  return (
    // Replaced solid color with your custom logistics doodle background
    <div className="min-h-screen bg-logistics-doodle bg-repeat bg-fixed flex items-center justify-center px-4">
      {/* Modal/Form Panel: Pure White background, subtle shadow */}
      <div className="bg-white shadow-xl rounded-xl w-full max-w-md p-6 md:p-8">
        {/* Heading: Charcoal Grey text */}
        <h2 className="text-2xl font-bold text-center text-[#333333] mb-6">Create Your Shippitin Account</h2>

        <form className="space-y-5">
          <div>
            {/* Label: Medium Grey text */}
            <label className="block text-sm text-[#666666] mb-1">Full Name</label>
            <input
              type="text"
              className="w-full border rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5A7A97] border-[#E0E0E0] text-[#333333] placeholder-[#666666]"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label className="block text-sm text-[#666666] mb-1">Email Address</label>
            <input
              type="email"
              className="w-full border rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5A7A97] border-[#E0E0E0] text-[#333333] placeholder-[#666666]"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm text-[#666666] mb-1">Phone Number</label>
            <input
              type="tel"
              className="w-full border rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5A7A97] border-[#E0E0E0] text-[#333333] placeholder-[#666666]"
              placeholder="+91 9876543210"
            />
          </div>

          <div>
            <label className="block text-sm text-[#666666] mb-1">Password</label>
            <input
              type="password"
              className="w-full border rounded-md px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5A7A97] border-[#E0E0E0] text-[#333333] placeholder-[#666666]"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#34495E] text-white py-2 rounded-md hover:bg-[#2C3E50] transition"
          >
            Sign Up
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-[#666666]">
          Already have an account? <a href="/login" className="text-[#34495E] hover:underline">Login</a>
        </p>
      </div>
    </div>
  );
};

export default SignUpPage;