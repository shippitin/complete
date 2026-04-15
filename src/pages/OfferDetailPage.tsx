// src/pages/OfferDetailPage.tsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaTruck, FaShip, FaPlane, FaTrain, FaBoxOpen, FaFileInvoice, 
  FaMapMarkerAlt, FaTag, FaLeaf, FaCopy, FaCheckCircle, FaStar 
} from 'react-icons/fa';

// --- Data Structure ---

const detailedOffers = [
  {
    id: 'ROAD-15',
    title: "Flat 15% Off on Road Freight",
    description: "Special discount for first-time users booking road freight services over 500 KG.",
    icon: FaTruck,
    link: "/truck-booking",
    serviceType: "Truck",
    bgColor: "bg-blue-50",
    iconColor: "text-blue-600",
    buttonColor: "bg-blue-600",
    buttonHoverColor: "hover:bg-blue-700",
    isEco: false
  },
  {
    id: 'SEA-INSURE',
    title: "Exclusive Sea Cargo Insurance",
    description: "Comprehensive cargo insurance at reduced rates for all FCL and LCL sea shipments.",
    icon: FaShip,
    link: "/insurance-booking",
    serviceType: "Insurance",
    bgColor: "bg-green-50",
    iconColor: "text-green-600",
    buttonColor: "bg-green-600",
    buttonHoverColor: "hover:bg-green-700",
    isEco: true
  },
  {
    id: 'AIR-20',
    title: "20% Off Air Express",
    description: "Expedite urgent shipments with 20% off on all express air freight bookings.",
    icon: FaPlane,
    link: "/air-booking",
    serviceType: "Air",
    bgColor: "bg-red-50",
    iconColor: "text-red-600",
    buttonColor: "bg-red-600",
    buttonHoverColor: "hover:bg-red-700",
    isEco: false
  },
  {
    id: 'RAIL-BULK',
    title: "Train Container Special",
    description: "Discounted rates for 20ft and 40ft container bookings via rail. Ideal for bulk.",
    icon: FaTrain,
    link: "/train-booking",
    serviceType: "Train",
    bgColor: "bg-emerald-50",
    iconColor: "text-emerald-600",
    buttonColor: "bg-emerald-600",
    buttonHoverColor: "hover:bg-emerald-700",
    isEco: true
  },
  {
    id: 'CUSTOM-FREE',
    title: "Free Customs Consultation",
    description: "Get a free 30-minute consultation with our experts for your import/export needs.",
    icon: FaFileInvoice,
    link: "/customs-booking",
    serviceType: "Customs",
    bgColor: "bg-purple-50",
    iconColor: "text-purple-600",
    buttonColor: "bg-purple-600",
    buttonHoverColor: "hover:bg-purple-700",
    isEco: false
  },
  {
    id: 'DOOR-STEP',
    title: "Door to Door Package",
    description: "Seamless logistics with our all-inclusive door-to-door service at special rates.",
    icon: FaMapMarkerAlt,
    link: "/door-to-door-booking",
    serviceType: "Door to Door",
    bgColor: "bg-teal-50",
    iconColor: "text-teal-600",
    buttonColor: "bg-teal-600",
    buttonHoverColor: "hover:bg-teal-700",
    isEco: false
  }
];

