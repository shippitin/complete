// src/components/TruckBookingConfirmationModal.tsx
import React from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // ✅ Add this line
import { useNavigate } from 'react-router-dom';
import { saveTruckBookingToFirebase } from '../services/saveTruckBookings';
import type { TruckBookingData } from '../types/TruckBookingData';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  data: TruckBookingData;
};

const TruckBookingConfirmationModal: React.FC<Props> = ({ isOpen, onClose, data }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const generateBookingID = () => `TRUCK-${Date.now().toString().slice(-6)}`;

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Truck Booking Summary', 14, 20);

    autoTable(doc, {
      startY: 30,
      head: [['Field', 'Value']],
      body: [
        ['Pickup Location', data.pickupLocation],
        ['Delivery Location', data.deliveryLocation],
        ['Truck Type', data.truckType],
        ['Goods Type', data.goodsType],
        ['Weight', data.weight],
        ['Dimensions', data.dimensions],
        ['Additional Info', data.additionalInfo || 'N/A'],
      ],
    });

    doc.save('truck-booking-summary.pdf');
  };

  const handleSave = async () => {
    const bookingId = generateBookingID();
    const finalData = { ...data, bookingId, createdAt: new Date().toISOString() };

    try {
      await saveTruckBookingToFirebase(finalData);
      toast.success('✅ Booking saved to Firebase!');
      navigate('/bookings');
    } catch (err) {
      console.error('Error saving booking:', err);
      toast.error('❌ Failed to save booking.');
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-8 rounded-md shadow-lg w-full max-w-lg">
        <h2 className="text-2xl font-bold text-center mb-4">Truck Booking Summary</h2>
        <div className="grid grid-cols-2 gap-4 text-sm text-gray-700 mb-6">
          <div>Pickup Location:</div><div>{data.pickupLocation}</div>
          <div>Delivery Location:</div><div>{data.deliveryLocation}</div>
          <div>Truck Type:</div><div>{data.truckType}</div>
          <div>Goods Type:</div><div>{data.goodsType}</div>
          <div>Weight:</div><div>{data.weight}</div>
          <div>Dimensions:</div><div>{data.dimensions}</div>
          <div>Additional Info:</div><div>{data.additionalInfo || 'N/A'}</div>
        </div>
        <div className="flex justify-end space-x-3">
          <button onClick={handleDownloadPDF} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            Download PDF
          </button>
          <button onClick={handleSave} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
            Save to Firebase
          </button>
          <button onClick={onClose} className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default TruckBookingConfirmationModal;
