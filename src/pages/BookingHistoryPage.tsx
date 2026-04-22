import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { bookingAPI } from '../services/api';
import { jsPDF } from 'jspdf';

interface Booking {
  id: string;
  booking_number: string;
  service_type: string;
  status: string;
  booking_date: string;
  estimated_price: number;
  origin: string;
  destination: string;
  cargo_type: string;
  weight: number;
}

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  let classes = 'px-3 py-1 text-xs font-bold rounded-full uppercase';
  switch (status.toLowerCase()) {
    case 'pending': classes += ' bg-yellow-100 text-yellow-800'; break;
    case 'confirmed': classes += ' bg-green-100 text-green-800'; break;
    case 'delivered': classes += ' bg-blue-100 text-blue-800'; break;
    case 'cancelled': classes += ' bg-red-100 text-red-800'; break;
    default: classes += ' bg-gray-100 text-gray-800';
  }
  return <span className={classes}>{status}</span>;
};

const BookingCard: React.FC<{ booking: Booking }> = ({ booking }) => {
  const navigate = useNavigate();

  const handleDownload = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text('Shippitin Booking Summary', 20, 20);
    doc.setFontSize(12);
    const lines = [
      `Booking ID: ${booking.booking_number}`,
      `Service: ${booking.service_type}`,
      `From: ${booking.origin}`,
      `To: ${booking.destination}`,
      `Date: ${new Date(booking.booking_date).toLocaleDateString('en-IN')}`,
      `Weight: ${booking.weight} kg`,
      `Cargo Type: ${booking.cargo_type}`,
      `Status: ${booking.status}`,
      `Amount: Rs ${(booking.estimated_price || 0).toLocaleString('en-IN')}`,
    ];
    lines.forEach((line, i) => doc.text(line, 20, 40 + i * 10));
    doc.save(`${booking.booking_number}_summary.pdf`);
  };

  return (
    <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition">
      <div className="flex justify-between items-start mb-4">
        <div>
          <p className="text-blue-600 font-bold text-lg">{booking.booking_number}</p>
          <p className="text-gray-600 text-sm">{booking.service_type}</p>
        </div>
        <StatusBadge status={booking.status} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm text-gray-700 mb-4">
        <p><span className="font-semibold text-gray-500">From:</span> {booking.origin}</p>
        <p><span className="font-semibold text-gray-500">To:</span> {booking.destination}</p>
        <p><span className="font-semibold text-gray-500">Date:</span> {new Date(booking.booking_date).toLocaleDateString('en-IN')}</p>
        <p><span className="font-semibold text-gray-500">Weight:</span> {booking.weight || 0} kg</p>
        <p><span className="font-semibold text-gray-500">Cargo:</span> {booking.cargo_type || 'General'}</p>
        <p className="text-green-700 font-bold text-base">₹ {(booking.estimated_price || 0).toLocaleString('en-IN')}</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={handleDownload}
          className="px-4 py-2 rounded-lg bg-gray-600 hover:bg-gray-700 text-white text-sm font-medium transition"
        >
          📄 Download Summary
        </button>
        <button
          onClick={() => navigate(`/track?id=${booking.booking_number}`)}
          className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition"
        >
          🚚 Track Shipment
        </button>
        <button
          onClick={() => bookingAPI.cancel(booking.id).then(() => window.location.reload())}
          className="px-4 py-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 text-sm font-medium transition"
          disabled={booking.status === 'cancelled' || booking.status === 'delivered'}
        >
          ✕ Cancel
        </button>
      </div>
    </div>
  );
};

const BookingHistoryPage: React.FC = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    const load = async () => {
      try {
        const response = await bookingAPI.getAll();
        setBookings(response.data.data || []);
      } catch (error) {
        console.error('Error fetching bookings:', error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filtered = filter === 'All'
    ? bookings
    : bookings.filter(b => b.status.toLowerCase() === filter.toLowerCase());

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">📦 My Bookings</h2>
        <button
          onClick={() => navigate('/train-booking')}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition text-sm"
        >
          + New Booking
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {['All', 'pending', 'confirmed', 'delivered', 'cancelled'].map(status => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
              filter === status
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-16">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-500">Loading bookings...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <p className="text-gray-500 text-lg mb-4">No bookings found.</p>
          <button
            onClick={() => navigate('/train-booking')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
          >
            Create Your First Booking
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {filtered.map((booking) => (
            <BookingCard key={booking.id} booking={booking} />
          ))}
        </div>
      )}
    </div>
  );
};

export default BookingHistoryPage;
