// src/pages/RailServiceDetailsPage.tsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaCheckCircle, FaInfoCircle, FaUser, FaArrowRight, FaEnvelope, FaPhone, FaBuilding, FaFileAlt, FaClipboardList, FaShieldAlt, FaRupeeSign, FaTrain, FaCube, FaBoxOpen, FaTimesCircle, FaCreditCard, FaMoneyBillWave, FaArrowLeft } from 'react-icons/fa';
// IMPORTANT: Ensure all necessary form data types are imported from QuoteFormHandle
import type { AllFormData, TrainContainerFormData, TrainGoodsFormData, TrainParcelFormData, FreightTrainResult } from '../types/QuoteFormHandle';

const RailServiceDetailsPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [formData, setFormData] = useState<AllFormData | null>(null);
  const [selectedTrainResult, setSelectedTrainResult] = useState<FreightTrainResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for Add-on Options (Insurance only, initially from formData)
  const [insuranceRequired, setInsuranceRequired] = useState<boolean>(false); // Will be set from formData

  useEffect(() => {
    // Retrieve formData and selectedTrainResult from location state
    const state = location.state as { formData: AllFormData; selectedTrainResult: FreightTrainResult } | undefined;
    if (state && state.formData && state.selectedTrainResult) {
      setFormData(state.formData);
      setSelectedTrainResult(state.selectedTrainResult);
      // Ensure insuranceRequired is safely accessed, as it might not be on all form types
      if ('insuranceRequired' in state.formData) {
        setInsuranceRequired(state.formData.insuranceRequired || false);
      } else {
        setInsuranceRequired(false); // Default to false if not present
      }
      setLoading(false);
    } else {
      setError("No service details provided. Please go back to search results.");
      setLoading(false);
    }
  }, [location.state]);

  // Helper function to render a detail row with label and value
  // Modified DetailRow to ensure better alignment and readability
  const DetailRow: React.FC<{ label: string; value: string | number | boolean | undefined; span?: number }> = ({ label, value, span }) => (
    <div className={`${span ? `lg:col-span-${span}` : ''} flex flex-col sm:flex-row sm:items-baseline sm:justify-between`}>
      <span className="font-semibold text-gray-700 text-base sm:w-1/2 flex-shrink-0">{label}:</span>
      <span className="text-gray-800 font-medium text-base sm:w-1/2 text-left sm:text-right ml-0 sm:ml-2 mt-1 sm:mt-0 break-words">
        {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : (value || 'N/A')}
      </span>
    </div>
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="text-center p-10 bg-white rounded-2xl shadow-xl">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-6"></div>
          <p className="text-2xl text-gray-700 font-semibold">Loading service details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-100">
        <div className="max-w-md mx-auto px-6 py-12 bg-white shadow-2xl rounded-2xl border border-red-200 text-center">
          <h3 className="text-3xl font-extrabold text-red-600 mb-6">Oops! An Error Occurred</h3>
          <p className="text-gray-700 text-lg mb-8">{error}</p>
          <button
            onClick={() => navigate('/train-results')}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-full shadow-lg transition duration-300 transform hover:scale-105 flex items-center justify-center mx-auto"
          >
            <FaArrowLeft className="inline-block mr-3 text-xl" /> Go Back to Train Search Results
          </button>
        </div>
      </div>
    );
  }

  // Determine the title based on bookingType
  let title = "Service Details";
  if (formData) {
    switch (formData.bookingType) {
      case 'Train Container Booking':
        title = (formData as TrainContainerFormData).isDomestic ? "Domestic Container Service Details" : "International Container Service Details";
        break;
      case 'Train Goods Booking':
        title = "Goods Train Service Details";
        break;
      case 'Train Parcel Booking':
        title = "Parcel Train Service Details";
        break;
      default:
        break;
    }
  }

  // Determine main icon and color based on original booking type for the header
  const getMainIconAndColor = (type: string) => {
    switch (type) {
      case 'Train Goods Booking': return { icon: FaTrain, color: 'text-green-600' };
      case 'Train Container Booking': return { icon: FaCube, color: 'text-blue-600' };
      case 'Train Parcel Booking': return { icon: FaBoxOpen, color: 'text-purple-600' };
      default: return { icon: FaTrain, color: 'text-gray-600' };
    }
  };
  const { icon: MainIcon, color: mainColor } = getMainIconAndColor(formData ? formData.bookingType : '');


  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4 sm:px-6 lg:px-8 font-inter">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-8">
        {/* Left Column: Service Details Content */}
        <div className="w-full md:flex-grow">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
            {/* Back Button */}
            <button
              onClick={() => navigate('/train-results', { state: { formData: formData! } })}
              className="mb-8 flex items-center text-blue-600 hover:text-blue-800 font-medium transition duration-200 text-lg"
            >
              <FaArrowLeft className="mr-2 text-xl" /> Back to Search Results
            </button>

            <h3 className="text-3xl font-bold text-gray-800 mb-4 flex items-center">
              <MainIcon className={`${mainColor} mr-4 text-4xl`} /> {title}
            </h3>
            <p className="text-gray-700 text-lg mb-10">
              Review the details of your selected train service and fare options.
            </p>

            {/* Selected Train Details Section */}
            <div className="bg-blue-50 p-8 rounded-2xl border border-blue-200 shadow-md mb-10">
              <h2 className="text-2xl font-bold text-blue-800 mb-6 flex items-center">
                <FaTrain className="text-blue-600 mr-3 text-3xl" /> Train Service Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-gray-700 text-lg">
                <div className="flex justify-between">
                  <span className="font-semibold">Service Name:</span> <span className="text-right">{selectedTrainResult!.serviceName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Train ID:</span> <span className="text-right">{selectedTrainResult!.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Operator:</span> <span className="text-right">{selectedTrainResult!.operator}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Origin:</span> <span className="text-right">{selectedTrainResult!.originStation}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Destination:</span> <span className="text-right">{selectedTrainResult!.destinationStation}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Transit Duration:</span> <span className="text-right">{selectedTrainResult!.transitDuration}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Available Capacity:</span> <span className="text-right">{selectedTrainResult!.availableCapacity}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-semibold">Cargo Type:</span> <span className="text-right">{selectedTrainResult!.cargoType || 'N/A'}</span>
                </div>
                <div className="flex justify-between md:col-span-2">
                  <span className="font-semibold">Hazardous Compatible:</span>
                  <span className="text-right">
                    {selectedTrainResult!.isHazardousCompatible ? (
                      <FaCheckCircle className="inline-block text-green-500 text-xl ml-2" />
                    ) : (
                      <FaTimesCircle className="inline-block text-red-500 text-xl ml-2" />
                    )}
                  </span>
                </div>
                <div className="md:col-span-2">
                  <span className="font-semibold">Features:</span> <span className="text-right">{selectedTrainResult!.features.join(', ') || 'N/A'}</span>
                </div>
                <div className="md:col-span-2 text-3xl font-extrabold text-blue-700 flex items-center justify-end mt-4">
                  <FaRupeeSign className="text-2xl mr-1" />{selectedTrainResult!.price.toLocaleString('en-IN')}
                </div>
              </div>
            </div>

            {/* Original Quote Details Section (from initial form) - ALIGNMENT FIX APPLIED HERE */}
            <div className="bg-gray-50 p-8 rounded-2xl border border-gray-200 shadow-md mb-10">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                <FaClipboardList className="text-gray-600 mr-3 text-3xl" /> Your Original Quote Details
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4 text-lg">
                <DetailRow label="Origin" value={formData!.originStation} />
                <DetailRow label="Destination" value={formData!.destinationStation} />
                <DetailRow label="Ready Date" value={formData!.readyDate} />
                <DetailRow label="Cargo Type" value={formData!.cargoType || 'N/A'} />
                <DetailRow label="Weight" value={formData!.totalWeight ? `${formData!.totalWeight} ${formData!.bookingType === 'Train Goods Booking' ? 'Tons' : 'KG'}` : 'N/A'} />
                <DetailRow label="Dimensions" value={formData!.dimensions || 'N/A'} />

                {/* Use type guards for specific properties */}
                {formData!.bookingType === 'Train Container Booking' && (
                  <>
                    <DetailRow label="Container Type" value={(formData as TrainContainerFormData).containerType} />
                    <DetailRow label="No. of Containers" value={(formData as TrainContainerFormData).numberOfContainers} />
                    <DetailRow label="Domestic Booking" value={(formData as TrainContainerFormData).isDomestic} />
                    {'customsClearanceRequired' in formData && typeof (formData as TrainContainerFormData).customsClearanceRequired === 'boolean' && (
                      <DetailRow label="Customs Clearance" value={(formData as TrainContainerFormData).customsClearanceRequired} />
                    )}
                    {'volumetricWeight' in formData && (formData as TrainContainerFormData).volumetricWeight && (
                      <DetailRow label="Volumetric Weight" value={`${(formData as TrainContainerFormData).volumetricWeight} KG`} />
                    )}
                  </>
                )}
                {formData!.bookingType === 'Train Goods Booking' && (
                  <>
                    <DetailRow label="No. of Wagons" value={(formData as TrainGoodsFormData).numberOfWagons} />
                    <DetailRow label="Wagon Type" value={(formData as TrainGoodsFormData).wagonType} />
                    {'wagonCode' in formData && (formData as TrainGoodsFormData).wagonCode && (
                      <DetailRow label="Wagon Code" value={(formData as TrainGoodsFormData).wagonCode} />
                    )}
                  </>
                )}
                {formData!.bookingType === 'Train Parcel Booking' && (
                  <>
                    <DetailRow label="Parcel Count" value={(formData as TrainParcelFormData).parcelCount} />
                  </>
                )}
                <DetailRow label="Hazardous Cargo" value={formData!.hazardousCargo} />
                <DetailRow label="Incoterms" value={formData!.incoterms || 'N/A'} />
                {/* Special handling for Cargo Value to ensure currency formatting */}
                <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between lg:col-span-3">
                  <span className="font-semibold text-gray-700 text-base sm:w-1/2 flex-shrink-0">Cargo Value:</span>
                  <span className="text-gray-800 font-medium text-base sm:w-1/2 text-left sm:text-right ml-0 sm:ml-2 mt-1 sm:mt-0 break-words">
                    INR {formData!.cargoValue ? formData!.cargoValue.toLocaleString('en-IN') : 'N/A'}
                  </span>
                </div>
                <DetailRow label="Description" value={formData!.detailedDescriptionOfGoods || 'N/A'} span={3} />
                <DetailRow label="HS Code" value={formData!.hsCode || 'N/A'} span={3} />
                <DetailRow label="Special Instructions" value={formData!.specialInstructions || 'N/A'} span={3} />
              </div>
            </div>

            {/* Add-on Options (Insurance) */}
            <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <FaShieldAlt className="text-blue-500 mr-3 text-3xl" /> Additional Services
            </h3>
            <div className="bg-white rounded-xl shadow-md border border-gray-100 p-8 mb-10">
              <div className="mb-4">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={insuranceRequired}
                    onChange={(e) => setInsuranceRequired(e.target.checked)}
                    className="form-checkbox h-6 w-6 text-blue-600 rounded mr-4"
                  />
                  <span className="text-xl font-semibold text-gray-800">
                    Cargo Insurance Required (Optional)
                  </span>
                </label>
                <p className="text-base text-gray-500 mt-2 ml-10">
                  Protect your cargo against loss or damage during transit.
                </p>
              </div>
            </div>

            <div className="flex justify-center mt-10">
              <button
                onClick={() => navigate('/rail-booking-confirmation', {
                  state: {
                    formData: formData!,
                    selectedTrainResult: selectedTrainResult!,
                    initialInsuranceRequired: insuranceRequired
                  }
                })}
                className="bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white font-bold py-4 px-12 rounded-full shadow-lg text-2xl transition duration-300 transform hover:scale-105 flex items-center"
              >
                Proceed to Book <FaArrowRight className="ml-3 text-2xl" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary (Fixed Position) */}
        <div className="w-full md:w-80 lg:w-96 flex-shrink-0">
          <div className="sticky top-10 bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 pb-3 border-b border-gray-200">Order Summary</h3>
            <div className="text-gray-700 text-lg">
              {/* Base Price */}
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center">
                  <FaRupeeSign className="text-blue-500 mr-2 text-base" />
                  <span className="text-lg">Base Price:</span>
                </div>
                <span className="font-semibold text-lg whitespace-nowrap">INR {selectedTrainResult!.price.toLocaleString('en-IN')}</span>
              </div>
              {/* Insurance */}
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center">
                  <FaRupeeSign className="text-blue-500 mr-2 text-base" />
                  <span className="text-lg">Insurance:</span>
                </div>
                <span className="font-semibold text-lg whitespace-nowrap">
                  {insuranceRequired ? `INR ${(selectedTrainResult!.price ? selectedTrainResult!.price * 0.01 : 0).toLocaleString('en-IN')}` : 'N/A'}
                </span>
              </div>
              {/* Total Amount */}
              <div className="border-t border-gray-300 pt-4 mt-4 flex justify-between items-baseline text-2xl font-bold text-blue-700">
                <span className="flex-grow">Total Amount:</span>
                <span className="text-right whitespace-nowrap flex-shrink-0">
                  INR {selectedTrainResult!.price ? (
                    selectedTrainResult!.price +
                    (insuranceRequired && selectedTrainResult!.price ? selectedTrainResult!.price * 0.01 : 0)
                  ).toLocaleString('en-IN') : 'N/A'}
                </span>
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-6">
              *Prices are indicative and subject to change based on final booking details.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RailServiceDetailsPage;
