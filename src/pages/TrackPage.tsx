import { useState } from "react";
import QRScanner from "../components/QRScanner"; // <-- Make sure this exists
import Map from "../components/Map"; // Your map component
import Timeline from "../components/Timeline"; // Your timeline component

const TrackPage = () => {
  const [bookingId, setBookingId] = useState<string>("");
  const [shipment, setShipment] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [scannerOpen, setScannerOpen] = useState(false);

  const fetchShipment = async () => {
    if (!bookingId.trim()) return;
    setLoading(true);
    setError(null);
    setShipment(null);

    try {
      const res = await fetch(`https://shippitin-backend.onrender.com/api/track/${bookingId}`);
      if (!res.ok) throw new Error("Shipment not found");
      const data = await res.json();
      setShipment(data);
    } catch (err) {
      setError("Unable to fetch tracking data. Please check Booking ID.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Shipment Tracking</h1>

      {/* Booking Input & Scan Button */}
      <div className="flex items-center gap-2 mb-4">
        <input
          type="text"
          value={bookingId}
          onChange={(e) => setBookingId(e.target.value)}
          placeholder="Enter Booking ID"
          className="border px-4 py-2 w-full rounded"
        />
        <button
          onClick={fetchShipment}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Track
        </button>
        <button
          onClick={() => setScannerOpen(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
        >
          Scan QR
        </button>
      </div>

      {/* QR Scanner */}
      {scannerOpen && (
        <QRScanner
          onScan={(value) => {
            setBookingId(value);
            setScannerOpen(false);
          }}
          onClose={() => setScannerOpen(false)}
        />
      )}

      {/* Status Output */}
      {loading && <p className="text-gray-600">Loading...</p>}
      {error && <p className="text-red-600">{error}</p>}
      {shipment && (
        <>
          <Map route={shipment.route} />
          <Timeline status={shipment.status} />
        </>
      )}
    </div>
  );
};

export default TrackPage;