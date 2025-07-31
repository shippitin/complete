// src/components/WhyChooseUsSection.tsx
import React from 'react';
import { Link } from 'react-router-dom'; // Import Link for navigation
import { FaGlobeAmericas, FaRoute, FaBolt } from 'react-icons/fa'; // Added icons

const WhyChooseUsSection: React.FC = () => {
  return (
    <section className="py-16 bg-gradient-to-br from-gray-50 to-blue-50"> {/* Softer background gradient */}
      <div className="container mx-auto px-4 max-w-7xl text-center">
        <h2 className="text-4xl font-bold mb-4 text-gray-800 animate-fade-in">
          Why <span
            // Removed text-blue-700
            style={{
              background: 'linear-gradient(to right, #53b2fe, #065af3)',
              WebkitBackgroundClip: 'text', // For Safari/Chrome
              WebkitTextFillColor: 'transparent', // For Safari/Chrome
              backgroundClip: 'text',
              color: 'transparent', // Fallback for non-webkit browsers
            }}
          >Choose SHIPPITIN?</span>
        </h2>
        <p className="text-lg text-gray-600 mb-12 max-w-3xl mx-auto animate-fade-in" style={{ animationDelay: '100ms' }}>
          Experience unparalleled logistics solutions designed to meet your every need.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Feature 1: Pan-India Coverage */}
          <Link
            to="/services" // Link to services page for more details on coverage
            className="group p-8 bg-white rounded-xl shadow-lg border border-gray-200
                        flex flex-col items-center text-center
                        transform hover:scale-105 hover:shadow-xl transition duration-300 ease-in-out
                        animate-fade-in"
            style={{ animationDelay: '200ms' }}
          >
            <div className="mb-4 p-4 rounded-full bg-blue-100 group-hover:bg-blue-200 transition-colors duration-300">
              <FaGlobeAmericas className="text-4xl text-blue-600 group-hover:text-blue-700 transition-colors" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-gray-800 group-hover:text-blue-700">Pan-India Coverage</h3>
            <p className="text-gray-600 text-sm flex-grow">
              Connects remote and urban locations effortlessly with our extensive network.
            </p>
            <span className="mt-4 text-blue-600 font-medium group-hover:text-blue-800 transition-colors duration-300 flex items-center">
              Learn More
              <svg className="ml-2 w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
            </span>
          </Link>

          {/* Feature 2: Multi-Modal Support */}
          <Link
            to="/services" // Link to services page for details on multi-modal options
            className="group p-8 bg-white rounded-xl shadow-lg border border-gray-200
                        flex flex-col items-center text-center
                        transform hover:scale-105 hover:shadow-xl transition duration-300 ease-in-out
                        animate-fade-in"
            style={{ animationDelay: '300ms' }}
          >
            <div className="mb-4 p-4 rounded-full bg-purple-100 group-hover:bg-purple-200 transition-colors duration-300">
              <FaRoute className="text-4xl text-purple-600 group-hover:text-purple-700 transition-colors" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-gray-800 group-hover:text-purple-700">Multi-Modal Support</h3>
            <p className="text-gray-600 text-sm flex-grow">
              Choose from road, rail, air, or sea — we handle it all with integrated solutions.
            </p>
            <span className="mt-4 text-purple-600 font-medium group-hover:text-purple-800 transition-colors duration-300 flex items-center">
              Explore Services
              <svg className="ml-2 w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
            </span>
          </Link>

          {/* Feature 3: Instant Quotes */}
          <Link
            to="/international-booking" // Link directly to the booking page for instant quotes
            className="group p-8 bg-white rounded-xl shadow-lg border border-gray-200
                        flex flex-col items-center text-center
                        transform hover:scale-105 hover:shadow-xl transition duration-300 ease-in-out
                        animate-fade-in"
            style={{ animationDelay: '400ms' }}
          >
            <div className="mb-4 p-4 rounded-full bg-yellow-100 group-hover:bg-yellow-200 transition-colors duration-300">
              <FaBolt className="text-4xl text-yellow-600 group-hover:text-yellow-700 transition-colors" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-gray-800 group-hover:text-yellow-700">Instant Quotes</h3>
            <p className="text-gray-600 text-sm flex-grow">
              Get real-time pricing and quick booking options made easy through our platform.
            </p>
            <span className="mt-4 text-yellow-600 font-medium group-hover:text-yellow-800 transition-colors duration-300 flex items-center">
              Get a Quote
              <svg className="ml-2 w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUsSection;
