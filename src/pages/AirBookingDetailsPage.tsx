// src/pages/AirBookingDetailsPage.tsx
import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaUser, FaBuilding, FaIdCard, FaEnvelope, FaPhone, FaCommentDots, FaSave, FaArrowLeft, FaInfoCircle } from 'react-icons/fa';
import type { AllFormData } from '../types/QuoteFormHandle';
import { bookingAPI } from '../services/api';

interface AirServiceResult {
  id: string;
  serviceName: string;
  carrier: string;
  originAirport: string;
  destinationAirport: string;
  departureDate: string;
  transitTime: string;
  price: number;
  cargoType: string;
  features: string[];
  status: 'Available' | 'Limited' | 'Full';
}

const AirBookingDetailsPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const selectedResult = location.state?.selectedResult as AirServiceResult | undefined;
  const originalFormData = location.state?.originalFormData as AllFormData | undefined;

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [gstin, setGstin] = useState('');
  const [kycDocType, setKycDocType] = useState('Passport');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [loading, setLoading] = useState(false);

  const kycDocOptions = ['Passport', 'Aadhaar Card', 'Driving License', 'PAN Card', 'Other'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName || !email || !phone) {
      alert('Please fill in your Full Name, Email, and Phone Number.');
      return;
    }
    if (!selectedResult || !originalFormData) {
      alert('Booking details are missing. Please go back to search results.');
      return;
    }

    setLoading(true);

    const bookingId = `AIR-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`;

    try {
      await bookingAPI.create({
        booking_number: bookingId,
        service_type: 'Air',
        origin: selectedResult.originAirport,
        destination: selectedResult.destinationAirport,
        cargo_type: selectedResult.cargoType || 'General',
        weight: (originalFormData as any).weight || 0,
        booking_date: new Date().toISOString().split('T')[0],
        estimated_price: selectedResult.price,
        special_instructions: specialInstructions,
        status: 'confirmed',
      });
    } catch (error) {
      console.error('Failed to save booking to backend:', error);
    } finally {
      setLoading(false);
    }

    const bookingDetails = {
      selectedResult: {
        id: selectedResult.id,
        serviceName: selectedResult.serviceName,
        originStation: selectedResult.originAirport,
        destinationStation: selectedResult.destinationAirport,
        transitTime: selectedResult.transitTime,
        price: selectedResult.price,
        features: selectedResult.features,
        operator: selectedResult.carrier,
        status: selectedResult.status,
        mode: 'air',
      },
      originalFormData,
      kycDetails: {
        companyName: companyName || 'N/A',
        gstin: gstin || 'N/A',
        mobile: phone,
        email,
      },
      bookingDate: new Date().toLocaleDateString('en-IN'),
      bookingTime: new Date().toLocaleTimeString('en-IN'),
      bookingId,
      finalAmount: selectedResult.price,
    };

    navigate('/booking-confirmation', { state: { bookingDetails } });
  };

  if (!selectedResult || !originalFormData) {
    return (
      <div className="min-h-screen bg-gray-100 p-4 sm:p-6 flex flex-col items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-xl text-center">
          <FaInfoCircle className="text-red-500 text-6xl mb-4 mx-auto" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Booking details missing.</h2>
          <p className="text-gray-600 mb-6">Please go back to search results and select a service.</p>
          <button onClick={() => navigate('/air-results')} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full shadow-md transition duration-300">
            <FaArrowLeft className="inline-block mr-2" /> Back to Results
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 flex flex-col items-center">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-blue-600 text-white p-6 rounded-t-2xl flex items-center justify-between">
          <h1 className="text-3xl font-bold">Air Booking Details</h1>
          <button onClick={() => navigate(-1)} className="flex items-center px-4 py-2 bg-blue-700 hover:bg-blue-800 rounded-full text-sm font-semibold transition duration-200">
            <FaArrowLeft className="mr-2" /> Back
          </button>
        </div>

        <div className="flex justify-around mb-8 text-center p-6 border-b border-gray-200 bg-white">
          <div className="flex-1 text-gray-400">
            <div className="w-10 h-10 mx-auto mb-2 rounded-full flex items-center justify-center border-2 border-gray-300 bg-gray-50">1</div>
            Search Results
          </div>
          <div className="flex-1 text-blue-600 font-bold">
            <div className="w-10 h-10 mx-auto mb-2 rounded-full flex items-center justify-center border-2 border-blue-600 bg-blue-100">2</div>
            Booking Details
          </div>
          <div className="flex-1 text-gray-400">
            <div className="w-10 h-10 mx-auto mb-2 rounded-full flex items-center justify-center border-2 border-gray-300 bg-gray-50">3</div>
            Confirmation
          </div>
        </div>

        <div className="p-4 sm:p-6 border-b border-gray-200">
          <div className="bg-blue-50 p-6 rounded-xl border border-blue-200 shadow-md">
            <h2 className="text-xl font-bold text-blue-800 mb-4 flex items-center">
              <FaInfoCircle className="mr-3" /> Selected Service Summary
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 text-gray-700">
              <div><strong>Service:</strong> {selectedResult.serviceName} ({selectedResult.carrier})</div>
              <div><strong>Route:</strong> {selectedResult.originAirport} → {selectedResult.destinationAirport}</div>
              <div><strong>Departure:</strong> {selectedResult.departureDate}</div>
              <div><strong>Transit Time:</strong> {selectedResult.transitTime}</div>
              <div><strong>Cargo Type:</strong> {selectedResult.cargoType}</div>
              <div><strong>Price:</strong> ₹{selectedResult.price.toLocaleString('en-IN')}</div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <FaUser className="mr-3 text-blue-600" /> Your Contact & KYC Details
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 mb-8">
            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-600 mb-1">Full Name <span className="text-red-500">*</span></label>
              <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2 bg-gray-50">
                <FaUser className="text-gray-400 mr-3" />
                <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Your full name" className="flex-1 bg-transparent outline-none text-gray-800" required />
              </div>
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-600 mb-1">Email <span className="text-red-500">*</span></label>
              <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2 bg-gray-50">
                <FaEnvelope className="text-gray-400 mr-3" />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your.email@example.com" className="flex-1 bg-transparent outline-none text-gray-800" required />
              </div>
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-600 mb-1">Phone Number <span className="text-red-500">*</span></label>
              <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2 bg-gray-50">
                <FaPhone className="text-gray-400 mr-3" />
                <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91 9876543210" className="flex-1 bg-transparent outline-none text-gray-800" required />
              </div>
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-600 mb-1">Company Name (Optional)</label>
              <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2 bg-gray-50">
                <FaBuilding className="text-gray-400 mr-3" />
                <input type="text" value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="Your company name" className="flex-1 bg-transparent outline-none text-gray-800" />
              </div>
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-600 mb-1">GSTIN (Optional)</label>
              <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2 bg-gray-50">
                <FaIdCard className="text-gray-400 mr-3" />
                <input type="text" value={gstin} onChange={e => setGstin(e.target.value)} placeholder="22AAAAA0000A1Z5" className="flex-1 bg-transparent outline-none text-gray-800" />
              </div>
            </div>

            <div className="flex flex-col">
              <label className="text-sm font-medium text-gray-600 mb-1">KYC Document Type</label>
              <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2 bg-gray-50">
                <FaIdCard className="text-gray-400 mr-3" />
                <select value={kycDocType} onChange={e => setKycDocType(e.target.value)} className="flex-1 bg-transparent outline-none text-gray-800">
                  {kycDocOptions.map(option => <option key={option} value={option}>{option}</option>)}
                </select>
              </div>
            </div>

            <div className="flex flex-col md:col-span-2">
              <label className="text-sm font-medium text-gray-600 mb-1">Special Instructions (Optional)</label>
              <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2 bg-gray-50">
                <FaCommentDots className="text-gray-400 mr-3" />
                <textarea value={specialInstructions} onChange={e => setSpecialInstructions(e.target.value)} placeholder="Any special handling instructions." rows={3} className="flex-1 bg-transparent outline-none text-gray-800 resize-y" />
              </div>
            </div>
          </div>

          <div className="text-center mt-6">
            <button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-10 rounded-full shadow-lg transition duration-300 flex items-center justify-center mx-auto disabled:opacity-50">
              {loading ? <span className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></span> : <FaSave className="mr-2" />}
              {loading ? 'Saving...' : 'Confirm & Proceed'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AirBookingDetailsPage;
