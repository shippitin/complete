// src/components/HomeSections/CommitmentSection.tsx
import React from 'react';

const CommitmentSection: React.FC = () => {
  return (
    <section className="py-16 bg-white text-gray-800">
      <div className="container mx-auto grid md:grid-cols-2 gap-8 items-center px-4 max-w-7xl">
        <div>
          <h2 className="text-3xl font-bold mb-4">Our Commitment</h2>
          <p>
            At SHIPPITIN, we are committed to providing exceptional customer service, timely delivery, and full transparency throughout your shipment journey.
          </p>
        </div>
        <img
          src="/images/homepage/our-commitment.jpg"
          alt="Our Commitment"
          className="w-full rounded-lg shadow"
        />
      </div>
    </section>
  );
};

export default CommitmentSection;