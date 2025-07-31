// src/pages/SeaBookingPage.tsx
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import SeaQuoteForm from '../components/QuoteForms/SeaQuoteForm';
import { QuoteFormHandle, AllFormData, ParsedVoiceCommand, SeaFormData } from '../types/QuoteFormHandle'; // Import SeaFormData specifically
import { FaShip, FaBox, FaCheckCircle, FaChevronRight, FaChevronLeft } from 'react-icons/fa'; // Added FaBox import

const SeaBookingPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const seaFormRef = useRef<QuoteFormHandle>(null);

  // Define steps for the Sea booking process
  const steps = [
    { name: 'Shipment Details', icon: FaShip },
    { name: 'Cargo Details', icon: FaBox }, // Using FaBox for cargo details
    { name: 'Confirmation', icon: FaCheckCircle },
  ];

  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<AllFormData | null>(null);
  const [prefillData, setPrefillData] = useState<ParsedVoiceCommand | undefined>(undefined);

  // Effect to handle prefill data from navigation state (e.g., from voice assistant)
  useEffect(() => {
    if (location.state?.prefillData) {
      setPrefillData(location.state.prefillData as ParsedVoiceCommand);
      // If prefill data exists, we might want to automatically advance to the next step
      // or ensure the first step is fully populated. For now, we'll just pass it down.
    }
  }, [location.state?.prefillData]);

  const handleNext = async () => {
    if (seaFormRef.current) {
      const data = seaFormRef.current.submit();
      if (data) {
        // Ensure the submitted data is of type SeaFormData before setting it
        // This cast is safe because SeaQuoteForm's submit method is designed to return SeaFormData
        setFormData(data as SeaFormData);
        if (currentStep < steps.length - 1) {
          setCurrentStep(prev => prev + 1);
        } else {
          // Last step, submit the form and navigate to results
          navigate('/sea-results', { state: { formData: data } });
        }
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    } else {
      // If on the first step, navigate back to the home/quote selection page
      navigate('/');
    }
  };

  // Type guard to ensure formData is SeaFormData for confirmation display
  const isSeaFormData = (data: AllFormData | null): data is SeaFormData => {
    return data !== null && data.bookingType === 'Sea';
  };

  // Render content based on currentStep
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <SeaQuoteForm ref={seaFormRef} prefillData={prefillData} />
        );
      case 1:
        // For simplicity, we'll reuse SeaQuoteForm for now.
        // In a real app, you might have separate components for different steps
        // or a way for SeaQuoteForm to render specific sections based on a prop.
        // For this example, SeaQuoteForm is designed to handle all fields,
        // so we'll just let its validation handle missing fields for the "current step".
        return (
          <SeaQuoteForm ref={seaFormRef} prefillData={prefillData} />
        );
      case 2:
        return (
          <div className="p-6 bg-white rounded-xl shadow-md border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Confirm Your Sea Freight Details</h2>
            {isSeaFormData(formData) ? ( // Use the type guard here
              <div className="space-y-3 text-gray-700">
                <p><strong>Activity Type:</strong> {formData.activityType}</p>
                <p><strong>Shipment Mode:</strong> {formData.shipmentMode}</p>
                {formData.originCity && <p><strong>Origin City:</strong> {formData.originCity}</p>}
                {formData.originAddress && <p><strong>Origin Address:</strong> {formData.originAddress}</p>}
                {formData.originPort && <p><strong>Origin Port:</strong> {formData.originPort}</p>}
                {formData.destinationCity && <p><strong>Destination City:</strong> {formData.destinationCity}</p>}
                {formData.destinationAddress && <p><strong>Destination Address:</strong> {formData.destinationAddress}</p>}
                {formData.destinationPort && <p><strong>Destination Port:</strong> {formData.destinationPort}</p>}
                <p><strong>Ready Date:</strong> {formData.readyDate}</p>
                <p><strong>Total Weight:</strong> {formData.totalWeight} Kgs</p>
                {formData.shipmentMode === 'LCL' && (
                  <>
                    <p><strong>No. of Pieces:</strong> {formData.numberOfPieces}</p>
                    <p><strong>Volume (CBM):</strong> {formData.volumeCBM}</p>
                  </>
                )}
                {formData.shipmentMode === 'FCL' && (
                  <>
                    {formData.containerType && formData.numberOfContainers && (
                      <p><strong>Container:</strong> {formData.numberOfContainers} x {formData.containerType}</p>
                    )}
                    {formData.stuffingPoint && ( // Display stuffing point if available
                      <p><strong>Stuffing Point:</strong> {formData.stuffingPoint}</p>
                    )}
                  </>
                )}
                <p><strong>Commodity Category:</strong> {formData.commodityCategory}</p>
                <p><strong>Commodity:</strong> {formData.commodity}</p>
                {formData.hsnCode && <p><strong>HSN Code:</strong> {formData.hsnCode}</p>}
                {formData.dimensions && <p><strong>Dimensions:</strong> {formData.dimensions}</p>}
                {formData.cargoValue && <p><strong>Cargo Value:</strong> INR {formData.cargoValue.toLocaleString()}</p>}
                <p><strong>Hazardous Cargo:</strong> {formData.hazardousCargo ? 'Yes' : 'No'}</p>
                <p><strong>Insurance Required:</strong> {formData.insuranceRequired ? 'Yes' : 'No'}</p>
                {formData.incoterms && <p><strong>Incoterms:</strong> {formData.incoterms}</p>}
                {formData.description && <p><strong>Description:</strong> {formData.description}</p>}
              </div>
            ) : (
              <p className="text-gray-500">No data to confirm. Please go back and fill the form.</p>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 font-inter">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-extrabold text-blue-800 mb-8 text-center tracking-tight">
          Sea Freight Quote
        </h1>

        {/* Step Indicator */}
        <div className="flex justify-between items-center mb-8 bg-white p-4 rounded-xl shadow-md border border-gray-200">
          {steps.map((step, index) => (
            <div key={step.name} className="flex flex-col items-center flex-1">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-lg font-bold
                ${index === currentStep ? 'bg-blue-600 shadow-lg' : 'bg-gray-300'}
                ${index < currentStep ? 'bg-green-500' : ''} transition-all duration-300`}>
                {index < currentStep ? <FaCheckCircle /> : <step.icon />}
              </div>
              <p className={`mt-2 text-sm font-medium ${index === currentStep ? 'text-blue-600' : 'text-gray-500'}`}>
                {step.name}
              </p>
            </div>
          ))}
        </div>

        {/* Form Content */}
        {renderStepContent()}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          <button
            onClick={handleBack}
            className="flex items-center px-6 py-3 bg-gray-700 text-white font-semibold rounded-xl shadow-md
                       hover:bg-gray-800 transition-colors duration-300 transform hover:scale-105"
            disabled={currentStep === 0}
          >
            <FaChevronLeft className="mr-2" /> Back
          </button>
          <button
            onClick={handleNext}
            className="flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl shadow-md
                       hover:bg-blue-700 transition-colors duration-300 transform hover:scale-105"
          >
            {currentStep < steps.length - 1 ? 'Next Step' : 'Get Quote'} <FaChevronRight className="ml-2" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SeaBookingPage;