const OfferDetailPage: React.FC = () => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(code);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="bg-gray-50 min-h-screen font-sans">
      
      {/* 1. Hero Section with Green Rewards Tracker */}
      <section className="bg-slate-900 text-white py-16 px-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 opacity-10 translate-x-1/4 -translate-y-1/4">
          <FaLeaf size={400} />
        </div>
        
        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <h1 className="text-5xl font-black mb-4 tracking-tight">
            YOUR <span className="text-emerald-400">REWARDS</span> HUB
          </h1>
          <p className="text-gray-400 text-lg mb-10 max-w-2xl mx-auto">
            The more sustainable your logistics, the bigger your discounts. Join our Green-Tier program.
          </p>

          <div className="max-w-3xl mx-auto bg-white/5 backdrop-blur-md border border-white/10 p-8 rounded-3xl shadow-2xl">
            <div className="flex justify-between items-end mb-4">
              <div className="text-left">
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Current Tier</span>
                <p className="text-2xl font-black flex items-center">SILVER ECO <FaStar className="ml-2 text-yellow-400 text-sm" /></p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-gray-400">Next Reward: <span className="text-white">FREE Insurance</span></p>
                <p className="text-[10px] text-emerald-400">240kg CO2 saved of 500kg</p>
              </div>
            </div>
            
            <div className="w-full bg-gray-800 h-4 rounded-full overflow-hidden flex">
              <div className="bg-emerald-500 h-full w-[48%] shadow-[0_0_15px_rgba(16,185,129,0.5)] transition-all duration-1000" />
            </div>
            
            <div className="grid grid-cols-3 mt-4 text-[10px] font-bold text-gray-500 uppercase">
              <div className="text-left">Bronze</div>
              <div className="text-center text-emerald-400">Silver</div>
              <div className="text-right">Gold</div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Offers Grid */}
      <div className="max-w-7xl mx-auto py-20 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-12">
          <div className="text-left">
            <h2 className="text-3xl font-black text-gray-900">Available Promotions</h2>
            <p className="text-gray-500">Active vouchers for your next shipment</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {detailedOffers.map((offer) => {
            const promoCode = `${offer.id}SHIP26`;
            return (
              <div
                key={offer.id}
                className="group relative bg-white rounded-3xl p-8 border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-300 flex flex-col"
              >
                {offer.isEco && (
                  <div className="absolute top-6 right-6 flex items-center bg-emerald-100 text-emerald-700 text-[10px] font-black px-3 py-1 rounded-full border border-emerald-200">
                    <FaLeaf className="mr-1" /> ECO-SAVER
                  </div>
                )}

                <div className={`w-14 h-14 rounded-2xl ${offer.bgColor} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <offer.icon className={`text-2xl ${offer.iconColor}`} />
                </div>

                <h3 className="text-xl font-black text-gray-900 mb-3">{offer.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed mb-8 flex-grow">
                  {offer.description}
                </p>

                {/* Coupon UI */}
                <div className="mb-6 bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl p-4 flex justify-between items-center group-hover:border-blue-200 transition-colors">
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Promo Code</p>
                    <p className="font-mono font-bold text-gray-700">{promoCode}</p>
                  </div>
                  <button 
                    onClick={() => copyCode(promoCode)}
                    className={`p-3 rounded-xl transition-all ${copiedId === promoCode ? 'bg-green-500 text-white' : 'bg-white text-gray-400 shadow-sm hover:text-blue-600'}`}
                  >
                    {copiedId === promoCode ? <FaCheckCircle /> : <FaCopy />}
                  </button>
                </div>

                {/* Claim Offer with Auto-fill State */}
                <Link
                  to={offer.link}
                  state={{ appliedPromo: promoCode }}
                  className={`w-full py-4 ${offer.buttonColor} text-white font-bold rounded-2xl flex items-center justify-center shadow-lg transform active:scale-95 transition-all`}
                >
                  Claim This Offer <FaTag className="ml-2 text-xs opacity-50" />
                </Link>
              </div>
            );
          })}
        </div>

        {/* 3. Support CTA */}
        <div className="mt-20 bg-blue-600 rounded-[3rem] p-12 text-center text-white relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
          <h3 className="text-4xl font-black mb-4">Enterprise Scaling?</h3>
          <p className="text-blue-100 text-lg mb-10 max-w-xl mx-auto">
            For volumes over 100 containers/month, our sales team creates custom rate-cards.
          </p>
          <Link
            to="/support"
            className="bg-white text-blue-600 px-12 py-5 rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-gray-100 shadow-xl transition-all"
          >
            Request Enterprise Quote
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OfferDetailPage;