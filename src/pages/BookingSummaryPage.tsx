// src/pages/BookingSummaryPage.tsx
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

interface BookingData {
  shipmentType: string;
  from: string;
  to: string;
  pickup: string;
  delivery: string;
  containerCounts: { [key: string]: number };
  weight: number;
  commodity: string;
  date: string;
  service: string;
  isInternational: boolean;
}

const containerRates: Record<string, number> = {
  "20 ft Standard": 1000,
  "20 ft High Cube": 1200,
  "22 ft High Cube": 1300,
  "40 ft Standard": 2000,
  "40 ft High Cube": 2200,
  "45 ft High Cube": 2500,
  "20 ft High Cube Reefer": 3000,
  "40 ft High Cube Reefer": 3500,
};

const stuffingFees: Record<string, number> = {
  "Factory Stuffing - Factory Destuffing": 100,
  "Factory Stuffing - Terminal Destuffing": 80,
  "Terminal Stuffing - Factory Destuffing": 90,
  "Terminal Stuffing - Terminal Destuffing": 70,
};

const BookingSummaryPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const data = location.state as BookingData | undefined;

  if (!data) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-xl font-semibold mb-2">No booking data found.</h2>
        <button
          onClick={() => navigate("/booking")}
          className="bg-brand-gradient text-white px-4 py-2 rounded"
        >
          Go to Booking
        </button>
      </div>
    );
  }

  const calculateTotal = () => {
    let total = 0;

    // Base container pricing
    for (const [type, count] of Object.entries(data.containerCounts)) {
      total += (containerRates[type] || 0) * count;
    }

    // Weight surcharge
    total += (data.weight / 1000) * 50;

    // International surcharge
    if (data.isInternational) {
      total *= 1.25;
    }

    // Stuffing fee
    total += stuffingFees[data.service] || 0;

    return total.toFixed(2);
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-bold mb-6">Booking Summary</h1>
      <div className="grid grid-cols-2 gap-4">
        <p><strong>Mode:</strong> {data.shipmentType}</p>
        <p><strong>Shipment:</strong> {data.isInternational ? "International" : "Domestic"}</p>
        <p><strong>Start Location:</strong> {data.from}</p>
        <p><strong>Destination:</strong> {data.to}</p>
        <p><strong>Pickup:</strong> {data.pickup}</p>
        <p><strong>Delivery:</strong> {data.delivery}</p>
        <p><strong>Departure:</strong> {data.date}</p>
        <p><strong>Service:</strong> {data.service}</p>
        <p><strong>Commodity:</strong> {data.commodity}</p>
        <p><strong>Weight:</strong> {data.weight} kg</p>
      </div>

      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-2">Containers</h2>
        {Object.entries(data.containerCounts).map(([type, count]) =>
          count > 0 ? (
            <p key={type}>
              {type}: {count} × ₹{containerRates[type] || 0}
            </p>
          ) : null
        )}
      </div>

      <div className="mt-4">
        <p><strong>Weight Surcharge:</strong> ₹{(data.weight / 1000 * 50).toFixed(2)}</p>
        <p><strong>Stuffing/Destuffing Fee:</strong> ₹{stuffingFees[data.service] || 0}</p>
        {data.isInternational && <p><strong>International Surcharge:</strong> 25%</p>}
      </div>

      <div className="mt-6 text-lg font-bold">
        Total Estimated Price: ₹{calculateTotal()}
      </div>
    </div>
  );
};

export default BookingSummaryPage;