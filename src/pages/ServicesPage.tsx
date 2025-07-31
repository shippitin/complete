// src/pages/ServicesPage.tsx
import React from "react";
import { Link } from "react-router-dom"; // Import Link for navigation
import {
  FaTruck,
  FaShip,
  FaPlane,
  FaTrain,
  FaShieldAlt,
  FaCogs,
  FaMapMarkerAlt,
  FaBox,
  FaFileInvoice,
  FaLeaf, // Added FaLeaf for green initiatives
  FaGlobeAmericas} from "react-icons/fa";

// Define service data with corresponding route service names and NEW detail page paths
const services = [
  {
    icon: <FaMapMarkerAlt className="text-4xl text-blue-600" />,
    title: "Door to Door Freight",
    description: "Seamless end-to-end logistics from pickup to delivery.",
    routeService: "Door to Door",
    path: "/door-to-door-details", // NEW: Link to dedicated detail page
  },
  {
    icon: <FaTruck className="text-4xl text-blue-600" />,
    title: "Road Freight",
    description: "Reliable door-to-door trucking across India for any cargo size.",
    routeService: "Truck",
    path: "/truck-details", // NEW: Link to dedicated detail page
  },
  {
    icon: <FaTrain className="text-4xl text-blue-600" />,
    title: "Rail Cargo",
    description: "Cost-effective and timely shipping via India’s railway network.",
    routeService: "Rail",
    path: "/rail-details", // NEW: Link to dedicated detail page
  },
  {
    icon: <FaPlane className="text-4xl text-blue-600" />,
    title: "Air Freight",
    description: "Fastest way to send shipments domestically and internationally.",
    routeService: "Air",
    path: "/air-details", // NEW: Link to dedicated detail page
  },
  {
    icon: <FaShip className="text-4xl text-blue-600" />,
    title: "Ocean Freight",
    description: "Full container or less-than-container shipping across the globe.",
    routeService: "Sea",
    path: "/sea-details", // NEW: Link to dedicated detail page
  },
  {
    icon: <FaShieldAlt className="text-4xl text-green-600" />,
    title: "Cargo Insurance",
    description: "Protect your shipment against loss or damage with secure coverage.",
    routeService: "Insurance",
    path: "/insurance-details", // NEW: Link to dedicated detail page
  },
  {
    icon: <FaCogs className="text-4xl text-blue-600" />,
    title: "Customs & Clearance",
    description: "Smooth documentation and clearance at ports and borders.",
    routeService: "Customs",
    path: "/customs-details", // NEW: Link to dedicated detail page
  },
  {
    icon: <FaBox className="text-4xl text-blue-600" />,
    title: "LCL Shipping",
    description: "Flexible shipping for smaller cargo volumes by sea.",
    routeService: "LCL",
    path: "/lcl-details", // NEW: Link to dedicated detail page
  },
  {
    icon: <FaFileInvoice className="text-4xl text-blue-600" />,
    title: "Parcel Services",
    description: "Efficient and secure delivery for small packages and documents.",
    routeService: "Parcel",
    path: "/parcel-details", // NEW: Link to dedicated detail page
  },
];

