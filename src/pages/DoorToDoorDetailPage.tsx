// src/pages/DoorToDoorDetailPage.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { FaCheckCircle } from 'react-icons/fa';

const DoorToDoorDetailPage: React.FC = () => {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-purple-50 min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-500 to-purple-600 text-white py-16 px-4 text-center">
        <h1 className="text-4xl font-extrabold mb-3 animate-fade-in-up">
          Door to Door <span className="text-yellow-300">Freight</span>
        </h1>
        <p className="text-lg max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: "100ms" }}>
          Seamless, end-to-end logistics from your doorstep to the destination.
        </p>
      </section>

      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200 prose max-w-none mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">What is Door to Door Freight?</h2>
          <p>
            Door-to-door freight service means we handle every aspect of your shipment, from the initial pickup at your location to the final delivery at your recipient's address. This comprehensive solution eliminates the need for you to coordinate with multiple carriers or manage different legs of the journey. We take care of all logistics, documentation, customs clearance, and transportation, providing you with peace of mind and a truly hassle-free shipping experience.
          </p>

          <h3 className="text-2xl font-bold text-gray-800 mt-8 mb-4">Key Benefits:</h3>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li className="flex items-start"><FaCheckCircle className="text-green-500 mt-1 mr-2 flex-shrink-0" /> <strong>Convenience:</strong> One point of contact for your entire shipment.</li>
            <li className="flex items-start"><FaCheckCircle className="text-green-500 mt-1 mr-2 flex-shrink-0" /> <strong>Reduced Complexity:</strong> No need to manage multiple logistics providers.</li>
            <li className="flex items-start"><FaCheckCircle className="text-green-500 mt-1 mr-2 flex-shrink-0" /> <strong>Time-Saving:</strong> Streamlined process saves you valuable time and effort.</li>
            <li className="flex items-start"><FaCheckCircle className="text-green-500 mt-1 mr-2 flex-shrink-0" /> <strong>Enhanced Security:</strong> Consistent handling reduces risks of damage or loss.</li>
            <li className="flex items-start"><FaCheckCircle className="text-green-500 mt-1 mr-2 flex-shrink-0" /> <strong>Global Reach:</strong> Available for both domestic and international shipments.</li>
          </ul>

          <h3 className="text-2xl font-bold text-gray-800 mt-8 mb-4">How It Works:</h3>
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            <li><strong>Quote & Booking:</strong> Get an instant quote and book your shipment online.</li>
            <li><strong>Pickup:</strong> We pick up your cargo directly from your specified location.</li>
            <li><strong>Transit:</strong> Your goods are transported via the most efficient mode (road, rail, air, sea).</li>
            <li><strong>Customs & Documentation:</strong> We handle all necessary paperwork and customs procedures.</li>
            <li><strong>Delivery:</strong> Your shipment is delivered directly to the recipient's door.</li>
          </ol>
        </div>

        {/* Call to Action */}
        <div className="mt-12 text-center bg-blue-600 text-white p-10 rounded-xl shadow-lg animate-fade-in">
          <h3 className="text-3xl font-bold mb-4">Ready for Seamless Shipping?</h3>
          <p className="text-lg mb-8">
            Get an instant quote for your door-to-door freight today!
          </p>
          <Link
            to="/door-to-door-booking"
            className="inline-block bg-white text-blue-600 font-semibold py-3 px-8 rounded-full
                       shadow-lg hover:bg-gray-100 transition duration-300 transform hover:scale-105"
          >
            Get a Door to Door Quote
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DoorToDoorDetailPage;
