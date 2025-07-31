// src/components/TrustedPartnersSection.tsx
import React from 'react';
import { useTranslation } from 'react-i18next';

const partnerLogos = [
  { name: 'Delhivery', logo: 'https://placehold.co/150x80/e0e7ff/333333?text=Delhivery' },
  { name: 'VRL Logistics', logo: 'https://placehold.co/150x80/e0e7ff/333333?text=VRL' },
  { name: 'India Post', logo: 'https://placehold.co/150x80/e0e7ff/333333?text=India+Post' },
  { name: 'FedEx', logo: 'https://placehold.co/150x80/e0e7ff/333333?text=FedEx' },
  { name: 'DHL', logo: 'https://placehold.co/150x80/e0e7ff/333333?text=DHL' },
  { name: 'Blue Dart', logo: 'https://placehold.co/150x80/e0e7ff/333333?text=Blue+Dart' },
  { name: 'Gati', logo: 'https://placehold.co/150x80/e0e7ff/333333?text=Gati' },
  { name: 'SafeExpress', logo: 'https://placehold.co/150x80/e0e7ff/333333?text=SafeExpress' },
];

const TrustedPartnersSection: React.FC = () => {
  const { t } = useTranslation();
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4 max-w-7xl text-center">
        <h2 className="text-4xl font-bold text-gray-800 mb-4 animate-fade-in">
          {t('trusted_partners_title')}
        </h2>
        <p className="text-lg text-gray-600 mb-12 max-w-3xl mx-auto animate-fade-in" style={{ animationDelay: '100ms' }}>
          We collaborate with leading logistics providers to ensure reliable and efficient service worldwide.
        </p>
        <div className="flex flex-wrap justify-center items-center gap-x-12 gap-y-8">
          {partnerLogos.map((partner, index) => (
            <div
              key={index}
              className="flex items-center justify-center p-4 bg-white rounded-lg
                          transform transition-transform duration-300 hover:scale-105 hover:shadow-md
                          animate-fade-in"
              style={{ animationDelay: `${200 + index * 50}ms`, animationFillMode: "both" }}
            >
              <img
                src={partner.logo}
                alt={`${partner.name} Logo`}
                className="max-h-16 w-auto object-contain filter grayscale hover:grayscale-0 transition-all duration-300"
                onError={(e) => { e.currentTarget.src = `https://placehold.co/150x80/e0e7ff/333333?text=${partner.name}`; }} // Fallback
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrustedPartnersSection;
