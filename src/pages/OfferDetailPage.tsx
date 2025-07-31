// src/pages/OfferDetailPage.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { FaTruck, FaShip, FaPlane, FaTrain, FaBoxOpen, FaFileInvoice, FaMapMarkerAlt, FaTag } from 'react-icons/fa'; // Added FaTag, FaPercent for general offers

// Define a richer set of offers for the listing page
const detailedOffers = [
  {
    id: 'road-freight-discount',
    title: "Flat 15% Off on Road Freight",
    description: "Special discount for first-time users booking road freight services. Applicable on all domestic truck bookings over 500 KG.",
    icon: FaTruck,
    link: "/truck-booking", // Direct link to truck booking
    serviceType: "Truck",
    bgColor: "bg-blue-50",
    iconColor: "text-blue-600",
    buttonColor: "bg-blue-600",
    buttonHoverColor: "hover:bg-blue-700"
  },
  {
    id: 'sea-shipping-insurance',
    title: "Exclusive Shipping Insurance on Sea Cargo",
    description: "Get comprehensive cargo insurance at reduced rates for all FCL and LCL sea shipments. Protect your goods from port to port.",
    icon: FaShip,
    link: "/insurance-booking", // Direct link to insurance booking
    serviceType: "Insurance",
    bgColor: "bg-green-50",
    iconColor: "text-green-600",
    buttonColor: "bg-green-600",
    buttonHoverColor: "hover:bg-green-700"
  },
  {
    id: 'air-express-promo',
    title: "20% Off on Air Express Services",
    description: "Expedite your urgent shipments with 20% off on all express air freight bookings. Limited time offer!",
    icon: FaPlane,
    link: "/air-booking", // Direct link to air booking
    serviceType: "Air",
    bgColor: "bg-red-50",
    iconColor: "text-red-600",
    buttonColor: "bg-red-600",
    buttonHoverColor: "hover:bg-red-700"
  },
  {
    id: 'train-container-special',
    title: "Train Container Booking Special",
    description: "Discounted rates for 20ft and 40ft container bookings via rail. Ideal for bulk cargo transportation.",
    icon: FaTrain,
    link: "/train-booking", // Direct link to train booking
    serviceType: "Train Container Booking",
    bgColor: "bg-yellow-50",
    iconColor: "text-yellow-600",
    buttonColor: "bg-yellow-600",
    buttonHoverColor: "hover:bg-yellow-700"
  },
  {
    id: 'parcel-delivery-deal',
    title: "Flat Rate Parcel Delivery",
    description: "Send parcels nationwide with a special flat rate for packages under 10 KG. Fast and reliable service.",
    icon: FaBoxOpen,
    link: "/parcel-booking", // Direct link to parcel booking
    serviceType: "Parcel",
    bgColor: "bg-indigo-50",
    iconColor: "text-indigo-600",
    buttonColor: "bg-indigo-600",
    buttonHoverColor: "hover:bg-indigo-700"
  },
  {
    id: 'customs-clearance-assist',
    title: "Free Customs Consultation",
    description: "Get a free 30-minute consultation with our customs experts for your import/export needs.",
    icon: FaFileInvoice,
    link: "/customs-booking", // Direct link to customs booking
    serviceType: "Customs",
    bgColor: "bg-purple-50",
    iconColor: "text-purple-600",
    buttonColor: "bg-purple-600",
    buttonHoverColor: "hover:bg-purple-700"
  },
  {
    id: 'door-to-door-convenience',
    title: "Door to Door Service Package",
    description: "Enjoy seamless logistics with our all-inclusive door-to-door service. Special rates for new clients.",
    icon: FaMapMarkerAlt,
    link: "/door-to-door-booking", // Direct link to door-to-door booking
    serviceType: "Door to Door",
    bgColor: "bg-teal-50",
    iconColor: "text-teal-600",
    buttonColor: "bg-teal-600",
    buttonHoverColor: "hover:bg-teal-700"
  },
  {
    id: 'lcl-volume-discount',
    title: "LCL Volume Discount",
    description: "Save more on Less than Container Load (LCL) shipments when booking multiple cubic meters.",
    icon: FaBoxOpen, // Re-using FaBoxOpen for LCL
    link: "/lcl-booking", // Direct link to LCL booking
    serviceType: "LCL",
    bgColor: "bg-orange-50",
    iconColor: "text-orange-600",
    buttonColor: "bg-orange-600",
    buttonHoverColor: "hover:bg-orange-700"
  },
  {
    id: 'first-last-mile-bundle',
    title: "First & Last Mile Bundle Offer",
    description: "Combine first-mile pickup and last-mile delivery for a discounted bundled price.",
    icon: FaMapMarkerAlt, // Re-using FaMapMarkerAlt for First/Last Mile
    link: "/first-last-mile-booking", // Direct link to first/last mile booking
    serviceType: "First/Last Mile",
    bgColor: "bg-pink-50",
    iconColor: "text-pink-600",
    buttonColor: "bg-pink-600",
    buttonHoverColor: "hover:bg-pink-700"
  },
];

