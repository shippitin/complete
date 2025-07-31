// src/components/QuickBookingSection.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { FaTrain, FaTruck, FaPlane, FaShip, FaBoxOpen } from 'react-icons/fa';

const QuickBookingSection: React.FC = () => {
  return (
    <section className="py-12 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl shadow-xl border border-blue-100 mb-12">
      <div className="max-w-6xl mx-auto px-4 text-center">
        <h2 className="text-4xl font-extrabold text-gray-900 mb-6 leading-tight">
          Start Your Shipment Now!
        </h2>
        <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto">
          Choose your preferred mode of transport and get an instant quote for your cargo.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {/* Rail Freight Card */}
          <Link
            to="/train-booking"
            className="group flex flex-col items-center justify-center p-6 bg-white rounded-xl shadow-lg border border-gray-200 hover:shadow-xl hover:border-blue-400 transition-all duration-300 transform hover:-translate-y-1"
          >
            <FaTrain className="text-5xl text-blue-600 mb-4 group-hover:text-blue-700 transition-colors duration-300" />
            <h3 className="text-lg font-semibold text-gray-800 group-hover:text-blue-800">Rail Freight</h3>
            <p className="text-sm text-gray-500 mt-1">Containers, Goods, Parcels</p>
          </Link>

          {/* Other services (add more as needed, linking to their respective booking pages) */}
          <Link
            to="/truck-booking"
            className="group flex flex-col items-center justify-center p-6 bg-white rounded-xl shadow-lg border border-gray-200 hover:shadow-xl hover:border-green-400 transition-all duration-300 transform hover:-translate-y-1"
          >
            <FaTruck className="text-5xl text-green-600 mb-4 group-hover:text-green-700 transition-colors duration-300" />
            <h3 className="text-lg font-semibold text-gray-800 group-hover:text-green-800">Trucking</h3>
            <p className="text-sm text-gray-500 mt-1">Full Truck Load, Part Load</p>
          </Link>

          <Link
            to="/air-booking"
            className="group flex flex-col items-center justify-center p-6 bg-white rounded-xl shadow-lg border border-gray-200 hover:shadow-xl hover:border-purple-400 transition-all duration-300 transform hover:-translate-y-1"
          >
            <FaPlane className="text-5xl text-purple-600 mb-4 group-hover:text-purple-700 transition-colors duration-300" />
            <h3 className="text-lg font-semibold text-gray-800 group-hover:text-purple-800">Air Cargo</h3>
            <p className="text-sm text-gray-500 mt-1">Express, Standard</p>
          </Link>

          <Link
            to="/sea-booking"
            className="group flex flex-col items-center justify-center p-6 bg-white rounded-xl shadow-lg border border-gray-200 hover:shadow-xl hover:border-teal-400 transition-all duration-300 transform hover:-translate-y-1"
          >
            <FaShip className="text-5xl text-teal-600 mb-4 group-hover:text-teal-700 transition-colors duration-300" />
            <h3 className="text-lg font-semibold text-gray-800 group-hover:text-teal-800">Sea Freight</h3>
            <p className="text-sm text-gray-500 mt-1">FCL, LCL</p>
          </Link>

          <Link
            to="/parcel-booking"
            className="group flex flex-col items-center justify-center p-6 bg-white rounded-xl shadow-lg border border-gray-200 hover:shadow-xl hover:border-orange-400 transition-all duration-300 transform hover:-translate-y-1"
          >
            <FaBoxOpen className="text-5xl text-orange-600 mb-4 group-hover:text-orange-700 transition-colors duration-300" />
            <h3 className="text-lg font-semibold text-gray-800 group-hover:text-orange-800">Parcel</h3>
            <p className="text-sm text-gray-500 mt-1">Small Packages, Documents</p>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default QuickBookingSection;
