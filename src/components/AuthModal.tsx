// src/components/AuthModal.tsx
import React, { useState } from "react";
import { Dialog } from "@headlessui/react";
import { X } from "lucide-react";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    company: "",
    gstin: "",
    pan: "",
    tan: "",
    aadhar: "",
    din: "",
    cpda: "",
    landline: "",
    mobile: "",
    address: "",
    customerType: "",
    files: null as File | null,
  });

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFormData((prev) => ({ ...prev, files: file }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submitted", formData);
  };

  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      {/* Background Overlay: Retained as black/30 for modal effect */}
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        {/* Modal Panel: Using Pure White as per palette */}
        <Dialog.Panel className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
          <div className="flex justify-between items-center mb-4">
            <div className="flex space-x-2">
              {/* Login Tab Button */}
              <button
                onClick={() => setActiveTab("login")}
                className={`px-4 py-1 rounded-full text-sm font-medium ${
                  activeTab === "login"
                    ? "bg-[#34495E] text-white" // Deep Slate Blue for active tab background
                    : "bg-white text-[#666666]" // Pure White for inactive tab background, Medium Grey for text
                }`}
              >
                Login
              </button>
              {/* Sign Up Tab Button */}
              <button
                onClick={() => setActiveTab("signup")}
                className={`px-4 py-1 rounded-full text-sm font-medium ${
                  activeTab === "signup"
                    ? "bg-[#34495E] text-white" // Deep Slate Blue for active tab background
                    : "bg-white text-[#666666]" // Pure White for inactive tab background, Medium Grey for text
                }`}
              >
                Sign Up
              </button>
            </div>
            {/* Close Button (X icon) */}
            <button onClick={onClose} className="text-[#666666] hover:text-[#333333]"> {/* Medium Grey, hover Charcoal Grey */}
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {activeTab === "login" ? (
              <>
                {/* Login Form Title */}
                <h2 className="text-lg font-semibold mb-2 text-[#333333]">Login to Shippitin</h2> {/* Charcoal Grey for heading */}
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2 border-[#E0E0E0] text-[#333333] placeholder-[#666666]" // Added border color and text colors for consistency
                />
                <input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2 border-[#E0E0E0] text-[#333333] placeholder-[#666666]" // Added border color and text colors for consistency
                />
              </>
            ) : (
              <>
                {/* Sign Up Form Title */}
                <h2 className="text-lg font-semibold mb-2 text-[#333333]">Sign Up on Shippitin</h2> {/* Charcoal Grey for heading */}
                <input name="name" placeholder="Name" value={formData.name} onChange={handleChange} className="w-full border rounded px-3 py-2 border-[#E0E0E0] text-[#333333] placeholder-[#666666]" />
                <input name="company" placeholder="Company" value={formData.company} onChange={handleChange} className="w-full border rounded px-3 py-2 border-[#E0E0E0] text-[#333333] placeholder-[#666666]" />

                <div className="grid grid-cols-2 gap-3">
                  <input name="gstin" placeholder="GSTIN" value={formData.gstin} onChange={handleChange} className="border rounded px-3 py-2 border-[#E0E0E0] text-[#333333] placeholder-[#666666]" />
                  <input name="pan" placeholder="PAN" value={formData.pan} onChange={handleChange} className="border rounded px-3 py-2 border-[#E0E0E0] text-[#333333] placeholder-[#666666]" />
                  <input name="tan" placeholder="TAN" value={formData.tan} onChange={handleChange} className="border rounded px-3 py-2 border-[#E0E0E0] text-[#333333] placeholder-[#666666]" />
                  <input name="aadhar" placeholder="Aadhar" value={formData.aadhar} onChange={handleChange} className="border rounded px-3 py-2 border-[#E0E0E0] text-[#333333] placeholder-[#666666]" />
                  <input name="din" placeholder="DIN" value={formData.din} onChange={handleChange} className="border rounded px-3 py-2 border-[#E0E0E0] text-[#333333] placeholder-[#666666]" />
                  <input name="cpda" placeholder="CPDA" value={formData.cpda} onChange={handleChange} className="border rounded px-3 py-2 border-[#E0E0E0] text-[#333333] placeholder-[#666666]" />
                  <input name="landline" placeholder="Landline" value={formData.landline} onChange={handleChange} className="border rounded px-3 py-2 border-[#E0E0E0] text-[#333333] placeholder-[#666666]" />
                  <input name="mobile" placeholder="Mobile" value={formData.mobile} onChange={handleChange} className="border rounded px-3 py-2 border-[#E0E0E0] text-[#333333] placeholder-[#666666]" />
                </div>

                <input
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2 border-[#E0E0E0] text-[#333333] placeholder-[#666666]"
                />
                <textarea
                  name="address"
                  placeholder="GST Registered Address"
                  value={formData.address}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2 border-[#E0E0E0] text-[#333333] placeholder-[#666666]"
                />
                <select
                  name="customerType"
                  value={formData.customerType}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2 border-[#E0E0E0] text-[#333333]" // Text color for select
                >
                  <option value="" className="text-[#666666]">Select Customer Type</option> {/* Placeholder-like option text */}
                  <option value="retail" className="text-[#333333]">Retail</option>
                  <option value="corporate" className="text-[#333333]">Corporate</option>
                </select>
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="w-full border rounded px-3 py-2 border-[#E0E0E0] text-[#333333]" // Text color for file input
                />
              </>
            )}
            {/* Submit Button (Login/Sign Up) */}
            <button
              type="submit"
              className="w-full bg-[#34495E] text-white py-2 rounded hover:bg-[#2C3E50] transition" // Deep Slate Blue, darker hover
            >
              {activeTab === "login" ? "Login" : "Sign Up"}
            </button>
          </form>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
};

export default AuthModal;