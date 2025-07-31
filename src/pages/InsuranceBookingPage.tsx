// src/pages/InsuranceBookingPage.tsx
import React from 'react';
import InsuranceBookingForm from '../components/InsuranceBookingForm'; // Make sure path is correct

const InsuranceBookingPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* IMPORTANT: No <h1> or <h2> here. The title is handled by InsuranceBookingForm */}
      <InsuranceBookingForm />
    </div>
  );
};

export default InsuranceBookingPage;