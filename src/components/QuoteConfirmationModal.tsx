import React from "react";
import type { QuoteFormData } from "../types/QuoteFormData";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  formData: QuoteFormData;
}

const QuoteConfirmationModal: React.FC<Props> = ({ isOpen, onClose, formData }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded shadow max-w-md w-full">
        <h2 className="text-lg font-semibold text-purple-800 mb-4">Booking Summary</h2>
        <p><strong>From:</strong> {formData.origin.country}, {formData.origin.cityOrZip}</p>
        <p><strong>To:</strong> {formData.destination.country}, {formData.destination.cityOrZip}</p>
        <p><strong>Mode:</strong> {formData.shipmentMode}</p>
        <p><strong>Goods Value:</strong> {formData.goods.value} {formData.goods.currency}</p>
        <div className="mt-4 flex justify-end">
          <button className="text-purple-700 mr-4" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default QuoteConfirmationModal;