const OfferDetailPage: React.FC = () => {
  return (
    <div className="bg-gradient-to-br from-purple-50 to-blue-50 min-h-screen">
      {/* Hero Section for Offers Page - More Subtle */}
      <section className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-16 px-4 text-center">
        <h1 className="text-4xl font-extrabold mb-3 animate-fade-in-up">
          Exclusive <span className="text-yellow-300">Offers & Discounts</span>
        </h1>
        <p className="text-lg max-w-2xl mx-auto animate-fade-in-up" style={{ animationDelay: "100ms" }}>
          Unlock amazing savings on our top-tier logistics services.
        </p>
      </section>

      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800 mb-4 animate-fade-in">
            Discover Our <span className="text-purple-700">Special Deals</span>
          </h2>
          <p className="text-gray-600 text-lg max-w-3xl mx-auto animate-fade-in" style={{ animationDelay: "100ms" }}>
            We're constantly updating our promotions to provide you with the best value.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {detailedOffers.map((offer, index) => (
            <div
              key={offer.id}
              className={`p-8 rounded-xl shadow-lg transition-transform transform hover:scale-105
                         ${offer.bgColor} border-2 border-gray-200 flex flex-col items-center text-center
                         animate-fade-in`}
              style={{ animationDelay: `${index * 100}ms`, animationFillMode: "both" }}
            >
              <div className={`mb-5 p-4 rounded-full ${offer.bgColor.replace('-50', '-200')} group-hover:${offer.bgColor.replace('-50', '-300')} transition-colors duration-300`}>
                <offer.icon className={`text-5xl ${offer.iconColor}`} />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-3">{offer.title}</h2>
              <p className="text-gray-700 mb-6 flex-grow">{offer.description}</p>
              <Link
                to={offer.link}
                state={{ activeService: offer.serviceType }} // Pass serviceType to pre-select tab if applicable
                className={`mt-auto px-8 py-3 ${offer.buttonColor} text-white font-semibold rounded-full shadow-md
                            ${offer.buttonHoverColor} transition duration-300 transform hover:scale-105 flex items-center justify-center`}
              >
                View Offer
                <FaTag className="ml-2" />
              </Link>
            </div>
          ))}
        </div>

        {/* Call to Action for general inquiries */}
        <div className="mt-16 text-center bg-blue-600 text-white p-10 rounded-xl shadow-lg animate-fade-in">
          <h3 className="text-3xl font-bold mb-4">Didn't find what you're looking for?</h3>
          <p className="text-lg mb-8">
            Contact our sales team for custom quotes and tailored logistics solutions.
          </p>
          <Link
            to="/support"
            className="inline-block bg-white text-blue-600 font-semibold py-3 px-8 rounded-full
                       shadow-lg hover:bg-gray-100 transition duration-300 transform hover:scale-105"
          >
            Contact Sales
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OfferDetailPage;
