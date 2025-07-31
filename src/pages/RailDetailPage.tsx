// src/pages/RailDetailPage.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { FaCheckCircle } from 'react-icons/fa';

const RailDetailPage: React.FC = () => {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-purple-50 min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-500 to-purple-600 text-white py-16 px-4 text-center">
        <h1 className="text-4xl font-extrabold mb-3 animate-fade-in-up">
          Rail <span className="text-yellow-300">Cargo</span>
        </h1>
        <p className="text-lg max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: "100ms" }}>
          Cost-effective and eco-friendly transportation via India’s extensive railway network.
        </p>
      </section>

      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200 prose max-w-none mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Benefits of Rail Freight</h2>
          <p>
            Rail freight offers a sustainable and efficient solution for transporting bulk cargo over long distances within India. It's an excellent alternative to road transport for heavy and large volume shipments, contributing to reduced carbon emissions and often proving more economical. SHIPPITIN leverages a vast railway network to provide reliable and timely rail cargo services.
          </p>

          <h3 className="text-2xl font-bold text-gray-800 mt-8 mb-4">Why Choose Rail Cargo?</h3>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li className="flex items-start"><FaCheckCircle className="text-green-500 mt-1 mr-2 flex-shrink-0" /> <strong>Cost-Efficiency:</strong> Generally more economical for long-haul and bulk shipments.</li>
            <li className="flex items-start"><FaCheckCircle className="text-green-500 mt-1 mr-2 flex-shrink-0" /> <strong>Eco-Friendly:</strong> Lower carbon footprint compared to road transport.</li>
            <li className="flex items-start"><FaCheckCircle className="text-green-500 mt-1 mr-2 flex-shrink-0" /> <strong>Reliability:</strong> Less susceptible to traffic congestion and weather delays.</li>
            <li className="flex items-start"><FaCheckCircle className="text-green-500 mt-1 mr-2 flex-shrink-0" /> <strong>High Capacity:</strong> Ideal for transporting large volumes and heavy goods.</li>
            <li className="flex items-start"><FaCheckCircle className="text-green-500 mt-1 mr-2 flex-shrink-0" /> <strong>Extensive Network:</strong> Access to a wide network of railway lines and terminals.</li>
          </ul>

          <h3 className="text-2xl font-bold text-gray-800 mt-8 mb-4">Our Rail Freight Services:</h3>
          <ul className="list-disc list-inside space-y-2 text-gray-700">
            <li>Container Train Services (20ft, 40ft)</li>
            <li>Bulk Goods Transport</li>
            <li>Parcel Train Services</li>
            <li>Intermodal Solutions (Rail + Road)</li>
          </ul>
        </div>

        {/* Call to Action */}
        <div className="mt-12 text-center bg-blue-600 text-white p-10 rounded-xl shadow-lg animate-fade-in">
          <h3 className="text-3xl font-bold mb-4">Looking for Rail Transport?</h3>
          <p className="text-lg mb-8">
            Get an instant quote for your rail cargo shipment today!
          </p>
          <Link
            to="/train-booking"
            className="inline-block bg-white text-blue-600 font-semibold py-3 px-8 rounded-full
                       shadow-lg hover:bg-gray-100 transition duration-300 transform hover:scale-105"
          >
            Get a Rail Cargo Quote
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RailDetailPage;
