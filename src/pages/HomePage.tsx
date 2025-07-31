// src/pages/HomePage.tsx

import React from "react";
import { Link } from 'react-router-dom'; // Import Link for navigation
import type { ParsedVoiceCommand } from '../types/QuoteFormHandle'; // Import ParsedVoiceCommand

import HeroSection from '../components/HeroSection';
import OffersSection from '../components/OffersSection';
import WhyChooseUsSection from '../components/WhyChooseUsSection';
import HowItWorksSection from '../components/HowItWorksSection';
import TrustedPartnersSection from '../components/TrustedPartnersSection';
import CTASection from '../components/CTASection';
// QuickBookingSection is no longer needed here if HomePage directly renders the form
// import QuickBookingSection from '../components/QuickBookingSection'; // REMOVED

import ServiceIcons from '../components/ServiceIcons'; // ADDED
import QuoteFormShippitin from '../components/QuoteFormShippitin'; // ADDED

import AboutSection from '../components/HomeSections/AboutSection'; // ADDED
import ServicesSection from '../components/HomeSections/ServicesOverviewSection'; // ADDED
import CommitmentSection from '../components/HomeSections/CommitmentSection'; // ADDED
import ShowcaseSection from '../components/HomeSections/ShowcaseSection'; // ADDED

import { useTranslation } from 'react-i18next'; // ADDED
import { ServiceTypes } from '../types/ServiceTypes'; // ADDED

interface HomePageProps {
  prefillData?: ParsedVoiceCommand; // NEW PROP
}

const HomePage: React.FC<HomePageProps> = ({ prefillData }) => { // RECEIVE prefillData
  const { t } = useTranslation();
  const [activeService, setActiveService] = React.useState<ServiceTypes>('truck'); // State for ServiceIcons

  console.log("HomeLandingPage is rendering.");
  return (
    <>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20 text-center relative overflow-hidden">
        <div className="container mx-auto px-4 max-w-7xl relative z-10">
          <h1 className="text-5xl font-bold mb-4">{t('efficient_logistics_solutions')}</h1>
          <p className="text-xl mb-8">{t('welcome_to_platform')}</p>
        </div>
      </section>

      {/* Booking Service Icons */}
      <div className="relative z-20 -mt-20 px-4">
        <div className="container mx-auto max-w-5xl">
          <ServiceIcons
            activeService={activeService}
            onServiceChange={setActiveService}
          />
        </div>
      </div>

      {/* Booking Form Displayed Based on Active Service */}
      <div className="relative z-10 px-4 mt-6">
        <div className="container mx-auto max-w-5xl">
          {/* Pass prefillData to QuoteFormShippitin */}
          <QuoteFormShippitin activeService={activeService} prefillData={prefillData} />
        </div>
      </div>

      {/* Main Content Sections */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-10">
        <OffersSection />
        <WhyChooseUsSection />
        <HowItWorksSection />
        <TrustedPartnersSection />
        <CTASection />
        {/* Informational Sections - Ensure these are imported and used if desired */}
        <AboutSection />
        <ServicesSection />
        <CommitmentSection />
        <ShowcaseSection />
      </div>
    </>
  );
};

export default HomePage;
