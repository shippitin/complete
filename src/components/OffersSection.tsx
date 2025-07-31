// src/components/OffersSection.tsx
import React from 'react';
import { Link } from 'react-router-dom';

const OffersSection: React.FC = () => {
  const offers = [
    {
      title: "Road Freight Offer",
      description: "Flat 15% Off on Road Freight. Special discount for first-time users via Shippitin.",
      link: "/", // Link to root (GlobalFreightBookingPage)
      serviceType: "Truck", // Used for pre-selecting tab if needed
      // Removed bgColor and borderColor
    },
    {
      title: "Global Shipping Offer",
      description: "Get exclusive shipping insurance on LCL & FCL orders.",
      link: "/", // Link to root (GlobalFreightBookingPage)
      serviceType: "Insurance", // Used for pre-selecting tab if needed
      // Removed bgColor and borderColor
    },
    {
      title: "Air Express Promo",
      description: "20% Off on Air Express Services",
      link: "/", // Link to root (GlobalFreightBookingPage)
      serviceType: "Air", // Used for pre-selecting tab if needed
      // Removed bgColor and borderColor
    },
    {
      title: "Train Cargo Offer",
      description: "Special rates for Container, Goods, and Parcel train bookings.",
      link: "/", // Link to root (GlobalFreightBookingPage)
      serviceType: "Rail", // Used for pre-selecting tab if needed
      // Removed bgColor and borderColor
    }
  ];

  return (
    <section className="py-12 bg-gray-50 rounded-xl shadow-inner">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-extrabold text-gray-800 text-center mb-10">Exclusive Offers</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {offers.map((offer, index) => (
            <Link
              to={offer.link}
              key={index}
              state={{ activeService: offer.serviceType }} // Pass serviceType to pre-select tab if applicable
              className={`block p-6 rounded-xl transition-transform transform hover:scale-105
                bg-white border border-gray-200 shadow-sm hover:shadow-md cursor-pointer
                text-gray-800 hover:text-blue-600
              `}
            >
              <h3 className="text-xl font-bold mb-2">{offer.title}</h3>
              <p className="text-gray-600">{offer.description}</p>
            </Link>
          ))}
        </div>
        <div className="text-center mt-10">
          <Link
            to="/offers"
            // Updated Tailwind CSS classes for the gradient background and white text
            className="inline-block px-8 py-4 text-white font-bold text-xl rounded-xl shadow-lg transition duration-300 transform hover:scale-105"
            style={{
              background: 'linear-gradient(to right, #53b2fe, #065af3)',
              border: 'none', // Ensure no default border interferes
            }}
          >
            View All Offers
          </Link>
        </div>
      </div>
    </section>
  );
};

export default OffersSection;
