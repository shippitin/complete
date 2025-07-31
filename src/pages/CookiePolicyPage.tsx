// src/pages/CookiePolicyPage.tsx
import React from 'react';

const CookiePolicyPage: React.FC = () => {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-purple-50 min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-500 to-purple-600 text-white py-16 px-4 text-center">
        <h1 className="text-4xl font-extrabold mb-3 animate-fade-in-up">
          Cookie <span className="text-yellow-300">Policy</span>
        </h1>
        <p className="text-lg max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: "100ms" }}>
          How we use cookies and similar technologies to enhance your experience.
        </p>
      </section>

      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200 prose max-w-none">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">1. What are Cookies?</h2>
          <p>
            Cookies are small text files that are placed on your computer or mobile device when you visit a website. They are widely used to make websites work, or work more efficiently, as well as to provide information to the owners of the site.
          </p>

          <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">2. How We Use Cookies</h2>
          <p>
            We use cookies for several reasons, including:
          </p>
          <ul>
            <li><strong>Essential Cookies:</strong> Necessary for the website to function properly (e.g., for login, security).</li>
            <li><strong>Performance Cookies:</strong> To collect information about how visitors use our website (e.g., which pages are most popular), helping us improve our services.</li>
            <li><strong>Functionality Cookies:</strong> To remember your preferences and choices (e.g., language selection) to provide a more personalized experience.</li>
            <li><strong>Advertising/Targeting Cookies:</strong> To deliver relevant advertisements to you based on your interests.</li>
          </ul>

          <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">3. Third-Party Cookies</h2>
          <p>
            In addition to our own cookies, we may also use various third-parties cookies to report usage statistics of the Service, deliver advertisements on and through the Service, and so on.
          </p>

          <h2 className="text-2xl font-bold text-gray-800 mt-8 mb-4">4. Your Choices Regarding Cookies</h2>
          <p>
            You have the right to decide whether to accept or reject cookies. You can exercise your cookie preferences by adjusting your browser settings. However, please note that if you choose to refuse cookies, you may not be able to use the full functionality of our website.
          </p>

          <p className="mt-8 text-sm text-gray-600">
            Last updated: July 21, 2025
          </p>
        </div>
      </div>
    </div>
  );
};

export default CookiePolicyPage;
