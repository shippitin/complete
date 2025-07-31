// src/components/QuoteFormShippitin.tsx
import React, { useRef } from "react";
// Import our main RailQuoteForm component
import RailQuoteForm from "./QuoteForms/RailQuoteForm";
// Import the QuoteFormHandle type
import type { QuoteFormHandle, ParsedVoiceCommand } from "../types/QuoteFormHandle";

interface QuoteFormShippitinProps {
  activeService: string;
  // We might need to pass prefillData down if the homepage ever gets it from voice commands
  prefillData?: ParsedVoiceCommand;
}

const QuoteFormShippitin: React.FC<QuoteFormShippitinProps> = ({ activeService, prefillData }) => {
  // Use a ref to access the submit method of RailQuoteForm
  const railFormRef = useRef<QuoteFormHandle>(null);

  // Function to handle the search button click for RailQuoteForm
  const handleSubmitRail = () => {
    if (railFormRef.current) {
      const data = railFormRef.current.submit();
      if (data) {
        console.log("Rail Form Submitted from HomePage:", data);
        // RailQuoteForm itself will now handle showing results or errors internally
      } else {
        console.warn("Rail Form data is null or invalid from HomePage.");
      }
    }
  };

  if (activeService === "train" || activeService === "rail") { // Added "rail" for flexibility
    return (
      <div className="mt-6">
        {/* Render RailQuoteForm and pass the ref and prefillData */}
        <RailQuoteForm ref={railFormRef} initialActiveService="container" prefillData={prefillData} />
        <div className="flex justify-center mt-8">
          {/* The search button for RailQuoteForm */}
          <button
            onClick={handleSubmitRail}
            className="px-8 py-4 bg-blue-600 text-white font-bold text-xl rounded-xl shadow-lg hover:bg-blue-700 transition duration-300 transform hover:scale-105"
          >
            Search Train Options
          </button>
        </div>
      </div>
    );
  }

  // Placeholder for other services if they were to use this generic component
  // For now, it just shows a message
  return (
    <div className="text-center py-12 text-gray-500 font-medium">
      No form available for the selected service.
    </div>
  );
};

export default QuoteFormShippitin;
