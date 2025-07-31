// src/pages/TruckDetailPage.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { FaCheckCircle } from 'react-icons/fa';

const TruckDetailPage: React.FC = () => {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-purple-50 min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-500 to-purple-600 text-white py-16 px-4 text-center">
        <h1 className="text-4xl font-extrabold mb-3 animate-fade-in-up">
          Road <span className="text-yellow-300">Freight</span>
        </h1>
        <p className="text-lg max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: "100ms" }}>
          Reliable and efficient road transportation solutions across India.
        </p>
      </section>

      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200 prose max-w-none mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Why Choose Road Freight?</h2>
          <p>
            Road freight is the backbone of domestic logistics, offering flexibility, cost-effectiveness, and extensive reach. At SHIPPITIN, our robust network of carriers and modern fleet ensure your goods are transported safely and efficiently to every corner of India. Whether it's full truck load (FTL) or less than truck load (LTL), we provide tailored solutions for all your road transportation needs.
          </p>

          <h3 className="text-2xl font-bold text-gray-800 mt-8 mb-4">Key Advantages:</h3>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li className="flex items-start"><FaCheckCircle className="text-green-500 mt-1 mr-2 flex-shrink-0" /> <strong>Extensive Reach:</strong> Connects major cities, towns, and even remote areas.</li>
            <li className="flex items-start"><FaCheckCircle className="text-green-500 mt-1 mr-2 flex-shrink-0" /> <strong>Cost-Effective:</strong> Economical solution for various cargo sizes.</li>
            <li className="flex items-start"><FaCheckCircle className="text-green-500 mt-1 mr-2 flex-shrink-0" /> <strong>Flexibility:</strong> Adaptable for different cargo types, volumes, and delivery schedules.</li>
            <li className="flex items-start"><FaCheckCircle className="text-green-500 mt-1 mr-2 flex-shrink-0" /> <strong>Door-to-Door Service:</strong> Seamless pickup and delivery for ultimate convenience.</li>
            <li className="flex items-start"><FaCheckCircle className="text-green-500 mt-1 mr-2 flex-shrink-0" /> <strong>Real-time Tracking:</strong> Monitor your shipment's progress every step of the way.</li>
          </ul>

          <h3 className="text-2xl font-bold text-gray-800 mt-8 mb-4">Our Road Freight Services Include:</h3>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>Full Truck Load (FTL)</li>
            <li>Less Than Truck Load (LTL)</li>
            <li>Temperature-Controlled Transport</li>
            <li>Hazardous Goods Transport</li>
            <li>Express Delivery Options</li>
          </ul>
        </div>

        {/* Call to Action */}
        <div className="mt-12 text-center bg-blue-600 text-white p-10 rounded-xl shadow-lg animate-fade-in">
          <h3 className="text-3xl font-bold mb-4">Need Road Freight?</h3>
          <p className="text-lg mb-8">
            Get an instant quote for your road freight shipment now!
          </p>
          <Link
            to="/truck-booking"
            className="inline-block bg-white text-blue-600 font-semibold py-3 px-8 rounded-full
                       shadow-lg hover:bg-gray-100 transition duration-300 transform hover:scale-105"
          >
            Get a Road Freight Quote
          </Link>
        </div>
      </div>
    </div>
  );
};

export default TruckDetailPage;
