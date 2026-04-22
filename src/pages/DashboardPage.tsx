// src/pages/DashboardPage.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaTachometerAlt, FaClipboardList, FaTruck, FaShieldAlt, FaChartLine, FaInfoCircle, FaWallet } from 'react-icons/fa';
import { bookingAPI, userAPI } from '../services/api';

interface Shipment {
  id: string;
  bookingId: string;
  serviceType: string;
  status: string;
  date: string;
  amount: number;
  origin: string;
  destination: string;
}

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'in transit':
    case 'confirmed': return 'text-yellow-600 bg-yellow-50';
    case 'pending': return 'text-blue-600 bg-blue-50';
    case 'delivered': return 'text-green-600 bg-green-50';
    case 'cancelled': return 'text-red-600 bg-red-50';
    default: return 'text-gray-600 bg-gray-50';
  }
};

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [walletBalance, setWalletBalance] = useState(0);
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const bookingsRes = await bookingAPI.getAll();
        const bookings = bookingsRes.data.data || [];

        const mapped: Shipment[] = bookings.map((b: any) => ({
          id: b.id,
          bookingId: b.booking_number,
          serviceType: b.service_type,
          status: b.status,
          date: b.booking_date,
          amount: b.estimated_price || 0,
          origin: b.origin,
          destination: b.destination,
        }));

        setShipments(mapped);

        const walletRes = await userAPI.getWallet();
        setWalletBalance(walletRes.data.data?.balance || 0);

        const profileRes = await userAPI.getProfile();
        const user = profileRes.data.data;
        setUserName(user.full_name?.split(' ')[0] || 'User');

      } catch (err) {
        console.error('Dashboard error:', err);
        setError('Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const stats = useMemo(() => {
    const total = shipments.length;
    const inTransit = shipments.filter(s =>
      ['in transit', 'confirmed', 'pending'].includes(s.status.toLowerCase())
    ).length;
    const delivered = shipments.filter(s => s.status.toLowerCase() === 'delivered').length;
    const cancelled = shipments.filter(s => s.status.toLowerCase() === 'cancelled').length;
    const recent = [...shipments]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);

    return { total, inTransit, delivered, cancelled, recent };
  }, [shipments]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">

        <div className="bg-blue-600 text-white p-6 rounded-t-2xl flex items-center justify-between">
          <h1 className="text-3xl font-bold flex items-center">
            <FaTachometerAlt className="mr-3 text-4xl" /> My Dashboard
          </h1>
          <div className="text-right">
            <p className="text-blue-200 text-sm">Welcome back</p>
            <p className="text-white font-bold text-xl">{userName}</p>
          </div>
        </div>

        <div className="p-6 space-y-8">

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
              {error}
            </div>
          )}

          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200 shadow-md">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome, {userName}!</h2>
            <p className="text-gray-700">Here is a quick overview of your shipping operations and recent activities.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 flex items-center space-x-4">
              <div className="p-3 bg-blue-100 rounded-full">
                <FaClipboardList className="text-blue-600 text-2xl" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total Bookings</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 flex items-center space-x-4">
              <div className="p-3 bg-yellow-100 rounded-full">
                <FaTruck className="text-yellow-600 text-2xl" />
              </div>
              <div>
                <p className="text-sm text-gray-500">In Transit</p>
                <p className="text-2xl font-bold text-gray-900">{stats.inTransit}</p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 flex items-center space-x-4">
              <div className="p-3 bg-green-100 rounded-full">
                <FaShieldAlt className="text-green-600 text-2xl" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Delivered</p>
                <p className="text-2xl font-bold text-gray-900">{stats.delivered}</p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200 flex items-center space-x-4">
              <div className="p-3 bg-purple-100 rounded-full">
                <FaWallet className="text-purple-600 text-2xl" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Wallet Balance</p>
                <p className="text-2xl font-bold text-gray-900">Rs {walletBalance.toLocaleString('en-IN')}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center">
              <FaClipboardList className="mr-3 text-blue-600" /> Recent Bookings
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Booking ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Route</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {stats.recent.length > 0 ? (
                    stats.recent.map((s) => (
                      <tr key={s.id} className="hover:bg-blue-50 transition">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">{s.bookingId}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{s.serviceType}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(s.status)}`}>
                            {s.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{s.origin} to {s.destination}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{s.date}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                          {s.amount > 0 ? `Rs ${s.amount.toLocaleString('en-IN')}` : 'N/A'}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                        No bookings yet.{' '}
                        <span
                          className="text-blue-600 cursor-pointer hover:underline"
                          onClick={() => navigate('/train-booking')}
                        >
                          Create your first booking
                        </span>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {stats.recent.length > 0 && (
              <div className="mt-6 text-center">
                <button
                  onClick={() => navigate('/my-bookings')}
                  className="px-6 py-2 bg-blue-500 text-white font-semibold rounded-full shadow-md hover:bg-blue-600 transition duration-300"
                >
                  View All Bookings
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <FaInfoCircle className="mr-3 text-red-500" /> Notifications
              </h2>
              <ul className="text-gray-700 space-y-2 text-sm">
                {stats.inTransit > 0 && (
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-yellow-500 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                    You have {stats.inTransit} shipment{stats.inTransit > 1 ? 's' : ''} currently in transit.
                  </li>
                )}
                {stats.cancelled > 0 && (
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-red-500 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                    {stats.cancelled} booking{stats.cancelled > 1 ? 's were' : ' was'} cancelled.
                  </li>
                )}
                {stats.total === 0 && (
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                    No bookings yet. Start by creating a new shipment!
                  </li>
                )}
              </ul>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-200">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
                <FaChartLine className="mr-3 text-green-500" /> Quick Actions
              </h2>
              <div className="space-y-3">
                <button onClick={() => navigate('/train-booking')} className="w-full text-left px-4 py-3 bg-blue-50 hover:bg-blue-100 rounded-lg text-blue-700 font-medium text-sm transition">
                  Book Rail Freight
                </button>
                <button onClick={() => navigate('/track')} className="w-full text-left px-4 py-3 bg-green-50 hover:bg-green-100 rounded-lg text-green-700 font-medium text-sm transition">
                  Track a Shipment
                </button>
                <button onClick={() => navigate('/profile')} className="w-full text-left px-4 py-3 bg-purple-50 hover:bg-purple-100 rounded-lg text-purple-700 font-medium text-sm transition">
                  Update Profile
                </button>
                <button onClick={() => navigate('/my-bookings')} className="w-full text-left px-4 py-3 bg-yellow-50 hover:bg-yellow-100 rounded-lg text-yellow-700 font-medium text-sm transition">
                  View All Bookings
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
