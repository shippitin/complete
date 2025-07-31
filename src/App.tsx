// src/App.tsx
import React, { useEffect, useState, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';

import { signInWithCustomToken } from 'firebase/auth';
import { auth } from './firebase/firebaseConfig';

// Layout Components
import Header from './components/Header';
import Footer from './components/Footer';

// Pages (All main page components are imported here)
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

// ALL NEW IMPORTS for Service Detail Pages
import DoorToDoorDetailPage from './pages/DoorToDoorDetailPage';
import TruckDetailPage from './pages/TruckDetailPage';
import RailDetailPage from './pages/RailDetailPage';
import AirDetailPage from './pages/AirDetailPage';
import SeaDetailPage from './pages/SeaDetailPage';
import CargoInsuranceDetailPage from './pages/CargoInsuranceDetailPage';
import CustomsDetailPage from './pages/CustomsDetailPage';
import LCLDetailPage from './pages/LCLDetailPage';
import ParcelDetailPage from './pages/ParcelDetailPage';

// Import RailQuoteForm directly for the /train-booking route
import RailQuoteForm from './components/QuoteForms/RailQuoteForm';

// Generic Booking Confirmation Page
import BookingConfirmationPage from './pages/BookingConfirmationPage';

// Specific Results & Details Pages
import DoorToDoorResultsPage from './pages/DoorToDoorResultsPage';
import SeaResultsPage from './pages/SeaResultsPage';
import AirResultsPage from './pages/AirResultsPage';
import TruckResultsPage from './pages/TruckResultsPage';
import LCLResultsPage from './pages/LCLResultsPage';
import CustomsResultsPage from './pages/CustomsResultsPage';
import ParcelResultsPage from './pages/ParcelResultsPage';
import ParcelBookingDetailsPage from './pages/ParcelBookingDetailsPage';

// Specific Booking Details Pages
import AirBookingDetailsPage from './pages/AirBookingDetailsPage';
import CustomsBookingDetailsPage from './pages/CustomsBookingDetailsPage';
import SeaBookingDetailsPage from './pages/SeaBookingDetailsPage';
import TruckBookingDetailsPage from './pages/TruckBookingDetailsPage';
import LCLBookingDetailsPage from './pages/LCLBookingDetailsPage';
import FirstLastMileBookingDetailsPage from './pages/FirstLastMileBookingDetailsPage';

// Insurance related pages and form
import InsuranceResultsPage from './pages/InsuranceResultsPage';
import InsuranceBookingDetailsPage from './pages/InsuranceBookingDetailsPage';
import InsuranceQuoteForm from './components/QuoteForms/InsuranceQuoteForm';

// First/Last Mile related pages and form
import FirstLastMileResultsPage from './pages/FirstLastMileResultsPage';
import FirstLastMileQuoteForm from './components/QuoteForms/FirstLastMileQuoteForm';

// Voice Assistant - This is the one we are keeping
import VoiceAssistant from './components/VoiceAssistant';
import { ParsedVoiceCommand } from './types/QuoteFormHandle';
import type { QuoteFormHandle } from './types/QuoteFormHandle';
// import FloatingChatbot from './components/FloatingChatbot'; // Removed this import

// NEW IMPORTS for Train Results and Details Pages
import TrainResultsPage from './pages/TrainResultsPage';
import RailServiceDetailsPage from './pages/RailServiceDetailsPage'; // Corrected path here
import RailBookingConfirmationPage from './pages/RailBookingConfirmationPage'; // NEW IMPORT for the KYC page


// Declare global variables for TypeScript
declare const __firebase_config: string | undefined;
declare const __initial_auth_token: string | undefined;


// This component wraps the form and button logic for insurance
const InsuranceQuoteFormPageWrapper: React.FC = () => {
  const insuranceFormRef = useRef<QuoteFormHandle>(null);
  const navigate = useNavigate();

  const handleSubmitInsurance = () => {
    if (insuranceFormRef.current) {
      const data = insuranceFormRef.current.submit();
      if (data && data.bookingType === 'Insurance') {
        navigate('/insurance-results', { state: { formData: data } });
      } else {
        console.warn("Form data is not of type InsuranceFormData or is null:", data);
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
        <button
          onClick={handleSubmitInsurance}
          className="px-8 py-4 bg-green-600 text-white font-bold text-xl rounded-xl shadow-lg hover:bg-green-700 transition duration-300 transform hover:scale-105"
        >
          Search Insurance Policies
        </button>
      </div>
    </div>
  );
};

// This component wraps the form and button logic for First/Last Mile
const FirstLastMileQuoteFormPageWrapper: React.FC = () => {
  const firstLastMileFormRef = useRef<QuoteFormHandle>(null);
  const navigate = useNavigate();

  const handleSubmitFirstLastMile = () => {
    if (firstLastMileFormRef.current) {
      const data = firstLastMileFormRef.current.submit();
      if (data && data.bookingType === 'First/Last Mile') {
        navigate('/first-last-mile-results', { state: { formData: data } });
      } else {
        console.warn("Form data is not of type FirstLastMileFormData or is null:", data);
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
        <button
          onClick={handleSubmitFirstLastMile}
          className="px-8 py-4 bg-purple-600 text-white font-bold text-xl rounded-xl shadow-lg hover:bg-purple-700 transition duration-300 transform hover:scale-105"
        >
          Search First/Last Mile Services
        </button>
      </div>
    </div>
  );
};


// AppContent component to use useNavigate and useLocation hooks (extracted to manage hooks)
const AppContent: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // State to track Firebase initialization
  const [firebaseInitialized, setFirebaseInitialized] = useState(false);
  // State to hold the prefill data from voice commands
  const [voicePrefillData, setVoicePrefillData] = useState<ParsedVoiceCommand | undefined>(undefined);

  useEffect(() => {
    setFirebaseInitialized(true);

    const initializeAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
          console.log("Signed in with custom token.");
        } else {
          // If no custom token, proceed without explicit Firebase sign-in log.
        }
      } catch (error) {
        console.error("Firebase authentication error:", error);
      }
    };

    initializeAuth();
  }, []);

  // Function to handle parsed voice commands
  const handleVoiceCommand = (command: ParsedVoiceCommand) => {
    console.log('Voice Command Received in App:', command);

    const updatedCommand: ParsedVoiceCommand = { ...command };

    if (updatedCommand.service === 'Air' && !updatedCommand.activityType) {
      const lowerCommandText = JSON.stringify(updatedCommand).toLowerCase();

      if (lowerCommandText.includes('airport to airport') || lowerCommandText.includes('a to a')) {
        updatedCommand.activityType = 'Airport to Airport';
      } else if (lowerCommandText.includes('airport to door') || lowerCommandText.includes('a to d')) {
        updatedCommand.activityType = 'Airport to Door';
      } else if (lowerCommandText.includes('door to airport') || lowerCommandText.includes('d to a')) {
        updatedCommand.activityType = 'Door to Airport';
      } else if (lowerCommandText.includes('door to door') || lowerCommandText.includes('d to d')) {
        updatedCommand.activityType = 'Door to Door';
      }
    }

    // Always set prefill data. It will be picked up by the relevant page.
    setVoicePrefillData(updatedCommand);

    let targetPath: string | undefined;
    switch (updatedCommand.service) {
      case 'Truck':
        targetPath = '/truck-booking';
        break;
      case 'Air':
        targetPath = '/air-booking';
        break;
      case 'Sea':
        targetPath = '/sea-booking';
        break;
      case 'Train Container Booking':
      case 'Train Goods Booking':
      case 'Train Parcel Booking':
      case 'Rail':
        targetPath = '/train-booking';
        break;
      case 'Parcel':
        targetPath = '/parcel-booking';
        break;
      case 'Customs':
        targetPath = '/customs-booking';
        break;
      case 'Insurance':
        targetPath = '/insurance-booking';
        break;
      case 'First/Last Mile':
        targetPath = '/first-last-mile-booking';
        break;
      case 'Door to Door':
        targetPath = '/door-to-door-booking';
        break;
      case 'LCL':
        targetPath = '/lcl-booking';
        break;
      case 'Track':
        if (updatedCommand.shipmentId) {
          targetPath = `/track?id=${updatedCommand.shipmentId}`;
        } else {
          targetPath = '/track';
        }
        break;
      case 'unknown':
      default:
        console.warn('Unknown or unhandled voice command service:', updatedCommand.service);
        return;
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

  console.log("App component is rendering.");
  console.log("Routes component is being evaluated.");

  return (
    <div className="App flex flex-col min-h-screen">
      <Header />

      {/* Main content area - only contains Routes, no other elements */}
      <main className="flex-grow w-full">
        <Routes>
          {/* My Wallet Route - Moved to top for priority matching */}
          <Route path="/my-wallet" element={<div className="max-w-7xl mx-auto px-4 py-10"><MyWalletPage /></div>} />

          {/* Home Page now renders all its sections internally */}
          <Route path="/" element={<HomeLandingPage prefillData={voicePrefillData} />} />

          {/* TEMP TEST ROUTE - FOR DEBUGGING ONLY */}
          <Route path="/test-route" element={
            <div className="max-w-7xl mx-auto px-4 py-20 text-center text-3xl font-semibold text-green-700">
              Test Route Working!
            </div>
          } />

          {/* General Pages */}
          <Route path="/aboutus" element={<AboutUsPage />} />
          <Route path="/investors" element={<div className="max-w-7xl mx-auto px-4 py-10"><InvestorLandingPage /></div>} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/support" element={<div className='max-w-7xl mx-auto px-4 py-10'><SupportPage /></div>} />
          <Route path="/track" element={<div className="max-w-7xl mx-auto px-4 py-10"><TrackPage /></div>} />
          <Route path="/offers" element={<div className="max-w-7xl mx-auto px-4 py-10"><OfferDetailPage /></div>} />

          {/* ROUTES FOR FOOTER LINKS - About Us Section */}
          <Route path="/careers" element={<CareersPage />} />
          <Route path="/media" element={<MediaPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/blog/:id" element={<div><h1 className="text-center text-3xl font-bold mt-10">Blog Post Detail</h1><p className="text-center text-gray-600 mt-4">This page will show a detailed blog post.</p></div>} />

          {/* ROUTES FOR FOOTER LINKS - Legal Section */}
          <Route path="/terms" element={<TermsOfUsePage />} />
          <Route path="/privacy" element={<PrivacyPolicyPage />} />
          <Route path="/cookies" element={<CookiePolicyPage />} />

          {/* ROUTES for Service Detail Pages */}
          <Route path="/door-to-door-details" element={<DoorToDoorDetailPage />} />
          <Route path="/truck-details" element={<TruckDetailPage />} />
          <Route path="/rail-details" element={<RailDetailPage />} />
          <Route path="/air-details" element={<AirDetailPage />} />
          <Route path="/sea-details" element={<SeaDetailPage />} />
          <Route path="/cargo-insurance-details" element={<CargoInsuranceDetailPage />} />
          <Route path="/customs-details" element={<CustomsDetailPage />} />
          <Route path="/lcl-details" element={<LCLDetailPage />} />
          <Route path="/parcel-details" element={<ParcelDetailPage />} />

          {/* NEW ROUTE FOR GENERAL INTERNATIONAL BOOKING */}
          <Route path="/international-booking" element={<div className="max-w-4xl mx-auto py-10"><QuoteFormPage activeService="Door to Door" prefillData={voicePrefillData} /></div>} />


          {/* Individual Booking Forms using QuoteFormPage */}
          <Route path="/truck-booking" element={<div className="max-w-4xl mx-auto py-10"><QuoteFormPage activeService="Truck" prefillData={voicePrefillData} /></div>} />
          <Route path="/air-booking" element={<div className="max-w-4xl mx-auto py-10"><QuoteFormPage activeService="Air" prefillData={voicePrefillData} /></div>} />
          <Route path="/sea-booking" element={<div className="max-w-4xl mx-auto py-10"><QuoteFormPage activeService="Sea" prefillData={voicePrefillData} /></div>} />
          <Route path="/parcel-booking" element={<div className="max-w-4xl mx-auto py-10"><QuoteFormPage activeService="Parcel" prefillData={voicePrefillData} /></div>} />
          <Route path="/door-to-door-booking" element={<div className="max-w-4xl mx-auto py-10"><QuoteFormPage activeService="Door to Door" prefillData={voicePrefillData} /></div>} />
          <Route path="/lcl-booking" element={<div className="max-w-4xl mx-auto px-4 py-10"><QuoteFormPage activeService="LCL" prefillData={voicePrefillData} /></div>} />
          <Route path="/customs-booking" element={<div className="max-w-4xl mx-auto px-4 py-10"><QuoteFormPage activeService="Customs" prefillData={voicePrefillData} /></div>} />


          {/* Train Booking Flow - Form Page */}
          <Route path="/train-booking" element={<div className="max-w-4xl mx-auto py-10"><RailQuoteForm initialActiveService="container" prefillData={voicePrefillData} /></div>} />

          {/* NEW Train Booking Flow - Results Page */}
          <Route path="/train-results" element={<TrainResultsPage />} />

          {/* NEW Train Booking Flow - Service Details Page */}
          <Route path="/train-service-details" element={<RailServiceDetailsPage />} />

          {/* NEW Train Booking Flow - KYC/Booking Confirmation Page (now a full page) */}
          <Route path="/rail-booking-confirmation" element={<RailBookingConfirmationPage />} />


          {/* Insurance Booking Flow - Using the wrapper */}
          <Route path="/insurance-booking" element={<InsuranceQuoteFormPageWrapper />} />
          <Route path="/insurance-results" element={<InsuranceResultsPage />} />
          <Route path="/insurance-booking-details" element={<InsuranceBookingDetailsPage />} />

          {/* First/Last Mile Booking Flow - Using the wrapper */}
          <Route path="/first-last-mile-booking" element={<FirstLastMileQuoteFormPageWrapper />} />
          <Route path="/first-last-mile-results" element={<FirstLastMileResultsPage />} />
          <Route path="/first-last-mile-booking-details" element={<FirstLastMileBookingDetailsPage />} />

          {/* NEW PARCEL ROUTES */}
          <Route path="/parcel-results" element={<ParcelResultsPage />} />
          <Route path="/parcel-booking-details" element={<ParcelBookingDetailsPage />} />


          {/* Booking Summary & History */}
          <Route path="/booking-confirmation" element={<div className="max-w-7xl mx-auto px-4 py-10"><BookingConfirmationPage /></div>} />
          <Route path="/my-bookings" element={<div className="max-w-7xl mx-auto px-4 py-10"><BookingHistoryPage /></div>} />
          <Route path="/booking-summary" element={<div className="max-w-7xl mx-auto px-4 py-10"><BookingSummaryPage /></div>} />
          <Route path="/booking" element={<div className="max-w-7xl mx-auto px-4 py-10"><BookingPage /></div>} />
          <Route path="/my-shipments" element={<div className="max-w-7xl mx-auto px-4 py-10"><MyShipmentsPage /></div>} />
          <Route path="/profile" element={<div className="max-w-7xl mx-auto px-4 py-10"><ProfilePage /></div>} />
          <Route path="/dashboard" element={<div className="max-w-7xl mx-auto px-4 py-10"><DashboardPage /></div>} />


          {/* Auth */}
          <Route path="/login" element={<div className="max-w-7xl mx-auto px-4 py-10"><LoginPage /></div>} />
          <Route path="/signup" element={<div className="max-w-7xl mx-auto px-4 py-10"><SignupPage /></div>} />

          {/* Results Pages (if not handled by generic QuoteFormPage flow) */}
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


          {/* 404 fallback */}
          <Route path="*" element={
            <div className="max-w-7xl mx-auto px-4 py-20 text-center text-3xl font-semibold text-gray-700">
              404 - Page Not Found
            </div>
          } />
        </Routes>
      </main>

      <Footer />
      {/* <FloatingChatbot /> Removed the FloatingChatbot component */}
      {/* Voice Assistant component, always rendered */}
      <VoiceAssistant onCommandParsed={handleVoiceCommand} />
    </div>
  );
};

// Main App component responsible for routing (keeps AppContent clean for hooks)
function App() {
  return (
    <Router basename="/">
      <AppContent />
    </Router>
  );
}

export default App;
