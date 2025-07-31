// src/components/HomeSections/AboutSection.tsx
import React from 'react';

const AboutSection: React.FC = () => {
  return (
    <section className="py-16 bg-white text-gray-800">
      <div className="container mx-auto grid md:grid-cols-2 gap-8 items-center px-4 max-w-7xl">
        <div>
          <h2 className="text-3xl font-bold mb-4">About SHIPPITIN</h2>
          <p className="mb-4">
            SHIPPITIN LOGISTICS PRIVATE LIMITED is a pioneering startup recognized by Govt. of India.
          </p>
          <p>
            We recognize the significance of tackling logistics obstacles and simplifying the supply chain for businesses and individuals alike.
          </p>
        </div>
        <img
          src="/images/homepage/about-us.jpg"
          alt="About SHIPPITIN"
          className="w-full rounded-lg shadow"
        />
      </div>
    </section>
  );
};

export default AboutSection;