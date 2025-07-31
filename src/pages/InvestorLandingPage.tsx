// src/pages/InvestorLandingPage.tsx
import { FaCheckCircle, FaRocket, FaMobileAlt, FaGlobeAsia, FaCubes } from "react-icons/fa"; // Added FaCubes import

const InvestorLandingPage = () => {
  return (
    <div className="bg-white text-gray-800 font-sans">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-100 to-white py-20 px-6 text-center">
        <h1 className="text-4xl font-bold text-gray-900">Shippitin — Your Logistics, Unified.</h1>
        <p className="mt-4 text-lg text-gray-700 max-w-2xl mx-auto">
          A smarter way to get freight quotes across Road, Air, Sea, Rail and more — all in one place.
        </p>
        <div className="mt-6 flex justify-center gap-4">
          <button className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition-colors duration-300">
            View Pitch Deck
          </button>
          <button className="border border-blue-600 text-blue-600 px-6 py-2 rounded hover:bg-blue-50 transition-colors duration-300">
            Contact Us
          </button>
        </div>
      </section>

      {/* Problem Section */}
      <section className="py-16 px-6 bg-gray-50">
        <h2 className="text-3xl font-bold text-center mb-8 text-gray-900">The Problem</h2>
        <p className="max-w-3xl mx-auto text-center text-lg text-gray-700 leading-relaxed">
          Global freight and domestic logistics are still heavily manual, fragmented, and inefficient.
          Shippers spend hours chasing quotes, coordinating across transport modes, and tracking containers.
          This leads to delays, increased costs, and a lack of transparency, making it difficult for businesses
          to manage their supply chains effectively.
        </p>
      </section>

      {/* Solution Section */}
      <section className="py-16 px-6">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">Our Solution: Shippitin</h2>
        <div className="grid md:grid-cols-3 gap-10 max-w-5xl mx-auto text-center">
          <div className="p-6 bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
            <FaRocket className="text-blue-600 text-5xl mx-auto mb-4" />
            <h3 className="font-bold text-xl text-gray-900">Instant Multimodal Quotes</h3>
            <p className="text-gray-600 mt-2">
              Get a quick quote for Truck, Rail, Sea, or Air instantly, comparing options
              to find the best fit for your needs.
            </p>
          </div>
          <div className="p-6 bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
            <FaCheckCircle className="text-blue-600 text-5xl mx-auto mb-4" />
            <h3 className="font-bold text-xl text-gray-900">Smart Booking & Tracking</h3>
            <p className="text-gray-600 mt-2">
              Book shipments seamlessly and track them in real-time on a unified dashboard —
              eliminating the need for constant phone calls and manual updates.
            </p>
          </div>
          <div className="p-6 bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
            <FaMobileAlt className="text-blue-600 text-5xl mx-auto mb-4" />
            <h3 className="font-bold text-xl text-gray-900">Modern & Intuitive UI</h3>
            <p className="text-gray-600 mt-2">
              Experience a mobile-friendly, sleek, and intuitive user interface inspired by
              leading travel apps, making logistics management simple and enjoyable.
            </p>
          </div>
        </div>
      </section>

      {/* Key Features - Added this based on your structure */}
      <section className="bg-blue-50 py-16 px-6">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">Key Features That Set Us Apart</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="flex items-start p-4 bg-white rounded-lg shadow-md">
            <FaGlobeAsia className="text-blue-600 text-3xl mr-4 flex-shrink-0" />
            <div>
              <h3 className="font-bold text-lg text-gray-900">Global & Domestic Coverage</h3>
              <p className="text-gray-600 text-sm mt-1">Access freight services across all major routes, worldwide and within India.</p>
            </div>
          </div>
          <div className="flex items-start p-4 bg-white rounded-lg shadow-md">
            <FaRocket className="text-blue-600 text-3xl mr-4 flex-shrink-0" />
            <div>
              <h3 className="font-bold text-lg text-gray-900">Fast & Accurate Quotes</h3>
              <p className="text-gray-600 text-sm mt-1">Leverage our algorithms for instant, competitive pricing.</p>
            </div>
          </div>
          <div className="flex items-start p-4 bg-white rounded-lg shadow-md">
            <FaCheckCircle className="text-blue-600 text-3xl mr-4 flex-shrink-0" />
            <div>
              <h3 className="font-bold text-lg text-gray-900">Real-time Tracking</h3>
              <p className="text-gray-600 text-sm mt-1">Monitor your shipments from pickup to delivery with live updates.</p>
            </div>
          </div>
          <div className="flex items-start p-4 bg-white rounded-lg shadow-md">
            <FaMobileAlt className="text-blue-600 text-3xl mr-4 flex-shrink-0" />
            <div>
              <h3 className="font-bold text-lg text-gray-900">Dedicated Support</h3>
              <p className="text-gray-600 text-sm mt-1">Our logistics experts are always ready to assist you.</p>
            </div>
          </div>
          <div className="flex items-start p-4 bg-white rounded-lg shadow-md">
            <FaCubes className="text-blue-600 text-3xl mr-4 flex-shrink-0" />
            <div>
              <h3 className="font-bold text-lg text-gray-900">Multimodal & FCL/LCL</h3>
              <p className="text-gray-600 text-sm mt-1">Support for full container loads (FCL) and less than container loads (LCL) across all modes.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Screenshots Section - Updated image paths */}
      <section className="bg-gray-100 py-16 px-6">
        <h2 className="text-3xl font-bold text-center mb-10 text-gray-900">App Previews & User Experience</h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <div className="bg-white p-4 shadow-xl rounded-lg">
            <img src="/screenshots/quote-form.png" alt="Quote Form" className="rounded-lg mb-3 border border-gray-200" />
            <p className="text-md text-gray-700 text-center font-medium">Instant Quote Generation</p>
          </div>
          <div className="bg-white p-4 shadow-xl rounded-lg">
            <img src="/screenshots/service-icons.png" alt="Service Icons" className="rounded-lg mb-3 border border-gray-200" />
            <p className="text-md text-gray-700 text-center font-medium">Intuitive Service Selection</p>
          </div>
          <div className="bg-white p-4 shadow-xl rounded-lg">
            <img src="/screenshots/track.png" alt="Tracking UI" className="rounded-lg mb-3 border border-gray-200" />
            <p className="text-md text-gray-700 text-center font-medium">Real-time Shipment Tracking</p>
          </div>
        </div>
        <p className="text-center text-sm text-gray-500 mt-8">
          *Images are representative of the actual user interface.
        </p>
      </section>

      {/* Traction / Stats */}
      <section className="py-16 px-6 bg-blue-50">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">Traction & Growth</h2>
        <div className="flex flex-wrap justify-center gap-12 text-center text-lg text-gray-700 max-w-4xl mx-auto">
          <div className="bg-white p-8 rounded-lg shadow-xl flex-1 min-w-[200px] max-w-[300px]">
            <h3 className="text-5xl font-extrabold text-blue-700 mb-2">5K+</h3>
            <p className="text-xl font-medium">Quotes Generated Monthly</p>
          </div>
          <div className="bg-white p-8 rounded-lg shadow-xl flex-1 min-w-[200px] max-w-[300px]">
            <h3 className="text-5xl font-extrabold text-blue-700 mb-2">120+</h3>
            <p className="text-xl font-medium">Businesses Onboarded</p>
          </div>
          <div className="bg-white p-8 rounded-lg shadow-xl flex-1 min-w-[200px] max-w-[300px]">
            <h3 className="text-5xl font-extrabold text-blue-700 mb-2">₹1.2 Cr+</h3>
            <p className="text-xl font-medium">Freight Value Quoted</p>
          </div>
        </div>
      </section>

      {/* CTA + Contact Section */}
      <section className="py-16 px-6 text-center">
        <h2 className="text-3xl font-bold mb-4 text-gray-900">Partner with Shippitin</h2>
        <p className="text-gray-700 mb-8 max-w-2xl mx-auto">
          We are revolutionizing logistics. Join us on this journey to simplify global freight.
          We are currently raising to expand our operations and enhance our platform.
        </p>
        <div className="flex justify-center gap-4 flex-wrap">
          <button className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors duration-300 text-lg shadow-md">
            Book a Demo
          </button>
          <a href="mailto:investor@shippitin.com" className="bg-gray-200 text-gray-800 px-8 py-3 rounded-lg hover:bg-gray-300 transition-colors duration-300 text-lg shadow-md flex items-center justify-center">
            <FaMobileAlt className="mr-2" /> Email Us
          </a>
          <a href="https://linkedin.com/company/shippitin" target="_blank" rel="noopener noreferrer" className="bg-gray-200 text-gray-800 px-8 py-3 rounded-lg hover:bg-gray-300 transition-colors duration-300 text-lg shadow-md flex items-center justify-center">
            <FaGlobeAsia className="mr-2" /> LinkedIn
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 text-center text-sm text-gray-500 bg-gray-100 border-t border-gray-200">
        © {new Date().getFullYear()} Shippitin. All rights reserved. | Built with ❤️ for seamless logistics.
      </footer>
    </div>
  );
};

export default InvestorLandingPage;