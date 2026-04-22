// src/components/Profile/MyShipments.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { bookingAPI } from '../../services/api';

interface Booking {
  id: string;
  booking_number: string;
  service_type: string;
  status: string;
  booking_date: string;
  estimated_price: number;
  origin: string;
  destination: string;
}

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  let classes = 'px-2 py-1 text-xs font-medium rounded-full';
  switch (status.toLowerCase()) {
    case 'pending': classes += ' bg-yellow-100 text-yellow-800'; break;
    case 'confirmed': classes += ' bg-green-100 text-green-800'; break;
    case 'delivered': classes += ' bg-blue-100 text-blue-800'; break;
    case 'cancelled': classes += ' bg-red-100 text-red-800'; break;
    default: classes += ' bg-gray-100 text-gray-800';
  }
  return <span className={classes}>{status}</span>;
};

const MyShipments: React.FC = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await bookingAPI.getAll();
        setBookings(response.data.data || []);
      } catch (error) {
        console.error('Failed to fetch shipments:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 sm:p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-500 border-t-transparent mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 sm:p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">My Shipments</h1>
        <button
          onClick={() => navigate('/train-booking')}
          className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-blue-700 transition"
        >
          + New Booking
        </button>
      </div>

      {bookings.length === 0 ? (
        <div className="mt-6 p-8 border border-gray-200 rounded-md text-center">
          <p className="text-gray-500 text-lg mb-4">No shipments found yet.</p>
          <button
            onClick={() => navigate('/train-booking')}
            className="bg-blue-600 text-white px-6 py-2 rounded-md font-semibold hover:bg-blue-700 transition"
          >
            Book Your First Shipment
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => (
            <div key={booking.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-bold text-blue-600 text-lg">{booking.booking_number}</p>
                  <p className="text-gray-700 font-medium">{booking.service_type}</p>
                  <p className="text-gray-500 text-sm mt-1">
                    {booking.origin} → {booking.destination}
                  </p>
                  <p className="text-gray-400 text-xs mt-1">
                    {new Date(booking.booking_date).toLocaleDateString('en-IN')}
                  </p>
                </div>
                <div className="text-right">
                  <StatusBadge status={booking.status} />
                  <p className="text-gray-900 font-bold mt-2">
                    ₹ {(booking.estimated_price || 0).toLocaleString('en-IN')}
                  </p>
                  <button
                    onClick={() => navigate(`/track?id=${booking.booking_number}`)}
                    className="text-blue-600 text-sm hover:underline mt-1"
                  >
                    Track →
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyShipments;