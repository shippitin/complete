// src/pages/AdminPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUsers, FaClipboardList, FaChartBar, FaSearch, FaUserCog } from 'react-icons/fa';
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
}

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  let classes = 'px-3 py-1 text-xs font-semibold rounded-full uppercase';
  switch (status.toLowerCase()) {
    case 'pending': classes += ' bg-gray-100 text-gray-600'; break;
    case 'confirmed': classes += ' bg-blue-100 text-blue-700'; break;
    case 'in_transit': classes += ' bg-blue-50 text-blue-600'; break;
    case 'delivered': classes += ' bg-gray-100 text-gray-700'; break;
    case 'cancelled': classes += ' bg-red-50 text-red-500'; break;
    case 'admin': classes += ' bg-blue-600 text-white'; break;
    default: classes += ' bg-gray-100 text-gray-600';
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
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
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
    setSearchTerm('');
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

  const filteredBookings = bookings.filter(b =>
    b.booking_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.service_type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredUsers = users.filter(u =>
    u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FaUserCog className="text-blue-600 text-2xl" />
            <div>
              <h1 className="text-xl font-bold text-gray-800">Admin Panel</h1>
              <p className="text-gray-400 text-sm">Manage bookings, users and platform data</p>
            </div>
          </div>
          <span className="text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-100 px-4 py-2 rounded-full">
            Admin Access
          </span>
        </div>

        {/* Tabs — same style as your service tabs */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-1.5 flex gap-1">
          {[
            { id: 'stats', label: 'Dashboard', icon: <FaChartBar className="text-sm" /> },
            { id: 'bookings', label: 'Bookings', icon: <FaClipboardList className="text-sm" /> },
            { id: 'users', label: 'Users', icon: <FaUsers className="text-sm" /> },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id as any)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm transition-all ${
                activeTab === tab.id
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Stats Tab */}
        {activeTab === 'stats' && (
          loading ? (
            <div className="flex justify-center py-16">
              <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent"></div>
            </div>
          ) : stats && (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { label: 'Total Users', value: stats.totalUsers },
                { label: 'Total Bookings', value: stats.totalBookings },
                { label: 'Pending', value: stats.pendingBookings },
                { label: 'Confirmed', value: stats.confirmedBookings },
                { label: 'Delivered', value: stats.deliveredBookings },
                { label: 'Cancelled', value: stats.cancelledBookings },
              ].map(stat => (
                <div key={stat.label} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                  <p className="text-gray-400 text-sm">{stat.label}</p>
                  <p className="text-4xl font-black text-gray-800 mt-2">{stat.value}</p>
                </div>
              ))}
            </div>
          )
        )}

        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center">
              <h2 className="font-bold text-gray-800">All Bookings ({filteredBookings.length})</h2>
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 text-xs" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-8 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 w-48"
                />
              </div>
            </div>
            {loading ? (
              <div className="flex justify-center py-16">
                <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent"></div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      {['Booking ID', 'Customer', 'Service', 'Route', 'Status', 'Amount', 'Update'].map(h => (
                        <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredBookings.length > 0 ? filteredBookings.map(booking => (
                      <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-4 text-sm font-bold text-blue-600">{booking.booking_number}</td>
                        <td className="px-5 py-4 text-sm">
                          <p className="font-medium text-gray-800">{booking.full_name}</p>
                          <p className="text-gray-400 text-xs">{booking.email}</p>
                        </td>
                        <td className="px-5 py-4 text-sm text-gray-600">{booking.service_type}</td>
                        <td className="px-5 py-4 text-sm text-gray-400">{booking.origin} → {booking.destination}</td>
                        <td className="px-5 py-4"><StatusBadge status={booking.status} /></td>
                        <td className="px-5 py-4 text-sm font-semibold text-gray-800">₹{(booking.estimated_price || 0).toLocaleString('en-IN')}</td>
                        <td className="px-5 py-4">
                          <select
                            className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-200 bg-white"
                            value={booking.status}
                            onChange={e => updateBookingStatus(booking.id, e.target.value)}
                          >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="in_transit">In Transit</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                      </tr>
                    )) : (
                      <tr><td colSpan={7} className="px-5 py-12 text-center text-gray-400 text-sm">No bookings found.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center">
              <h2 className="font-bold text-gray-800">All Users ({filteredUsers.length})</h2>
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 text-xs" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-8 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 w-48"
                />
              </div>
            </div>
            {loading ? (
              <div className="flex justify-center py-16">
                <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent"></div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      {['Name', 'Email', 'Phone', 'Company', 'Role', 'Joined', 'Actions'].map(h => (
                        <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredUsers.length > 0 ? filteredUsers.map(user => (
                      <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-5 py-4 text-sm font-medium text-gray-800">{user.full_name}</td>
                        <td className="px-5 py-4 text-sm text-gray-500">{user.email}</td>
                        <td className="px-5 py-4 text-sm text-gray-500">{user.phone}</td>
                        <td className="px-5 py-4 text-sm text-gray-400">{user.company_name || '—'}</td>
                        <td className="px-5 py-4"><StatusBadge status={user.role} /></td>
                        <td className="px-5 py-4 text-sm text-gray-400">{new Date(user.created_at).toLocaleDateString('en-IN')}</td>
                        <td className="px-5 py-4">
                          {user.role !== 'admin' && (
                            <button
                              onClick={() => makeAdmin(user.id)}
                              className="text-xs border border-gray-200 text-gray-600 px-3 py-1.5 rounded-lg hover:border-blue-300 hover:text-blue-600 transition"
                            >
                              Make Admin
                            </button>
                          )}
                        </td>
                      </tr>
                    )) : (
                      <tr><td colSpan={7} className="px-5 py-12 text-center text-gray-400 text-sm">No users found.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminPage;
