// src/pages/LCLDetailPage.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { FaCheckCircle } from 'react-icons/fa';

const LCLDetailPage: React.FC = () => {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-purple-50 min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-500 to-purple-600 text-white py-16 px-4 text-center">
        <h1 className="text-4xl font-extrabold mb-3 animate-fade-in-up">
          LCL <span className="text-yellow-300">Shipping</span>
        </h1>
        <p className="text-lg max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: "100ms" }}>
          Flexible and cost-effective ocean freight for smaller cargo volumes.
        </p>
      </section>

      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200 prose max-w-none mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Optimizing Your Smaller Ocean Shipments</h2>
          <p>
            Less than Container Load (LCL) shipping is the ideal solution when you don't have enough cargo to fill an entire shipping container (FCL). With LCL, your goods are consolidated with other shippers' cargo, allowing you to pay only for the space you use. This makes ocean freight accessible and economical for smaller businesses and individual shipments. SHIPPITIN manages the consolidation, transportation, and deconsolidation process, ensuring efficient and reliable delivery.
          </p>

          <h3 className="text-2xl font-bold text-gray-800 mt-8 mb-4">Benefits of LCL Shipping:</h3>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li className="flex items-start"><FaCheckCircle className="text-green-500 mt-1 mr-2 flex-shrink-0" /> <strong>Cost Savings:</strong> Only pay for the volume your cargo occupies.</li>
            <li className="flex items-start"><FaCheckCircle className="text-green-500 mt-1 mr-2 flex-shrink-0" /> <strong>Flexibility:</strong> Ideal for smaller, more frequent shipments.</li>
            <li className="flex items-start"><FaCheckCircle className="text-green-500 mt-1 mr-2 flex-shrink-0" /> <strong>Reduced Inventory:</strong> Supports smaller, more agile supply chains.</li>
            <li className="flex items-start"><FaCheckCircle className="text-green-500 mt-1 mr-2 flex-shrink-0" /> <strong>Global Access:</strong> Connects to major ports worldwide without needing a full container.</li>
            <li className="flex items-start"><FaCheckCircle className="text-green-500 mt-1 mr-2 flex-shrink-0" /> <strong>Environmental Benefits:</strong> Maximizes container utilization, reducing overall carbon footprint.</li>
          </ul>

          <h3 className="text-2xl font-bold text-gray-800 mt-8 mb-4">Our LCL Services Include:</h3>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>Consolidation & Deconsolidation</li>
            <li>Warehousing & Storage</li>
            <li>Customs Clearance</li>
            <li>Door-to-Door LCL Options</li>
          </ul>
        </div>

        {/* Call to Action */}
        <div className="mt-12 text-center bg-blue-600 text-white p-10 rounded-xl shadow-lg animate-fade-in">
          <h3 className="text-3xl font-bold mb-4">Have Smaller Shipments?</h3>
          <p className="text-lg mb-8">
            Get an instant quote for your Less than Container Load (LCL) shipment!
          </p>
          <Link
            to="/lcl-booking"
            className="inline-block bg-white text-blue-600 font-semibold py-3 px-8 rounded-full
                       shadow-lg hover:bg-gray-100 transition duration-300 transform hover:scale-105"
          >
            Get an LCL Quote
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LCLDetailPage;
