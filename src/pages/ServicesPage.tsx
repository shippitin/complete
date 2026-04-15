import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  FaTruck, FaShip, FaPlane, FaTrain, FaShieldAlt,
  FaCogs, FaMapMarkerAlt, FaBox, FaLeaf, FaGlobeAmericas, 
  FaArrowRight, FaCheckCircle, FaWind, FaHistory
} from "react-icons/fa";

const services = [
  { icon: <FaMapMarkerAlt />, title: "Door to Door", description: "Seamless end-to-end logistics from pickup to delivery.", path: "/door-to-door-details", color: "text-blue-400", bg: "bg-blue-50", eco: "High" },
  { icon: <FaTruck />, title: "Road Freight", description: "Reliable trucking with AI-optimized routing to reduce empty miles.", path: "/truck-details", color: "text-indigo-400", bg: "bg-indigo-50", eco: "Optimized" },
  { icon: <FaTrain />, title: "Rail Cargo", description: "The gold standard for green domestic shipping.", path: "/rail-details", color: "text-purple-400", bg: "bg-purple-50", eco: "Best" },
  { icon: <FaPlane />, title: "Air Freight", description: "Fastest delivery with integrated carbon-offsetting options.", path: "/air-details", color: "text-sky-400", bg: "bg-sky-50", eco: "Offset" },
  { icon: <FaShip />, title: "Ocean Freight", description: "Global shipping with the lowest CO2-per-tonne ratio.", path: "/sea-details", color: "text-cyan-400", bg: "bg-cyan-50", eco: "Best" },
  { icon: <FaShieldAlt />, title: "Cargo Insurance", description: "Comprehensive protection for your peace of mind.", path: "/insurance-details", color: "text-emerald-400", bg: "bg-emerald-50", eco: null },
  { icon: <FaCogs />, title: "Customs & Clearance", description: "Digital documentation reducing paper waste by 100%.", path: "/customs-details", color: "text-slate-400", bg: "bg-slate-50", eco: "Paperless" },
  { icon: <FaBox />, title: "LCL Shipping", description: "Optimized container sharing to minimize fuel consumption.", path: "/lcl-details", color: "text-blue-300", bg: "bg-blue-50", eco: "Efficient" },
];

