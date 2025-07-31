// src/components/QuoteForm.tsx
import React from "react";
import type { ShipmentMode } from "../types/QuoteFormData";

interface QuoteFormProps {
  mode: ShipmentMode;
}

const QuoteForm: React.FC<QuoteFormProps> = ({ mode }) => {
  return (
    <form className="space-y-4">
      <p className="font-semibold text-purple-700">Selected Mode: <span className="text-black">{mode}</span></p>
      <button
        type="submit"
        className="w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700"
      >
        Get Quote
      </button>
    </form>
  );
};

export default QuoteForm;