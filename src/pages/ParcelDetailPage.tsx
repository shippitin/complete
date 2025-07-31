// src/pages/ParcelDetailPage.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { FaCheckCircle } from 'react-icons/fa';

const ParcelDetailPage: React.FC = () => {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-purple-50 min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-500 to-purple-600 text-white py-16 px-4 text-center">
        <h1 className="text-4xl font-extrabold mb-3 animate-fade-in-up">
          Parcel <span className="text-yellow-300">Services</span>
        </h1>
        <p className="text-lg max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: "100ms" }}>
          Fast, reliable, and secure delivery for your small packages and documents.
        </p>
      </section>

      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200 prose max-w-none mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Sending Small Packages Made Easy</h2>
          <p>
            Whether it's an important document, a gift for a loved one, or small e-commerce orders, SHIPPITIN's parcel services offer a convenient and efficient way to send your packages. We provide various options, including express and standard delivery, with reliable tracking to ensure your parcel reaches its destination safely and on time.
          </p>

          <h3 className="text-2xl font-bold text-gray-800 mt-8 mb-4">Why Choose Our Parcel Services?</h3>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li className="flex items-start"><FaCheckCircle className="text-green-500 mt-1 mr-2 flex-shrink-0" /> <strong>Speed & Reliability:</strong> Timely deliveries with robust tracking.</li>
            <li className="flex items-start"><FaCheckCircle className="text-green-500 mt-1 mr-2 flex-shrink-0" /> <strong>Nationwide Coverage:</strong> Deliver to almost any address across the country.</li>
            <li className="flex items-start"><FaCheckCircle className="text-green-500 mt-1 mr-2 flex-shrink-0" /> <strong>Cost-Effective:</strong> Competitive rates for various package sizes.</li>
            <li className="flex items-start"><FaCheckCircle className="text-green-500 mt-1 mr-2 flex-shrink-0" /> <strong>Convenience:</strong> Easy online booking and pickup options.</li>
            <li className="flex items-start"><FaCheckCircle className="text-green-500 mt-1 mr-2 flex-shrink-0" /> <strong>Secure Handling:</strong> Your packages are handled with utmost care.</li>
          </ul>

          <h3 className="text-2xl font-bold text-gray-800 mt-8 mb-4">Our Parcel Services Include:</h3>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>Express Parcel Delivery</li>
            <li>Standard Parcel Delivery</li>
            <li>Document Delivery</li>
            <li>Cash on Delivery (COD) Options</li>
            <li>Reverse Logistics for E-commerce</li>
          </ul>
        </div>

        {/* Call to Action */}
        <div className="mt-12 text-center bg-blue-600 text-white p-10 rounded-xl shadow-lg animate-fade-in">
          <h3 className="text-3xl font-bold mb-4">Sending a Parcel?</h3>
          <p className="text-lg mb-8">
            Get an instant quote for your parcel shipment today!
          </p>
          <Link
            to="/parcel-booking"
            className="inline-block bg-white text-blue-600 font-semibold py-3 px-8 rounded-full
                         shadow-lg hover:bg-gray-100 transition duration-300 transform hover:scale-105"
          >
            Get a Parcel Quote
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ParcelDetailPage;
