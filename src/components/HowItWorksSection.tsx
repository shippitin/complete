// src/components/HowItWorksSection.tsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom'; // Import Link for navigation
import { FaClipboardList, FaTruckMoving, FaMapMarkedAlt } from 'react-icons/fa'; // Import icons

const HowItWorksSection: React.FC = () => {
  const { t } = useTranslation();

  return (
    <section className="py-16 bg-gradient-to-br from-gray-50 to-blue-50"> {/* Softer background gradient */}
      <div className="container mx-auto px-4 max-w-7xl text-center">
        <h2 className="text-4xl font-bold text-gray-800 mb-4 animate-fade-in">
          {t('how_it_works.title')}
        </h2>
        <p className="text-lg text-gray-600 mb-12 max-w-3xl mx-auto animate-fade-in" style={{ animationDelay: '100ms' }}>
          Our process is simple, transparent, and designed for your convenience.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Step 1 Card */}
          <Link
            to="/international-booking" // Link to the main booking page
            className="group relative p-8 bg-white rounded-xl shadow-lg border border-gray-200
                       flex flex-col items-center text-center
                       transform hover:scale-105 hover:shadow-xl transition duration-300 ease-in-out
                       animate-fade-in"
            style={{ animationDelay: '200ms' }}
          >
            {/* Step Number Circle */}
            <div className="absolute -top-4 -left-4 w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold shadow-md group-hover:bg-blue-700 transition-colors">
              1
            </div>
            <div className="mb-4 p-4 rounded-full bg-blue-100 group-hover:bg-blue-200 transition-colors duration-300">
              <FaClipboardList className="text-4xl text-blue-600 group-hover:text-blue-700 transition-colors" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-gray-800 group-hover:text-blue-700">
              {t('how_it_works.step1_title')}
            </h3>
            <p className="text-gray-600 text-sm flex-grow">
              {t('how_it_works.step1_description')}
            </p>
            <span className="mt-4 text-blue-600 font-medium group-hover:text-blue-800 transition-colors duration-300 flex items-center">
              Start Booking
              <svg className="ml-2 w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
            </span>
          </Link>

          {/* Step 2 Card */}
          <Link
            to="/support" // Link to support or contact for scheduling
            className="group relative p-8 bg-white rounded-xl shadow-lg border border-gray-200
                       flex flex-col items-center text-center
                       transform hover:scale-105 hover:shadow-xl transition duration-300 ease-in-out
                       animate-fade-in"
            style={{ animationDelay: '300ms' }}
          >
            {/* Step Number Circle */}
            <div className="absolute -top-4 -left-4 w-12 h-12 bg-purple-600 text-white rounded-full flex items-center justify-center text-2xl font-bold shadow-md group-hover:bg-purple-700 transition-colors">
              2
            </div>
            <div className="mb-4 p-4 rounded-full bg-purple-100 group-hover:bg-purple-200 transition-colors duration-300">
              <FaTruckMoving className="text-4xl text-purple-600 group-hover:text-purple-700 transition-colors" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-gray-800 group-hover:text-purple-700">
              {t('how_it_works.step2_title')}
            </h3>
            <p className="text-gray-600 text-sm flex-grow">
              {t('how_it_works.step2_description')}
            </p>
            <span className="mt-4 text-purple-600 font-medium group-hover:text-purple-800 transition-colors duration-300 flex items-center">
              Arrange Pickup
              <svg className="ml-2 w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
            </span>
          </Link>

          {/* Step 3 Card */}
          <Link
            to="/track" // Link to the tracking page
            className="group relative p-8 bg-white rounded-xl shadow-lg border border-gray-200
                       flex flex-col items-center text-center
                       transform hover:scale-105 hover:shadow-xl transition duration-300 ease-in-out
                       animate-fade-in"
            style={{ animationDelay: '400ms' }}
          >
            {/* Step Number Circle */}
            <div className="absolute -top-4 -left-4 w-12 h-12 bg-green-600 text-white rounded-full flex items-center justify-center text-2xl font-bold shadow-md group-hover:bg-green-700 transition-colors">
              3
            </div>
            <div className="mb-4 p-4 rounded-full bg-green-100 group-hover:bg-green-200 transition-colors duration-300">
              <FaMapMarkedAlt className="text-4xl text-green-600 group-hover:text-green-700 transition-colors" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-gray-800 group-hover:text-green-700">
              {t('how_it_works.step3_title')}
            </h3>
            <p className="text-gray-600 text-sm flex-grow">
              {t('how_it_works.step3_description')}
            </p>
            <span className="mt-4 text-green-600 font-medium group-hover:text-green-800 transition-colors duration-300 flex items-center">
              Track Now
              <svg className="ml-2 w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
