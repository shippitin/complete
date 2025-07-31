import React, { useEffect, useState } from 'react';
import { fetchBookingHistory } from '../services/fetchBookings';
import BookingCard from '../components/BookingCard';
import type { QuoteFormData } from '../types/QuoteData';

const BookingHistoryPage: React.FC = () => {
  const [bookings, setBookings] = useState<QuoteFormData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchBookingHistory();
        console.log('✅ Bookings fetched:', data);
        setBookings(data);
      } catch (error) {
        console.error('❌ Error fetching bookings:', error);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">📦 My Bookings</h2>

      {loading ? (
        <p className="text-gray-500">Loading bookings...</p>
      ) : bookings.length === 0 ? (
        <p className="text-gray-600">No bookings found.</p>
      ) : (
        <div className="grid gap-4">
          {bookings.map((booking, idx) => (
            <BookingCard key={idx} booking={booking} />
          ))}
        </div>
      )}
    </div>
  );
};

export default BookingHistoryPage;