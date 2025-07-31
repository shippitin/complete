// src/components/CTASection.tsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom'; // Import Link for navigation

const CTASection: React.FC = () => {
  const { t } = useTranslation();

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 text-center rounded-xl shadow-lg
                         bg-gradient-to-r from-blue-50 to-purple-50 text-gray-800
                         transform transition-transform duration-500 hover:scale-[1.005] hover:shadow-xl"> {/* Slightly reduced hover effect for subtlety */}
      <div className="container mx-auto max-w-7xl"> {/* Content remains centered and constrained */}
        <h2 className="text-4xl sm:text-5xl font-extrabold mb-4 text-gray-800 animate-fade-in-up">
          {t('cta.title_homepage')}
        </h2>
        <p className="text-lg sm:text-xl max-w-2xl mx-auto mb-8 text-gray-700 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          {t('cta.subtitle_homepage')}
        </p>
        <Link
          to="/international-booking" // Link to the main booking page
          // Updated Tailwind CSS classes for the gradient background and white text
          className="inline-block px-10 py-4 text-white font-bold text-lg rounded-full shadow-xl
                     transition duration-300 transform hover:scale-105 animate-bounce-in"
          style={{
            background: 'linear-gradient(to right, #53b2fe, #065af3)',
            border: 'none', // Ensure no default border interferes
          }}
        >
          {t('cta.button_homepage')}
        </Link>
      </div>
    </section>
  );
};

export default CTASection;
