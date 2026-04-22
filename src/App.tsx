import React, { useEffect, useState, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';

import { signInWithCustomToken } from 'firebase/auth';
import { auth } from './firebase/firebaseConfig';

// Layout Components
import Header from './components/Header';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import HomeLandingPage from './pages/HomeLandingPage';
import InvestorLandingPage from './pages/InvestorLandingPage';
import TrackPage from './pages/TrackPage';
import BookingHistoryPage from './pages/BookingHistoryPage';
import ServicesPage from './pages/ServicesPage';
import SupportPage from './pages/SupportPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import OfferDetailPage from './pages/OfferDetailPage';
import QuoteFormPage from './pages/QuoteFormPage';
import BookingSummaryPage from './pages/BookingSummaryPage';
import MyShipmentsPage from './pages/MyShipmentsPage';
import BookingPage from './pages/BookingPage';
import ProfilePage from './pages/ProfilePage';
import DashboardPage from './pages/DashboardPage';
import MyWalletPage from './pages/MyWalletPage';
import AboutUsPage from './pages/AboutUsPage';
import CareersPage from './pages/CareersPage';
import MediaPage from './pages/MediaPage';
import BlogPage from './pages/BlogPage';
import TermsOfUsePage from './pages/TermsOfUsePage';
import PrivacyPolicyPage from './pages/PrivacyPolicyPage';
import CookiePolicyPage from './pages/CookiePolicyPage';

// Service Detail Pages
import DoorToDoorDetailPage from './pages/DoorToDoorDetailPage';
import TruckDetailPage from './pages/TruckDetailPage';
import RailDetailPage from './pages/RailDetailPage';
import AirDetailPage from './pages/AirDetailPage';
import SeaDetailPage from './pages/SeaDetailPage';
import CargoInsuranceDetailPage from './pages/CargoInsuranceDetailPage';
import CustomsDetailPage from './pages/CustomsDetailPage';
import LCLDetailPage from './pages/LCLDetailPage';
import ParcelDetailPage from './pages/ParcelDetailPage';

// Quote Form Imports
import RailQuoteForm from './components/QuoteForms/RailQuoteForm';
import PortServicesQuoteForm from './components/QuoteForms/PortServicesQuoteForm';
import InsuranceQuoteForm from './components/QuoteForms/InsuranceQuoteForm';
import FirstLastMileQuoteForm from './components/QuoteForms/FirstLastMileQuoteForm';

// Results & Details Pages
import DoorToDoorResultsPage from './pages/DoorToDoorResultsPage';
import SeaResultsPage from './pages/SeaResultsPage';
import AirResultsPage from './pages/AirResultsPage';
import TruckResultsPage from './pages/TruckResultsPage';
import LCLResultsPage from './pages/LCLResultsPage';
import CustomsResultsPage from './pages/CustomsResultsPage';
import ParcelResultsPage from './pages/ParcelResultsPage';
import TrainResultsPage from './pages/TrainResultsPage';
import InsuranceResultsPage from './pages/InsuranceResultsPage';
import FirstLastMileResultsPage from './pages/FirstLastMileResultsPage';
import PortResultsPage from './pages/PortResultsPage';

// Booking Details Pages
import AirBookingDetailsPage from './pages/AirBookingDetailsPage';
import CustomsBookingDetailsPage from './pages/CustomsBookingDetailsPage';
import SeaBookingDetailsPage from './pages/SeaBookingDetailsPage';
import TruckBookingDetailsPage from './pages/TruckBookingDetailsPage';
import LCLBookingDetailsPage from './pages/LCLBookingDetailsPage';
import FirstLastMileBookingDetailsPage from './pages/FirstLastMileBookingDetailsPage';
import InsuranceBookingDetailsPage from './pages/InsuranceBookingDetailsPage';
import ParcelBookingDetailsPage from './pages/ParcelBookingDetailsPage';
import RailServiceDetailsPage from './pages/RailServiceDetailsPage';

// Confirmation Pages
import BookingConfirmationPage from './pages/BookingConfirmationPage';
import RailBookingConfirmationPage from './pages/RailBookingConfirmationPage';

// Voice Assistant
import VoiceAssistant from './components/VoiceAssistant';
import { ParsedVoiceCommand } from './types/QuoteFormHandle';
import type { QuoteFormHandle } from './types/QuoteFormHandle';

declare const __firebase_config: string | undefined;
declare const __initial_auth_token: string | undefined;

// --- WRAPPERS ---

const InsuranceQuoteFormPageWrapper: React.FC = () => {
  const insuranceFormRef = useRef<QuoteFormHandle>(null);
  const navigate = useNavigate();

  const handleSubmitInsurance = async () => {
    if (insuranceFormRef.current) {
      const data = await insuranceFormRef.current.submit();
      if (data && (data as any).bookingType === 'Insurance') {
        navigate('/insurance-results', { state: { formData: data } });
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-10">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Get Your Insurance Quote</h2>
      <div className="bg-white rounded-xl shadow-md p-6">
        <InsuranceQuoteForm ref={insuranceFormRef} />
      </div>
      <div className="flex justify-center mt-8">
        <button onClick={handleSubmitInsurance} className="px-8 py-4 bg-green-600 text-white font-bold text-xl rounded-xl shadow-lg hover:bg-green-700 transition duration-300 transform hover:scale-105">
          Search Insurance Policies
        </button>
      </div>
    </div>
  );
};

const FirstLastMileQuoteFormPageWrapper: React.FC = () => {
  const firstLastMileFormRef = useRef<QuoteFormHandle>(null);
  const navigate = useNavigate();

  const handleSubmitFirstLastMile = () => {
    if (firstLastMileFormRef.current) {
      const data = firstLastMileFormRef.current.submit();
      if (data && (data as any).bookingType === 'First/Last Mile') {
        navigate('/first-last-mile-results', { state: { formData: data } });
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-10">
      <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">Get Your First/Last Mile Quote</h2>
      <div className="bg-white rounded-xl shadow-md p-6">
        <FirstLastMileQuoteForm ref={firstLastMileFormRef} />
      </div>
      <div className="flex justify-center mt-8">
        <button onClick={handleSubmitFirstLastMile} className="px-8 py-4 bg-purple-600 text-white font-bold text-xl rounded-xl shadow-lg hover:bg-purple-700 transition duration-300 transform hover:scale-105">
          Search First/Last Mile Services
        </button>
      </div>
    </div>
  );
};

// --- CONTENT COMPONENT ---

const AppContent: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [firebaseInitialized, setFirebaseInitialized] = useState(false);
  const [voicePrefillData, setVoicePrefillData] = useState<ParsedVoiceCommand | undefined>(undefined);

  useEffect(() => {
    setFirebaseInitialized(true);
    const initializeAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        }
      } catch (error) {
        console.error("Firebase authentication error:", error);
      }
    };
    initializeAuth();
  }, []);

  const handleVoiceCommand = (command: ParsedVoiceCommand) => {
    const updatedCommand: ParsedVoiceCommand = { ...command };
    setVoicePrefillData(updatedCommand);

    let targetPath: string | undefined;
    switch (updatedCommand.service) {
      case 'Truck': targetPath = '/truck-booking'; break;
      case 'Air': targetPath = '/air-booking'; break;
      case 'Sea': targetPath = '/sea-booking'; break;
      case 'Rail': targetPath = '/train-booking'; break;
      case 'Port Services': targetPath = '/port-booking'; break;
      case 'Parcel': targetPath = '/parcel-booking'; break;
      case 'Customs': targetPath = '/customs-booking'; break;
      case 'Insurance': targetPath = '/insurance-booking'; break;
      case 'First/Last Mile': targetPath = '/first-last-mile-booking'; break;
      case 'Door to Door': targetPath = '/door-to-door-booking'; break;
      case 'LCL': targetPath = '/lcl-booking'; break;
      case 'Track': targetPath = updatedCommand.shipmentId ? `/track?id=${updatedCommand.shipmentId}` : '/track'; break;
      default: return;
    }

    if (targetPath && location.pathname !== targetPath) {
      navigate(targetPath, { state: { prefillData: updatedCommand } });
    }
  };

  if (!firebaseInitialized) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <p className="text-xl text-gray-700">Loading application...</p>
      </div>
    );
  }

  return (
    <div className="App flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow w-full">
        <Routes>
          <Route path="/" element={<HomeLandingPage prefillData={voicePrefillData} />} />

          {/* General Pages */}
          <Route path="/aboutus" element={<AboutUsPage />} />
          <Route path="/investors" element={<div className="max-w-7xl mx-auto px-4 py-10"><InvestorLandingPage /></div>} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/support" element={<div className='max-w-7xl mx-auto px-4 py-10'><SupportPage /></div>} />
          <Route path="/track" element={<div className="max-w-7xl mx-auto px-4 py-10"><TrackPage /></div>} />
          <Route path="/offers" element={<div className="max-w-7xl mx-auto px-4 py-10"><OfferDetailPage /></div>} />
          <Route path="/careers" element={<CareersPage />} />
          <Route path="/media" element={<MediaPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/terms" element={<TermsOfUsePage />} />
          <Route path="/privacy" element={<PrivacyPolicyPage />} />
          <Route path="/cookies" element={<CookiePolicyPage />} />

          {/* Service Details */}
          <Route path="/door-to-door-details" element={<DoorToDoorDetailPage />} />
          <Route path="/truck-details" element={<TruckDetailPage />} />
          <Route path="/rail-details" element={<RailDetailPage />} />
          <Route path="/air-details" element={<AirDetailPage />} />
          <Route path="/sea-details" element={<SeaDetailPage />} />
          <Route path="/cargo-insurance-details" element={<CargoInsuranceDetailPage />} />
          <Route path="/customs-details" element={<CustomsDetailPage />} />
          <Route path="/lcl-details" element={<LCLDetailPage />} />
          <Route path="/parcel-details" element={<ParcelDetailPage />} />

          {/* Booking Forms */}
          <Route path="/truck-booking" element={<div className="max-w-4xl mx-auto py-10"><QuoteFormPage activeService="Truck" prefillData={voicePrefillData} /></div>} />
          <Route path="/air-booking" element={<div className="max-w-4xl mx-auto py-10"><QuoteFormPage activeService="Air" prefillData={voicePrefillData} /></div>} />
          <Route path="/sea-booking" element={<div className="max-w-4xl mx-auto py-10"><QuoteFormPage activeService="Sea" prefillData={voicePrefillData} /></div>} />
          <Route path="/parcel-booking" element={<div className="max-w-4xl mx-auto py-10"><QuoteFormPage activeService="Parcel" prefillData={voicePrefillData} /></div>} />
          <Route path="/door-to-door-booking" element={<div className="max-w-4xl mx-auto py-10"><QuoteFormPage activeService="Door to Door" prefillData={voicePrefillData} /></div>} />
          <Route path="/lcl-booking" element={<div className="max-w-4xl mx-auto px-4 py-10"><QuoteFormPage activeService="LCL" prefillData={voicePrefillData} /></div>} />
          <Route path="/customs-booking" element={<div className="max-w-4xl mx-auto px-4 py-10"><QuoteFormPage activeService="Customs" prefillData={voicePrefillData} /></div>} />

          {/* Rail Flow */}
          <Route path="/train-booking" element={<div className="max-w-4xl mx-auto py-10"><RailQuoteForm initialActiveService="container" prefillData={voicePrefillData} /></div>} />
          <Route path="/train-results" element={<TrainResultsPage />} />
          <Route path="/train-service-details" element={<RailServiceDetailsPage />} />
          <Route path="/rail-booking-confirmation" element={<RailBookingConfirmationPage />} />

          {/* Port Services Flow */}
          <Route path="/port-booking" element={<div className="max-w-4xl mx-auto py-10"><PortServicesQuoteForm /></div>} />
          <Route path="/port-results" element={<PortResultsPage />} />

          {/* Other Flows */}
          <Route path="/insurance-booking" element={<InsuranceQuoteFormPageWrapper />} />
          <Route path="/insurance-results" element={<InsuranceResultsPage />} />
          <Route path="/insurance-booking-details" element={<InsuranceBookingDetailsPage />} />
          <Route path="/first-last-mile-booking" element={<FirstLastMileQuoteFormPageWrapper />} />
          <Route path="/first-last-mile-results" element={<FirstLastMileResultsPage />} />
          <Route path="/first-last-mile-booking-details" element={<FirstLastMileBookingDetailsPage />} />
          <Route path="/parcel-results" element={<ParcelResultsPage />} />
          <Route path="/parcel-booking-details" element={<ParcelBookingDetailsPage />} />

          {/* Results Pages */}
          <Route path="/door-to-door-results" element={<DoorToDoorResultsPage />} />
          <Route path="/sea-results" element={<SeaResultsPage />} />
          <Route path="/sea-booking-details" element={<SeaBookingDetailsPage />} />
          <Route path="/air-results" element={<AirResultsPage />} />
          <Route path="/air-booking-details" element={<AirBookingDetailsPage />} />
          <Route path="/truck-results" element={<TruckResultsPage />} />
          <Route path="/truck-booking-details" element={<TruckBookingDetailsPage />} />
          <Route path="/lcl-results" element={<LCLResultsPage />} />
          <Route path="/lcl-booking-details" element={<LCLBookingDetailsPage />} />
          <Route path="/customs-results" element={<CustomsResultsPage />} />
          <Route path="/customs-booking-details" element={<CustomsBookingDetailsPage />} />

          {/* Auth Pages — Public */}
          <Route path="/login" element={<div className="max-w-7xl mx-auto px-4 py-10"><LoginPage /></div>} />
          <Route path="/signup" element={<div className="max-w-7xl mx-auto px-4 py-10"><SignupPage /></div>} />

          {/* Protected Pages — Login Required */}
          <Route path="/my-wallet" element={<ProtectedRoute><div className="max-w-7xl mx-auto px-4 py-10"><MyWalletPage /></div></ProtectedRoute>} />
          <Route path="/booking-confirmation" element={<ProtectedRoute><div className="max-w-7xl mx-auto px-4 py-10"><BookingConfirmationPage /></div></ProtectedRoute>} />
          <Route path="/my-bookings" element={<ProtectedRoute><div className="max-w-7xl mx-auto px-4 py-10"><BookingHistoryPage /></div></ProtectedRoute>} />
          <Route path="/booking-summary" element={<ProtectedRoute><div className="max-w-7xl mx-auto px-4 py-10"><BookingSummaryPage /></div></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><div className="max-w-7xl mx-auto px-4 py-10"><ProfilePage /></div></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><div className="max-w-7xl mx-auto px-4 py-10"><DashboardPage /></div></ProtectedRoute>} />

          <Route path="*" element={<div className="max-w-7xl mx-auto px-4 py-20 text-center text-3xl font-semibold text-gray-700">404 - Page Not Found</div>} />
        </Routes>
      </main>
      <Footer />
      <VoiceAssistant onCommandParsed={handleVoiceCommand} />
    </div>
  );
};

function App() {
  return (
    <Router basename="/">
      <AppContent />
    </Router>
  );
}

export default App;
