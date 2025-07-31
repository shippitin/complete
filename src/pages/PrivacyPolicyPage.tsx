// src/pages/PrivacyPolicyPage.tsx
import React from 'react';

const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-purple-50 min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-500 to-purple-600 text-white py-16 px-4 text-center">
        <h1 className="text-4xl font-extrabold mb-3 animate-fade-in-up">
          Privacy <span className="text-yellow-300">Policy</span>
        </h1>
        <p className="text-lg max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: "100ms" }}>
          Your privacy is important to us. Learn how we collect, use, and protect your data.
        </p>
      </section>

      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200 prose max-w-none">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">1. Information We Collect</h2>
          <p>
            We collect information to provide better services to all our users. The types of information we collect include:
          </p>
          <ul>
            <li><strong>Personal Information:</strong> Name, email address, phone number, shipping addresses, payment information, and other details you provide when creating an account or booking a shipment.</li>
            <li><strong>Usage Data:</strong> Information about how you interact with our website and services, such as pages visited, features used, and time spent.</li>
            <li><strong>Device Information:</strong> Information about the device you use to access our services, including IP address, browser type, and operating system.</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">2. How We Use Your Information</h2>
          <p>
            We use the information we collect for various purposes, including:
          </p>
          <ul>
            <li>To provide and maintain our services.</li>
            <li>To process your bookings and manage your shipments.</li>
            <li>To improve and personalize your experience on our website.</li>
            <li>To communicate with you about your shipments, services, and promotional offers.</li>
            <li>To detect, prevent, and address technical issues and security incidents.</li>
            <li>To comply with legal obligations.</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">3. Sharing Your Information</h2>
          <p>
            We do not sell your personal information to third parties. We may share your information with:
          </p>
          <ul>
            <li><strong>Service Providers:</strong> Third-party companies that perform services on our behalf, such as payment processing, data analysis, and marketing assistance.</li>
            <li><strong>Logistics Partners:</strong> Carriers, customs brokers, and other partners necessary to fulfill your shipment requests.</li>
            <li><strong>Legal Requirements:</strong> When required by law or in response to valid legal processes.</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">4. Data Security</h2>
          <p>
            We implement a variety of security measures to maintain the safety of your personal information when you place an order or enter, submit, or access your personal information.
          </p>

          <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">5. Your Rights</h2>
          <p>
            You have certain rights regarding your personal data, including the right to access, correct, or delete your information. Please contact us to exercise these rights.
          </p>

          <p className="mt-8 text-sm text-gray-600">
            Last updated: July 21, 2025
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;
