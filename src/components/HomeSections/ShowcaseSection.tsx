// src/components/HomeSections/ShowcaseSection.tsx
import React from 'react';

const ShowcaseSection: React.FC = () => {
  return (
    <section className="py-16 bg-gray-50 text-gray-800">
      <div className="container mx-auto grid md:grid-cols-2 gap-8 items-center px-4 max-w-7xl">
        <img
          src="/images/homepage/carousel-hero.jpg"
          alt="Shipping Showcase"
          className="w-full rounded-lg shadow"
        />
        <div>
          <h2 className="text-3xl font-bold mb-4">Shipping Showcase</h2>
          <p>
            From booking to tracking and final delivery, our system showcases your shipment journey visually and efficiently. We're redefining the logistics experience with transparency and real-time updates.
          </p>
        </div>
      </div>
    </section>
  );
};

export default ShowcaseSection;