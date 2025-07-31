// src/pages/SeaDetailPage.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { FaCheckCircle } from 'react-icons/fa';

const SeaDetailPage: React.FC = () => {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-purple-50 min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-500 to-purple-600 text-white py-16 px-4 text-center">
        <h1 className="text-4xl font-extrabold mb-3 animate-fade-in-up">
          Ocean <span className="text-yellow-300">Freight</span>
        </h1>
        <p className="text-lg max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: "100ms" }}>
          Reliable and cost-effective sea shipping solutions for global trade.
        </p>
      </section>

      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200 prose max-w-none mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Your Global Sea Shipping Partner</h2>
          <p>
            Ocean freight is the most economical way to transport large volumes of goods across continents. SHIPPITIN provides comprehensive sea freight services, including Full Container Load (FCL) and Less than Container Load (LCL) options, ensuring your cargo reaches its international destination safely and on schedule. We manage the entire process, from port-to-port logistics to customs documentation.
          </p>

          <h3 className="text-2xl font-bold text-gray-800 mt-8 mb-4">Key Advantages:</h3>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li className="flex items-start"><FaCheckCircle className="text-green-500 mt-1 mr-2 flex-shrink-0" /> <strong>Cost-Effectiveness:</strong> Most economical for large, heavy, or bulky shipments.</li>
            <li className="flex items-start"><FaCheckCircle className="text-green-500 mt-1 mr-2 flex-shrink-0" /> <strong>High Capacity:</strong> Ideal for transporting massive volumes of goods.</li>
            <li className="flex items-start"><FaCheckCircle className="text-green-500 mt-1 mr-2 flex-shrink-0" /> <strong>Global Reach:</strong> Connects virtually every major port worldwide.</li>
            <li className="flex items-start"><FaCheckCircle className="text-green-500 mt-1 mr-2 flex-shrink-0" /> <strong>Environmental Impact:</strong> More eco-friendly per ton-mile compared to air freight.</li>
            <li className="flex items-start"><FaCheckCircle className="text-green-500 mt-1 mr-2 flex-shrink-0" /> <strong>Versatility:</strong> Suitable for almost any type of cargo.</li>
          </ul>

          <h3 className="text-2xl font-bold text-gray-800 mt-8 mb-4">Our Ocean Freight Services:</h3>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>Full Container Load (FCL)</li>
            <li>Less than Container Load (LCL)</li>
            <li>Project Cargo & Breakbulk</li>
            <li>Reefer (Refrigerated) Containers</li>
            <li>Hazardous Cargo Handling</li>
          </ul>
        </div>

        {/* Call to Action */}
        <div className="mt-12 text-center bg-blue-600 text-white p-10 rounded-xl shadow-lg animate-fade-in">
          <h3 className="text-3xl font-bold mb-4">Shipping by Sea?</h3>
          <p className="text-lg mb-8">
            Get an instant quote for your ocean freight shipment today!
          </p>
          <Link
            to="/sea-booking"
            className="inline-block bg-white text-blue-600 font-semibold py-3 px-8 rounded-full
                       shadow-lg hover:bg-gray-100 transition duration-300 transform hover:scale-105"
          >
            Get an Ocean Freight Quote
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SeaDetailPage;
