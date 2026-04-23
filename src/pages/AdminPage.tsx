// src/pages/AdminPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

interface Stats {
  totalUsers: number;
  totalBookings: number;
  pendingBookings: number;
  confirmedBookings: number;
  deliveredBookings: number;
  cancelledBookings: number;
}

interface User {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  company_name: string;
  role: string;
  created_at: string;
}

interface Booking {
  id: string;
  booking_number: string;
  full_name: string;
  email: string;
  service_type: string;
  origin: string;
  destination: string;
  status: string;
  estimated_price: number;
  booking_date: string;
  created_at: string;
}

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  let classes = 'px-2 py-1 text-xs font-bold rounded-full uppercase';
  switch (status.toLowerCase()) {
    case 'pending': classes += ' bg-yellow-100 text-yellow-800'; break;
    case 'confirmed': classes += ' bg-green-100 text-green-800'; break;
    case 'delivered': classes += ' bg-blue-100 text-blue-800'; break;
    case 'cancelled': classes += ' bg-red-100 text-red-800'; break;
    case 'admin': classes += ' bg-purple-100 text-purple-800'; break;
    default: classes += ' bg-gray-100 text-gray-800';
  }
  return <span className={classes}>{status}</span>;
};

const AdminPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'stats' | 'bookings' | 'users'>('stats');
  const [stats, setStats] = useState<Stats | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is admin
    const user = JSON.parse(localStorage.getItem('shippitin_user') || '{}');
    if (user.role !== 'admin') {
      navigate('/');
      return;
    }
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await api.get('/admin/stats');
      setStats(res.data.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/bookings');
      setBookings(res.data.data);
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/users');
      setUsers(res.data.data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab: 'stats' | 'bookings' | 'users') => {
    setActiveTab(tab);
    if (tab === 'bookings') fetchBookings();
    if (tab === 'users') fetchUsers();
  };

  const updateBookingStatus = async (bookingId: string, status: string) => {
    try {
      await api.put(`/admin/bookings/${bookingId}/status`, { status });
      fetchBookings();
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const makeAdmin = async (userId: string) => {
    try {
      await api.put(`/admin/users/${userId}/make-admin`);
      fetchUsers();
    } catch (error) {
      console.error('Failed to make admin:', error);
    }
  };

  if (loading && activeTab === 'stats') {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="bg-gray-900 text-white p-6 rounded-xl mb-6">
          <h1 className="text-3xl font-black">⚙️ Shippitin Admin Panel</h1>
          <p className="text-gray-400 mt-1">Manage bookings, users and platform data</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {(['stats', 'bookings', 'users'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
              className={`px-6 py-2 rounded-lg font-semibold capitalize transition ${
                activeTab === tab
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Stats Tab */}
        {activeTab === 'stats' && stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <p className="text-gray-500 text-sm">Total Users</p>
              <p className="text-4xl font-black text-blue-600">{stats.totalUsers}</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <p className="text-gray-500 text-sm">Total Bookings</p>
              <p className="text-4xl font-black text-gray-800">{stats.totalBookings}</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <p className="text-gray-500 text-sm">Pending</p>
              <p className="text-4xl font-black text-yellow-600">{stats.pendingBookings}</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <p className="text-gray-500 text-sm">Confirmed</p>
              <p className="text-4xl font-black text-green-600">{stats.confirmedBookings}</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <p className="text-gray-500 text-sm">Delivered</p>
              <p className="text-4xl font-black text-blue-600">{stats.deliveredBookings}</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border">
              <p className="text-gray-500 text-sm">Cancelled</p>
              <p className="text-4xl font-black text-red-600">{stats.cancelledBookings}</p>
            </div>
          </div>
        )}

        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="p-4 border-b">
              <h2 className="text-xl font-bold">All Bookings ({bookings.length})</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Booking ID</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Service</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Route</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {bookings.map(booking => (
                    <tr key={booking.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium text-blue-600">{booking.booking_number}</td>
                      <td className="px-4 py-3 text-sm">
                        <p className="font-medium">{booking.full_name}</p>
                        <p className="text-gray-400 text-xs">{booking.email}</p>
                      </td>
                      <td className="px-4 py-3 text-sm">{booking.service_type}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{booking.origin} → {booking.destination}</td>
                      <td className="px-4 py-3 text-sm"><StatusBadge status={booking.status} /></td>
                      <td className="px-4 py-3 text-sm font-bold">₹{(booking.estimated_price || 0).toLocaleString('en-IN')}</td>
                      <td className="px-4 py-3 text-sm">
                        <select
                          className="border rounded px-2 py-1 text-xs"
                          value={booking.status}
                          onChange={(e) => updateBookingStatus(booking.id, e.target.value)}
                        >
                          <option value="pending">Pending</option>
                          <option value="confirmed">Confirmed</option>
                          <option value="in_transit">In Transit</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {bookings.length === 0 && (
                <p className="text-center py-8 text-gray-500">No bookings yet.</p>
              )}
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="p-4 border-b">
              <h2 className="text-xl font-bold">All Users ({users.length})</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Company</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {users.map(user => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm font-medium">{user.full_name}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{user.email}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{user.phone}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{user.company_name || '-'}</td>
                      <td className="px-4 py-3 text-sm"><StatusBadge status={user.role} /></td>
                      <td className="px-4 py-3 text-sm text-gray-500">{new Date(user.created_at).toLocaleDateString('en-IN')}</td>
                      <td className="px-4 py-3 text-sm">
                        {user.role !== 'admin' && (
                          <button
                            onClick={() => makeAdmin(user.id)}
                            className="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded hover:bg-purple-200 transition"
                          >
                            Make Admin
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {users.length === 0 && (
                <p className="text-center py-8 text-gray-500">No users yet.</p>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminPage;
