import React from 'react';
import { jsPDF } from 'jspdf';
import type { QuoteFormData } from '../types/QuoteData';

interface Props {
  booking: QuoteFormData;
}

const BookingCard: React.FC<Props> = ({ booking }) => {
  const handleDownload = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Shippitin Booking Summary', 20, 20);
    doc.setFontSize(12);

    const lines = [
      `From: ${booking.from}`,
      `To: ${booking.to}`,
      `Date: ${booking.date}`,
      `Weight: ${booking.weight} kg`,
      `Mode: ${booking.mode}`,
      `Base Rate: ₹${booking.baseRate?.toFixed(2)}`,
      `Weight Charge: ₹${booking.weightCharge?.toFixed(2)}`,
      `Service Charge: ₹${booking.serviceCharge?.toFixed(2)}`,
      `Insurance: ₹${booking.insurance?.toFixed(2)}`,
      `Taxes: ₹${booking.taxes?.toFixed(2)}`,
      `Total: ₹${booking.total?.toFixed(2)}`,
    ];

    lines.forEach((line, i) => {
      doc.text(line, 20, 40 + i * 10);
    });

    doc.save(`${booking.bookingId ?? 'booking'}_summary.pdf`);
  };

  const handleTrack = () => {
    window.location.href = `/track?bookingId=${booking.bookingId ?? ''}`;
  };

  return (
    <div className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-gray-800">
        <p><span className="font-semibold">From:</span> {booking.from}</p>
        <p><span className="font-semibold">To:</span> {booking.to}</p>
        <p><span className="font-semibold">Date:</span> {booking.date}</p>
        <p><span className="font-semibold">Weight:</span> {booking.weight} kg</p>
        <p><span className="font-semibold">Mode:</span> {booking.mode}</p>
        <p className="text-green-700 font-bold">
          ₹ {booking.total?.toFixed(2)}
        </p>
      </div>

      <div className="flex flex-wrap gap-2 mt-4">
        <button
          onClick={handleDownload}
          className="px-4 py-1.5 rounded bg-gray-600 hover:bg-gray-700 text-white text-sm"
        >
          📄 Download Summary
        </button>
        <button
          onClick={handleTrack}
          className="px-4 py-1.5 rounded bg-blue-600 hover:bg-blue-700 text-white text-sm"
        >
          🚚 Track Shipment
        </button>
      </div>
    </div>
  );
};

export default BookingCard;