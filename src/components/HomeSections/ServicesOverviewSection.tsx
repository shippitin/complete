// src/components/HomeSections/ServicesOverviewSection.tsx
import React from 'react';

const ServicesOverviewSection: React.FC = () => {
  return (
    <section className="py-16 bg-gray-50 text-gray-800">
      <div className="container mx-auto grid md:grid-cols-2 gap-8 items-center px-4 max-w-7xl">
        <img
          src="/images/homepage/our-services.jpg"
          alt="Our Services"
          className="w-full rounded-lg shadow"
        />
        <div>
          <h2 className="text-3xl font-bold mb-4">Our Services</h2>
          <p>
            Our innovative idea centers around establishing an online platform that connects customers to multimodal logistics providers via Truck, Rail, Air, Sea, Parcel, LCL, Insurance, First & Last Mile, and Global Freight.
          </p>
        </div>
      </div>
    </section>
  );
};

export default ServicesOverviewSection;