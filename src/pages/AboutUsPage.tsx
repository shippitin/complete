// src/pages/AboutUsPage.tsx
import React from 'react';
import { FaUsers, FaGlobe, FaHandshake, FaLightbulb, FaTruck, FaChartLine } from 'react-icons/fa'; // Added FaBuilding, FaUserTie for new sections

const AboutUsPage: React.FC = () => {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-purple-50 min-h-screen">
      {/* Hero Section - More Subtle */}
      <section className="bg-gradient-to-r from-blue-500 to-purple-600 text-white py-16 px-4 text-center">
        <h1 className="text-4xl font-extrabold mb-3 animate-fade-in-up">
          About <span className="text-yellow-300">SHIPPITIN</span>
        </h1>
        <p className="text-lg max-w-3xl mx-auto animate-fade-in-up" style={{ animationDelay: "100ms" }}>
          Your Trusted Partner in Global Logistics and Supply Chain Solutions.
        </p>
      </section>

      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        {/* Our Story Section */}
        <section className="mb-16 text-center animate-fade-in" style={{ animationDelay: "400ms" }}>
          <h2 className="text-4xl font-bold text-gray-800 mb-6">
            Our <span className="text-blue-700">Story</span>
          </h2>
          <p className="text-lg text-gray-700 leading-relaxed max-w-4xl mx-auto">
            Founded with a vision to revolutionize the logistics industry, SHIPPITIN began its journey by simplifying complex shipping processes. We recognized the need for a reliable, transparent, and efficient logistics partner that businesses could truly trust. From humble beginnings, we've grown into a comprehensive global logistics provider, driven by innovation and a relentless commitment to our clients' success.
          </p>
        </section>

        {/* Our Journey Section with Image */}
        <section className="mb-16 flex flex-col lg:flex-row items-center gap-12 bg-white p-8 rounded-xl shadow-lg border border-gray-200 animate-fade-in" style={{ animationDelay: "500ms" }}>
          <div className="lg:w-1/2">
            <img
              src="https://placehold.co/600x400/a0c4ff/FFFFFF?text=Our+Journey" // Placeholder image for journey
              alt="Our Journey"
              className="rounded-xl shadow-md w-full h-auto object-cover"
            />
          </div>
          <div className="lg:w-1/2 text-center lg:text-left">
            <h3 className="text-3xl font-bold text-gray-800 mb-4">
              A Journey of <span className="text-purple-700">Growth and Innovation</span>
            </h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Over the years, SHIPPITIN has continuously evolved, embracing cutting-edge technology and expanding our global network. We've invested in smart logistics platforms, AI-driven route optimization, and robust tracking systems to ensure your cargo is always in safe hands and reaches its destination on time, every time.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Our growth is a testament to our dedication to excellence and our ability to adapt to the ever-changing demands of the global supply chain.
            </p>
          </div>
        </section>

        {/* Mission, Vision, Values */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white p-8 rounded-xl shadow-lg border border-blue-100 text-center transform hover:scale-105 transition duration-300 animate-fade-in" style={{ animationDelay: "600ms" }}>
            <FaLightbulb className="text-5xl text-yellow-500 mx-auto mb-4" />
            <h3 className="text-2xl font-semibold text-gray-800 mb-3">Our Mission</h3>
            <p className="text-gray-600">
              To provide seamless, innovative, and sustainable logistics solutions that empower businesses to thrive in a global marketplace.
            </p>
          </div>
          <div className="bg-white p-8 rounded-xl shadow-lg border border-purple-100 text-center transform hover:scale-105 transition duration-300 animate-fade-in" style={{ animationDelay: "700ms" }}>
            <FaGlobe className="text-5xl text-purple-500 mx-auto mb-4" />
            <h3 className="text-2xl font-semibold text-gray-800 mb-3">Our Vision</h3>
            <p className="text-gray-600">
              To be the leading global logistics partner, recognized for our exceptional service, technological advancement, and commitment to net-zero emissions.
            </p>
          </div>
          <div className="bg-white p-8 rounded-xl shadow-lg border border-green-100 text-center transform hover:scale-105 transition duration-300 animate-fade-in" style={{ animationDelay: "800ms" }}>
            <FaHandshake className="text-5xl text-green-500 mx-auto mb-4" />
            <h3 className="text-2xl font-semibold text-gray-800 mb-3">Our Values</h3>
            <ul className="text-gray-600 list-disc list-inside text-left mx-auto max-w-xs">
              <li>Customer Centricity</li>
              <li>Innovation</li>
              <li>Integrity</li>
              <li>Sustainability</li>
              <li>Excellence</li>
            </ul>
          </div>
        </section>

        {/* Why Choose Us Section */}
        <section className="mb-16 text-center animate-fade-in" style={{ animationDelay: "900ms" }}>
          <h2 className="text-4xl font-bold text-gray-800 mb-6">
            Why <span className="text-blue-700">Choose Us?</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 flex flex-col items-center transition-transform hover:scale-105">
              <FaUsers className="text-4xl text-blue-500 mb-3" />
              <h4 className="text-xl font-semibold text-gray-800 mb-2">Experienced Team</h4>
              <p className="text-gray-600 text-sm">Our experts ensure smooth operations and personalized support.</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 flex flex-col items-center transition-transform hover:scale-105">
              <FaChartLine className="text-4xl text-green-500 mb-3" />
              <h4 className="text-xl font-semibold text-gray-800 mb-2">Advanced Technology</h4>
              <p className="text-gray-600 text-sm">Real-time tracking, AI-driven optimization, and seamless integration.</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 flex flex-col items-center transition-transform hover:scale-105">
              <FaTruck className="text-4xl text-purple-500 mb-3" />
              <h4 className="text-xl font-semibold text-gray-800 mb-2">Global Network</h4>
              <p className="text-gray-600 text-sm">Extensive reach ensures your cargo arrives anywhere, anytime.</p>
            </div>
          </div>
        </section>

        {/* Meet Our Team Section with Image */}
        <section className="mb-16 flex flex-col lg:flex-row-reverse items-center gap-12 bg-white p-8 rounded-xl shadow-lg border border-gray-200 animate-fade-in" style={{ animationDelay: "1000ms" }}>
          <div className="lg:w-1/2">
            <img
              src="https://placehold.co/600x400/ffc0cb/FFFFFF?text=Our+Team" // Placeholder image for team
              alt="Our Team"
              className="rounded-xl shadow-md w-full h-auto object-cover"
            />
          </div>
          <div className="lg:w-1/2 text-center lg:text-left">
            <h3 className="text-3xl font-bold text-gray-800 mb-4">
              Meet Our <span className="text-red-600">Dedicated Team</span>
            </h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Our strength lies in our people. A diverse team of logistics professionals, technology enthusiasts, and customer service experts work tirelessly to ensure every shipment is handled with precision and care. We foster a culture of collaboration, continuous learning, and problem-solving.
            </p>
            <p className="text-gray-700 leading-relaxed">
              From our seasoned freight forwarders to our innovative tech developers, every member of the SHIPPITIN family is committed to delivering exceptional value to you.
            </p>
          </div>
        </section>

        {/* Our Facilities Section with Image */}
        <section className="mb-16 flex flex-col lg:flex-row items-center gap-12 bg-white p-8 rounded-xl shadow-lg border border-gray-200 animate-fade-in" style={{ animationDelay: "1100ms" }}>
          <div className="lg:w-1/2">
            <img
              src="https://placehold.co/600x400/c0cbff/FFFFFF?text=Our+Facilities" // Placeholder image for facilities
              alt="Our Facilities"
              className="rounded-xl shadow-md w-full h-auto object-cover"
            />
          </div>
          <div className="lg:w-1/2 text-center lg:text-left">
            <h3 className="text-3xl font-bold text-gray-800 mb-4">
              State-of-the-Art <span className="text-indigo-700">Facilities</span>
            </h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              Our strategically located warehouses and logistics hubs are equipped with the latest technology for efficient cargo handling, storage, and distribution. We prioritize security, organization, and speed in all our facilities to ensure your goods are safe and ready for transit.
            </p>
            <p className="text-gray-700 leading-relaxed">
              From automated sorting systems to climate-controlled storage, our infrastructure is designed to meet diverse cargo requirements and streamline your supply chain.
            </p>
          </div>
        </section>


        {/* Call to Action */}
        <section className="mt-16 text-center bg-blue-600 text-white p-10 rounded-xl shadow-lg animate-fade-in" style={{ animationDelay: "1200ms" }}>
          <h3 className="text-3xl font-bold mb-4">Ready to Transform Your Logistics?</h3>
          <p className="text-lg mb-8">
            Partner with SHIPPITIN for efficient, reliable, and sustainable freight solutions.
          </p>
          {/* Assuming a contact page exists */}
          <a
            href="/contact"
            className="inline-block bg-white text-blue-600 font-semibold py-3 px-8 rounded-full
                       shadow-lg hover:bg-gray-100 transition duration-300 transform hover:scale-105"
          >
            Contact Us Today
          </a>
        </section>
      </div>
    </div>
  );
};

export default AboutUsPage;
