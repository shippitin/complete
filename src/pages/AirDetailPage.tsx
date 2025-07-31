// src/pages/AirDetailPage.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { FaCheckCircle } from 'react-icons/fa';

const AirDetailPage: React.FC = () => {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-purple-50 min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-500 to-purple-600 text-white py-16 px-4 text-center">
        <h1 className="text-4xl font-extrabold mb-3 animate-fade-in-up">
          Air <span className="text-yellow-300">Freight</span>
        </h1>
        <p className="text-lg max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: "100ms" }}>
          The fastest way to send your critical and time-sensitive shipments globally.
        </p>
      </section>

      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200 prose max-w-none mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">When Speed Matters: Air Freight</h2>
          <p>
            Air freight is the premium choice for urgent, high-value, and time-sensitive cargo. SHIPPITIN offers comprehensive air freight solutions, leveraging a global network of airlines and partners to ensure your shipments reach their destination quickly and securely. From express services to consolidated cargo, we provide flexible options to meet your specific needs.
          </p>

          <h3 className="text-2xl font-bold text-gray-800 mt-8 mb-4">Key Benefits:</h3>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li className="flex items-start"><FaCheckCircle className="text-green-500 mt-1 mr-2 flex-shrink-0" /> <strong>Speed:</strong> Fastest transit times for urgent deliveries.</li>
            <li className="flex items-start"><FaCheckCircle className="text-green-500 mt-1 mr-2 flex-shrink-0" /> <strong>Global Reach:</strong> Connects major international hubs and remote locations.</li>
            <li className="flex items-start"><FaCheckCircle className="text-green-500 mt-1 mr-2 flex-shrink-0" /> <strong>High Security:</strong> Enhanced security measures for valuable cargo.</li>
            <li className="flex items-start"><FaCheckCircle className="text-green-500 mt-1 mr-2 flex-shrink-0" /> <strong>Reliability:</strong> Less prone to delays caused by traffic or geographical barriers.</li>
            <li className="flex items-start"><FaCheckCircle className="text-green-500 mt-1 mr-2 flex-shrink-0" /> <strong>Reduced Inventory:</strong> Supports just-in-time inventory management.</li>
          </ul>

          <h3 className="text-2xl font-bold text-gray-800 mt-8 mb-4">Our Air Freight Services Include:</h3>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>Express Air Freight</li>
            <li>Standard Air Cargo</li>
            <li>Consolidation Services</li>
            <li>Charter Services</li>
            <li>Customs Clearance</li>
          </ul>
        </div>

        {/* Call to Action */}
        <div className="mt-12 text-center bg-blue-600 text-white p-10 rounded-xl shadow-lg animate-fade-in">
          <h3 className="text-3xl font-bold mb-4">Need Fast Air Shipping?</h3>
          <p className="text-lg mb-8">
            Get an instant quote for your air freight shipment today!
          </p>
          <Link
            to="/air-booking"
            className="inline-block bg-white text-blue-600 font-semibold py-3 px-8 rounded-full
                       shadow-lg hover:bg-gray-100 transition duration-300 transform hover:scale-105"
          >
            Get an Air Freight Quote
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AirDetailPage;