const ServicesPage: React.FC = () => {
  const [km, setKm] = useState<number>(2500);
  
  const carbonSaved = (km * 0.065).toFixed(1);
  const treesEquivalent = Math.floor(km / 12);
  
  // Dynamic scale for the tree icon (Friend's "Dynamic" idea)
  const treeSize = 1 + (km / 5000); 

  return (
    <div className="bg-[#fcfdfd] min-h-screen font-sans text-slate-700">
      
      {/* 1. HERO SECTION */}
      <section className="bg-gradient-to-b from-emerald-50/40 to-white py-20 px-6 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100/40 text-emerald-600 text-[10px] font-black tracking-widest mb-6 border border-emerald-100">
            <FaLeaf /> PIONEERING GREEN LOGISTICS
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-slate-900 mb-6">
            Our <span className="text-blue-400/80">Services</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
            Delivering excellence through reliable, efficient, and eco-conscious freight solutions.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 pb-24">
        
        {/* 2. SERVICES GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-32">
          {services.map((service, i) => (
            <Link key={i} to={service.path} className="group bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 hover:shadow-xl hover:border-emerald-100 transition-all duration-500 relative">
              {service.eco && (
                <div className="absolute top-6 right-6 flex items-center gap-1 text-[9px] font-black text-emerald-500 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                  <FaCheckCircle className="text-[8px]" /> {service.eco}
                </div>
              )}
              <div className={`mb-6 w-14 h-14 rounded-2xl flex items-center justify-center text-2xl ${service.bg} ${service.color}`}>
                {service.icon}
              </div>
              <h3 className="text-lg font-bold mb-2 text-slate-800">{service.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-4">{service.description}</p>
              <div className="text-xs font-bold text-blue-300 flex items-center gap-1 group-hover:text-blue-500 transition-all">
                VIEW DETAILS <FaArrowRight className="text-[9px]" />
              </div>
            </Link>
          ))}
        </div>

        {/* 3. GREEN COMMITMENT (Pastel Image Style) */}
        <section className="bg-emerald-50/30 rounded-[3.5rem] p-10 md:p-16 border border-emerald-100/50 text-center mb-32">
          <h2 className="text-3xl font-bold text-emerald-800 mb-6">🌱 Our Commitment to Green Logistics</h2>
          <p className="text-slate-500 max-w-2xl mx-auto mb-12 text-sm leading-relaxed">
            Goal: Net-zero carbon emissions by 2040. We integrate eco-friendly practices across all our operations to ensure a sustainable future.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-8 rounded-[2rem] border border-white">
              <FaLeaf className="text-emerald-500 text-3xl mx-auto mb-4" />
              <h4 className="font-bold text-slate-800 text-sm mb-2">Sustainable Practices</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">Optimizing routes, reducing waste, and promoting eco-friendly packaging.</p>
            </div>
            <div className="bg-white p-8 rounded-[2rem] border border-white">
              <FaGlobeAmericas className="text-blue-500 text-3xl mx-auto mb-4" />
              <h4 className="font-bold text-slate-800 text-sm mb-2">Carbon Neutrality</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">Investing in renewable energy and certified carbon offset programs.</p>
            </div>
            <div className="bg-white p-8 rounded-[2rem] border border-white">
              <FaTrain className="text-purple-500 text-3xl mx-auto mb-4" />
              <h4 className="font-bold text-slate-800 text-sm mb-2">Eco-friendly Modes</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">Prioritizing rail and sea freight for lower emissions where possible.</p>
            </div>
          </div>
        </section>

        {/* 4. QUANTIFIED IMPACT (The Calculator) */}
        <section className="bg-white rounded-[4rem] p-10 md:p-20 border border-slate-100 shadow-[0_40px_80px_-20px_rgba(16,185,129,0.05)] mb-32 relative">
          <div className="flex flex-col lg:flex-row gap-16 items-center">
            <div className="lg:w-1/2">
              <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 leading-tight">
                Your Shipments, <br/> <span className="text-emerald-500 font-black">Quantified.</span>
              </h2>
              <p className="text-slate-500 text-lg mb-8">
                Transparency is our priority. See the environmental footprint you save by choosing our optimized networks.
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-5 bg-blue-50/50 rounded-2xl border border-blue-100/50">
                  <FaWind className="text-blue-400" />
                  <p className="text-xs text-slate-600">Reduced urban smog by 40% via route optimization.</p>
                </div>
                <div className="flex items-center gap-4 p-5 bg-emerald-50/50 rounded-2xl border border-emerald-100/50">
                  <FaHistory className="text-emerald-400" />
                  <p className="text-xs text-slate-600">Carbon offset credits provided for every booking.</p>
                </div>
              </div>
            </div>

            <div className="lg:w-1/2 w-full">
              <div className="bg-slate-50/50 rounded-[3rem] p-10 border border-slate-100 shadow-inner">
                <div className="flex justify-between items-center mb-8">
                   <h3 className="font-black text-slate-400 text-[10px] uppercase tracking-widest">Sustainability Dashboard</h3>
                   <div className="w-2 h-2 bg-emerald-400 rounded-full animate-ping"></div>
                </div>

                <div className="space-y-10">
                  <div>
                    <div className="flex justify-between items-end mb-4 font-bold">
                      <span className="text-slate-400 text-[10px] uppercase">Annual Distance</span>
                      <span className="text-4xl text-slate-800 tabular-nums">{km} <span className="text-sm font-normal text-slate-300">KM</span></span>
                    </div>
                    <input type="range" min="100" max="10000" step="100" value={km} onChange={(e) => setKm(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-slate-200 rounded-full appearance-none cursor-pointer accent-emerald-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    {/* FRIEND'S COLOR POP BOXES */}
                    <div className="bg-emerald-50 p-6 rounded-[2rem] border border-emerald-100 shadow-sm text-center transform transition-all duration-300 hover:scale-105">
                      <p className="text-[9px] font-black text-emerald-600 uppercase mb-1">CO2 Saved</p>
                      <p className="text-3xl font-bold text-slate-800">{carbonSaved}kg</p>
                    </div>
                    <div className="bg-blue-50 p-6 rounded-[2rem] border border-blue-100 shadow-sm text-center transform transition-all duration-300 hover:scale-105">
                      <p className="text-[9px] font-black text-blue-500 uppercase mb-1">Tree Value</p>
                      <div className="flex items-center justify-center gap-2">
                        <p className="text-3xl font-bold text-slate-800">{treesEquivalent}</p>
                        <span style={{ transform: `scale(${treeSize})`, transition: 'transform 0.3s ease-out' }}>🌳</span>
                      </div>
                    </div>
                  </div>
                  
                  <p className="text-center text-[10px] text-slate-400 font-medium">
                    🌱 Saves <span className="text-emerald-600 font-bold">65% CO2</span> compared to standard road-only transport.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 5. FINAL CTA (Corrected Text) */}
        <div className="text-center py-16 px-6 bg-slate-50 rounded-[3rem] border border-slate-100">
            <h2 className="text-2xl font-bold text-slate-800 mb-4">Ready to Ship?</h2>
            <Link to="/support" className="inline-block bg-blue-500 text-white px-12 py-4 rounded-full font-bold shadow-lg shadow-blue-100 hover:bg-blue-600 transition-all transform hover:-translate-y-1">
                Get a Quote
            </Link>
        </div>
      </div>
    </div>
  );
};

export default ServicesPage;