const ServicesPage: React.FC = () => {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-purple-50 min-h-screen">
      {/* Hero Section for Services Page - More Subtle */}
      <section className="bg-gradient-to-r from-blue-500 to-purple-600 text-white py-16 px-4 text-center">
        <h1 className="text-4xl font-extrabold mb-3 animate-fade-in-up">
          Our <span className="text-yellow-300">Comprehensive</span> Logistics Solutions
        </h1>
        <p className="text-lg max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: "100ms" }}>
          Delivering excellence through a wide range of reliable and efficient freight services.
        </p>
      </section>

      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800 mb-4 animate-fade-in">
            Explore Our <span className="text-blue-700">Specialized Services</span>
          </h2>
          <p className="text-gray-600 text-lg max-w-3xl mx-auto animate-fade-in" style={{ animationDelay: "100ms" }}>
            From local deliveries to global shipments, we've got your logistics needs covered with expertise and dedication.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"> {/* Adjusted grid for more columns */}
          {services.map((service, index) => (
            <Link
              key={index}
              to={service.path} // Now linking to the dedicated detail page
              // Removed state={{ activeService: service.routeService }} as it's not needed for detail pages
              className="group bg-white p-8 rounded-xl shadow-lg border border-gray-200
                         hover:shadow-xl hover:border-blue-300 transform hover:-translate-y-2
                         transition duration-300 ease-in-out flex flex-col items-center text-center
                         animate-fade-in"
              style={{ animationDelay: `${index * 80}ms`, animationFillMode: "both" }}
            >
              <div className="mb-5 p-4 rounded-full bg-blue-100 group-hover:bg-blue-200 transition-colors duration-300">
                {service.icon}
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-800 group-hover:text-blue-700 transition-colors duration-300">
                {service.title}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {service.description}
              </p>
              <span className="mt-4 text-blue-600 font-medium group-hover:text-blue-800 transition-colors duration-300 flex items-center">
                Learn More & Get Quote
                <svg className="ml-2 w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
              </span>
            </Link>
          ))}
        </div>

        {/* New Section: Our Commitment to Green Logistics */}
        <div className="mt-20 text-center bg-green-50 p-10 rounded-xl shadow-lg border border-green-200">
          <h2 className="text-4xl font-bold text-green-800 mb-6 animate-fade-in">
            🌱 Our Commitment to <span className="text-green-600">Green Logistics</span> & Net Zero
          </h2>
          <p className="text-gray-700 text-lg max-w-4xl mx-auto mb-8 animate-fade-in" style={{ animationDelay: "100ms" }}>
            At SHIPPITIN, we are dedicated to building a sustainable future for logistics. Our goal is to achieve net-zero carbon emissions by 2040, integrating eco-friendly practices across all our operations.
          </p>
          <div className="flex flex-wrap justify-center gap-8 mb-8">
            <div className="flex flex-col items-center p-4 bg-white rounded-lg shadow-md w-48 transition-transform hover:scale-105">
              <FaLeaf className="text-5xl text-green-500 mb-3" />
              <h4 className="text-xl font-semibold text-gray-800 mb-2">Sustainable Practices</h4>
              <p className="text-gray-600 text-sm">Optimizing routes, reducing waste, and promoting eco-friendly packaging.</p>
            </div>
            <div className="flex flex-col items-center p-4 bg-white rounded-lg shadow-md w-48 transition-transform hover:scale-105">
              <FaGlobeAmericas className="text-5xl text-blue-500 mb-3" />
              <h4 className="text-xl font-semibold text-gray-800 mb-2">Carbon Neutrality</h4>
              <p className="text-gray-600 text-sm">Investing in renewable energy and carbon offset programs.</p>
            </div>
            <div className="flex flex-col items-center p-4 bg-white rounded-lg shadow-md w-48 transition-transform hover:scale-105">
              <FaTrain className="text-5xl text-purple-500 mb-3" />
              <h4 className="text-xl font-semibold text-gray-800 mb-2">Eco-friendly Modes</h4>
              <p className="text-gray-600 text-sm">Prioritizing rail and sea freight for lower emissions where possible.</p>
            </div>
          </div>
          <p className="text-gray-700 text-md max-w-3xl mx-auto">
            Join us in our journey towards a greener supply chain. Together, we can make a difference.
          </p>
        </div>

        {/* General CTA Section */}
        <div className="mt-16 text-center">
          <h3 className="text-3xl font-bold text-gray-800 mb-6">Ready to Ship with SHIPPITIN?</h3>
          <p className="text-gray-600 text-lg mb-8">
            Contact our experts today to find the perfect logistics solution for your business.
          </p>
          <Link
            to="/support"
            className="inline-block bg-blue-600 text-white font-semibold py-3 px-8 rounded-full
                       shadow-lg hover:bg-blue-700 transition duration-300 transform hover:scale-105"
          >
            Get in Touch
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ServicesPage;
