// src/pages/ParcelBookingPage.tsx
import React from 'react';
import ParcelQuoteForm from '../components/QuoteForms/ParcelQuoteForm'; // Corrected import path and component name

const ParcelBookingPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* IMPORTANT: No <h1> or <h2> here. The title is handled by ParcelQuoteForm */}
      <ParcelQuoteForm />
    </div>
  );
};

export default ParcelBookingPage;
