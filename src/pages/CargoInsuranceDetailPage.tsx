// src/pages/CargoInsuranceDetailPage.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { FaCheckCircle } from 'react-icons/fa';

const CargoInsuranceDetailPage: React.FC = () => {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-purple-50 min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-500 to-purple-600 text-white py-16 px-4 text-center">
        <h1 className="text-4xl font-extrabold mb-3 animate-fade-in-up">
          Cargo <span className="text-yellow-300">Insurance</span>
        </h1>
        <p className="text-lg max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: "100ms" }}>
          Protect your valuable shipments against unforeseen risks and damages.
        </p>
      </section>

      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200 prose max-w-none mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Secure Your Shipments with Confidence</h2>
          <p>
            While we strive for flawless logistics, unforeseen circumstances can sometimes impact your cargo. Cargo insurance provides essential protection against loss, damage, or theft during transit, offering you financial security and peace of mind. SHIPPITIN partners with reputable insurance providers to offer comprehensive coverage tailored to your specific shipment needs.
          </p>

          <h3 className="text-2xl font-bold text-gray-800 mt-8 mb-4">Why Insure Your Cargo?</h3>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li className="flex items-start"><FaCheckCircle className="text-green-500 mt-1 mr-2 flex-shrink-0" /> <strong>Financial Protection:</strong> Safeguard your investment against various risks.</li>
            <li className="flex items-start"><FaCheckCircle className="text-green-500 mt-1 mr-2 flex-shrink-0" /> <strong>Peace of Mind:</strong> Ship with confidence knowing your goods are covered.</li>
            <li className="flex items-start"><FaCheckCircle className="text-green-500 mt-1 mr-2 flex-shrink-0" /> <strong>Comprehensive Coverage:</strong> Protects against theft, damage, natural disasters, and more.</li>
            <li className="flex items-start"><FaCheckCircle className="text-green-500 mt-1 mr-2 flex-shrink-0" /> <strong>Legal Compliance:</strong> Essential for certain international shipments.</li>
            <li className="flex items-start"><FaCheckCircle className="text-green-500 mt-1 mr-2 flex-shrink-0" /> <strong>Simplified Claims:</strong> Our partners ensure a smooth and efficient claims process.</li>
          </ul>

          <h3 className="text-2xl font-bold text-gray-800 mt-8 mb-4">Types of Coverage:</h3>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>All-Risk Coverage</li>
            <li>Named Perils Coverage</li>
            <li>Warehouse to Warehouse Coverage</li>
            <li>Specific Voyage Coverage</li>
          </ul>
        </div>

        {/* Call to Action */}
        <div className="mt-12 text-center bg-blue-600 text-white p-10 rounded-xl shadow-lg animate-fade-in">
          <h3 className="text-3xl font-bold mb-4">Protect Your Investment</h3>
          <p className="text-lg mb-8">
            Get a personalized cargo insurance quote today!
          </p>
          <Link
            to="/insurance-booking"
            className="inline-block bg-white text-blue-600 font-semibold py-3 px-8 rounded-full
                       shadow-lg hover:bg-gray-100 transition duration-300 transform hover:scale-105"
          >
            Get an Insurance Quote
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CargoInsuranceDetailPage;
