// src/pages/AdminPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUsers, FaClipboardList, FaChartBar, FaSearch, FaUserCog, FaTags, FaPlus, FaEdit, FaTrash, FaToggleOn, FaToggleOff, FaFire, FaRoute } from 'react-icons/fa';
import api, { rateCardsAPI } from '../services/api';
import toast from 'react-hot-toast';

interface Stats { totalUsers: number; totalBookings: number; pendingBookings: number; confirmedBookings: number; deliveredBookings: number; cancelledBookings: number; }
interface User { id: string; full_name: string; email: string; phone: string; company_name: string; role: string; created_at: string; }
interface Booking { id: string; booking_number: string; full_name: string; email: string; service_type: string; origin: string; destination: string; status: string; estimated_price: number; booking_date: string; }
interface RateCard { id: string; service_type: string; origin: string; destination: string; carrier: string; transit_time: string; base_price: number; price_per_kg: number; price_per_container: number; container_type: string; is_active: boolean; valid_from: string; valid_until: string; surge_multiplier: number; surge_reason: string; priority: number; }
interface SearchStat { service_type: string; origin: string; destination: string; search_count: number; last_searched_at: string; }
interface SurgeRule { id: string; service_type: string; searches_threshold: number; surge_multiplier: number; description: string; is_active: boolean; }

const emptyRateCard = { service_type: 'Rail', origin: '', destination: '', carrier: '', transit_time: '', base_price: 0, price_per_kg: 0, price_per_container: 0, container_type: '', is_active: true, valid_from: '', valid_until: '', surge_multiplier: 1.0, surge_reason: '', priority: 0 };

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
  const [activeTab, setActiveTab] = useState<'stats' | 'bookings' | 'users' | 'rates' | 'demand'>('stats');
  const [stats, setStats] = useState<Stats | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [rateCards, setRateCards] = useState<RateCard[]>([]);
  const [searchStats, setSearchStats] = useState<SearchStat[]>([]);
  const [surgeRules, setSurgeRules] = useState<SurgeRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showRateForm, setShowRateForm] = useState(false);
  const [editingRate, setEditingRate] = useState<RateCard | null>(null);
  const [rateForm, setRateForm] = useState(emptyRateCard);
  const [rateServiceFilter, setRateServiceFilter] = useState('');

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('shippitin_user') || '{}');
    if (user.role !== 'admin') { navigate('/'); return; }
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try { const res = await api.get('/admin/stats'); setStats(res.data.data); } 
    catch (error) { console.error('Failed to fetch stats:', error); } 
    finally { setLoading(false); }
  };

  const fetchBookings = async () => {
    setLoading(true);
    try { const res = await api.get('/admin/bookings'); setBookings(res.data.data); } 
    catch (error) { console.error(error); } 
    finally { setLoading(false); }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try { const res = await api.get('/admin/users'); setUsers(res.data.data); } 
    catch (error) { console.error(error); } 
    finally { setLoading(false); }
  };

  const fetchRateCards = async () => {
    setLoading(true);
    try { const res = await rateCardsAPI.getAll(); setRateCards(res.data.data); } 
    catch (error) { console.error(error); } 
    finally { setLoading(false); }
  };

  const fetchDemandStats = async () => {
    setLoading(true);
    try {
      const [statsRes, rulesRes] = await Promise.all([
        api.get('/quotes/demand/stats'),
        api.get('/quotes/demand/rules'),
      ]);
      setSearchStats(statsRes.data.data || []);
      setSurgeRules(rulesRes.data.data || []);
    } catch (error) { console.error(error); }
    finally { setLoading(false); }
  };

  const handleTabChange = (tab: any) => {
    setActiveTab(tab);
    setSearchTerm('');
    if (tab === 'bookings') fetchBookings();
    if (tab === 'users') fetchUsers();
    if (tab === 'rates') fetchRateCards();
    if (tab === 'demand') fetchDemandStats();
  };

  const updateBookingStatus = async (bookingId: string, status: string) => {
    try { await api.put(`/admin/bookings/${bookingId}/status`, { status }); fetchBookings(); } 
    catch (error) { console.error(error); }
  };

  const makeAdmin = async (userId: string) => {
    try { await api.put(`/admin/users/${userId}/make-admin`); fetchUsers(); } 
    catch (error) { console.error(error); }
  };

  const handleRateFormSubmit = async () => {
    try {
      if (editingRate) { await rateCardsAPI.update(editingRate.id, rateForm); toast.success('Rate card updated!'); }
      else { await rateCardsAPI.create(rateForm); toast.success('Rate card created!'); }
      setShowRateForm(false); setEditingRate(null); setRateForm(emptyRateCard); fetchRateCards();
    } catch (error) { toast.error('Failed to save rate card.'); }
  };

  const handleEditRate = (rate: RateCard) => {
    setEditingRate(rate);
    setRateForm({
      service_type: rate.service_type, origin: rate.origin, destination: rate.destination,
      carrier: rate.carrier, transit_time: rate.transit_time, base_price: rate.base_price,
      price_per_kg: rate.price_per_kg, price_per_container: rate.price_per_container,
      container_type: rate.container_type || '', is_active: rate.is_active,
      valid_from: rate.valid_from ? rate.valid_from.split('T')[0] : '',
      valid_until: rate.valid_until ? rate.valid_until.split('T')[0] : '',
      surge_multiplier: rate.surge_multiplier || 1.0,
      surge_reason: rate.surge_reason || '', priority: rate.priority || 0,
    });
    setShowRateForm(true);
  };

  const handleDeleteRate = async (id: string) => {
    if (!window.confirm('Delete this rate card?')) return;
    try { await rateCardsAPI.delete(id); toast.success('Rate card deleted.'); fetchRateCards(); } 
    catch (error) { toast.error('Failed to delete.'); }
  };

  const handleToggleActive = async (rate: RateCard) => {
    try { await rateCardsAPI.update(rate.id, { ...rate, is_active: !rate.is_active }); toast.success(rate.is_active ? 'Deactivated.' : 'Activated.'); fetchRateCards(); } 
    catch (error) { toast.error('Failed to update.'); }
  };

  const filteredBookings = bookings.filter(b => b.booking_number?.toLowerCase().includes(searchTerm.toLowerCase()) || b.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || b.service_type?.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredUsers = users.filter(u => u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || u.email?.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredRates = rateCards.filter(r => (!rateServiceFilter || r.service_type === rateServiceFilter) && (!searchTerm || r.origin.toLowerCase().includes(searchTerm.toLowerCase()) || r.destination.toLowerCase().includes(searchTerm.toLowerCase()) || r.carrier.toLowerCase().includes(searchTerm.toLowerCase())));

  const SERVICE_TYPES = ['Rail', 'Sea', 'Air', 'Truck', 'Parcel', 'LCL', 'Customs', 'Insurance', 'DoorToDoor', 'FirstLastMile'];

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FaUserCog className="text-blue-600 text-2xl" />
            <div>
              <h1 className="text-xl font-bold text-gray-800">Admin Panel</h1>
              <p className="text-gray-400 text-sm">Manage bookings, users, rates and dynamic pricing</p>
            </div>
          </div>
          <span className="text-xs font-semibold text-blue-600 bg-blue-50 border border-blue-100 px-4 py-2 rounded-full">Admin Access</span>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-1.5 flex gap-1 flex-wrap">
          {[
            { id: 'stats', label: 'Dashboard', icon: <FaChartBar className="text-sm" /> },
            { id: 'bookings', label: 'Bookings', icon: <FaClipboardList className="text-sm" /> },
            { id: 'users', label: 'Users', icon: <FaUsers className="text-sm" /> },
            { id: 'rates', label: 'Rate Cards', icon: <FaTags className="text-sm" /> },
            { id: 'demand', label: 'Dynamic Pricing', icon: <FaFire className="text-sm" /> },
          ].map(tab => (
            <button key={tab.id} onClick={() => handleTabChange(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm transition-all ${activeTab === tab.id ? 'bg-blue-600 text-white' : 'text-gray-500 hover:bg-gray-50'}`}>
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Stats Tab */}
        {activeTab === 'stats' && (
          loading ? <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent"></div></div>
          : stats && (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {[{ label: 'Total Users', value: stats.totalUsers }, { label: 'Total Bookings', value: stats.totalBookings }, { label: 'Pending', value: stats.pendingBookings }, { label: 'Confirmed', value: stats.confirmedBookings }, { label: 'Delivered', value: stats.deliveredBookings }, { label: 'Cancelled', value: stats.cancelledBookings }].map(stat => (
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
              <div className="relative"><FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 text-xs" /><input type="text" placeholder="Search..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-8 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 w-48" /></div>
            </div>
            {loading ? <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent"></div></div> : (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50 border-b border-gray-100"><tr>{['Booking ID', 'Customer', 'Service', 'Route', 'Status', 'Amount', 'Update'].map(h => <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase">{h}</th>)}</tr></thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredBookings.length > 0 ? filteredBookings.map(booking => (
                      <tr key={booking.id} className="hover:bg-gray-50">
                        <td className="px-5 py-4 text-sm font-bold text-blue-600">{booking.booking_number}</td>
                        <td className="px-5 py-4 text-sm"><p className="font-medium text-gray-800">{booking.full_name}</p><p className="text-gray-400 text-xs">{booking.email}</p></td>
                        <td className="px-5 py-4 text-sm text-gray-600">{booking.service_type}</td>
                        <td className="px-5 py-4 text-sm text-gray-400">{booking.origin} → {booking.destination}</td>
                        <td className="px-5 py-4"><StatusBadge status={booking.status} /></td>
                        <td className="px-5 py-4 text-sm font-semibold text-gray-800">₹{(booking.estimated_price || 0).toLocaleString('en-IN')}</td>
                        <td className="px-5 py-4">
                          <select className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs text-gray-600 focus:outline-none bg-white" value={booking.status} onChange={e => updateBookingStatus(booking.id, e.target.value)}>
                            {['pending', 'confirmed', 'in_transit', 'delivered', 'cancelled'].map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </td>
                      </tr>
                    )) : <tr><td colSpan={7} className="px-5 py-12 text-center text-gray-400 text-sm">No bookings found.</td></tr>}
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
              <div className="relative"><FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 text-xs" /><input type="text" placeholder="Search..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-8 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 w-48" /></div>
            </div>
            {loading ? <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent"></div></div> : (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50 border-b border-gray-100"><tr>{['Name', 'Email', 'Phone', 'Company', 'Role', 'Joined', 'Actions'].map(h => <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase">{h}</th>)}</tr></thead>
                  <tbody className="divide-y divide-gray-50">
                    {filteredUsers.length > 0 ? filteredUsers.map(user => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-5 py-4 text-sm font-medium text-gray-800">{user.full_name}</td>
                        <td className="px-5 py-4 text-sm text-gray-500">{user.email}</td>
                        <td className="px-5 py-4 text-sm text-gray-500">{user.phone}</td>
                        <td className="px-5 py-4 text-sm text-gray-400">{user.company_name || '—'}</td>
                        <td className="px-5 py-4"><StatusBadge status={user.role} /></td>
                        <td className="px-5 py-4 text-sm text-gray-400">{new Date(user.created_at).toLocaleDateString('en-IN')}</td>
                        <td className="px-5 py-4">{user.role !== 'admin' && <button onClick={() => makeAdmin(user.id)} className="text-xs border border-gray-200 text-gray-600 px-3 py-1.5 rounded-lg hover:border-blue-300 hover:text-blue-600 transition">Make Admin</button>}</td>
                      </tr>
                    )) : <tr><td colSpan={7} className="px-5 py-12 text-center text-gray-400 text-sm">No users found.</td></tr>}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Rate Cards Tab */}
        {activeTab === 'rates' && (
          <div className="space-y-4">
            {showRateForm && (
              <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-6 max-h-screen overflow-y-auto">
                  <h2 className="text-xl font-bold text-gray-800 mb-6">{editingRate ? 'Edit Rate Card' : 'Add New Rate Card'}</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div><label className="block text-sm font-medium text-gray-600 mb-1">Service Type</label>
                      <select value={rateForm.service_type} onChange={e => setRateForm({ ...rateForm, service_type: e.target.value })} className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                        {SERVICE_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div><label className="block text-sm font-medium text-gray-600 mb-1">Carrier</label><input type="text" value={rateForm.carrier} onChange={e => setRateForm({ ...rateForm, carrier: e.target.value })} placeholder="e.g. CONCOR, Maersk" className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                    <div><label className="block text-sm font-medium text-gray-600 mb-1">Origin</label><input type="text" value={rateForm.origin} onChange={e => setRateForm({ ...rateForm, origin: e.target.value })} placeholder="e.g. Chennai, INMAA" className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                    <div><label className="block text-sm font-medium text-gray-600 mb-1">Destination</label><input type="text" value={rateForm.destination} onChange={e => setRateForm({ ...rateForm, destination: e.target.value })} placeholder="e.g. JNPT, Mumbai" className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                    <div><label className="block text-sm font-medium text-gray-600 mb-1">Transit Time</label><input type="text" value={rateForm.transit_time} onChange={e => setRateForm({ ...rateForm, transit_time: e.target.value })} placeholder="e.g. 3-4 Days" className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                    <div><label className="block text-sm font-medium text-gray-600 mb-1">Container Type</label><input type="text" value={rateForm.container_type} onChange={e => setRateForm({ ...rateForm, container_type: e.target.value })} placeholder="e.g. 20ft, 40ft" className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                    <div><label className="block text-sm font-medium text-gray-600 mb-1">Base Price (₹)</label><input type="number" value={rateForm.base_price} onChange={e => setRateForm({ ...rateForm, base_price: parseFloat(e.target.value) })} className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                    <div><label className="block text-sm font-medium text-gray-600 mb-1">Price per KG (₹)</label><input type="number" value={rateForm.price_per_kg} onChange={e => setRateForm({ ...rateForm, price_per_kg: parseFloat(e.target.value) })} className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                    <div><label className="block text-sm font-medium text-gray-600 mb-1">Price per Container (₹)</label><input type="number" value={rateForm.price_per_container} onChange={e => setRateForm({ ...rateForm, price_per_container: parseFloat(e.target.value) })} className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                    <div><label className="block text-sm font-medium text-gray-600 mb-1">Priority (higher = preferred)</label><input type="number" value={rateForm.priority} onChange={e => setRateForm({ ...rateForm, priority: parseInt(e.target.value) })} className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                    <div><label className="block text-sm font-medium text-gray-600 mb-1">Surge Multiplier (1.0 = normal)</label><input type="number" step="0.01" min="0.5" max="3.0" value={rateForm.surge_multiplier} onChange={e => setRateForm({ ...rateForm, surge_multiplier: parseFloat(e.target.value) })} className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                    <div><label className="block text-sm font-medium text-gray-600 mb-1">Surge Reason (shown to customer)</label><input type="text" value={rateForm.surge_reason} onChange={e => setRateForm({ ...rateForm, surge_reason: e.target.value })} placeholder="e.g. Peak Season, High Demand" className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                    <div><label className="block text-sm font-medium text-gray-600 mb-1">Valid From</label><input type="date" value={rateForm.valid_from} onChange={e => setRateForm({ ...rateForm, valid_from: e.target.value })} className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                    <div><label className="block text-sm font-medium text-gray-600 mb-1">Valid Until</label><input type="date" value={rateForm.valid_until} onChange={e => setRateForm({ ...rateForm, valid_until: e.target.value })} className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                    <div className="flex items-center gap-3"><label className="text-sm font-medium text-gray-600">Active</label>
                      <button onClick={() => setRateForm({ ...rateForm, is_active: !rateForm.is_active })} className={`text-2xl ${rateForm.is_active ? 'text-blue-600' : 'text-gray-400'}`}>{rateForm.is_active ? <FaToggleOn /> : <FaToggleOff />}</button>
                    </div>
                  </div>
                  <div className="flex gap-3 mt-6">
                    <button onClick={handleRateFormSubmit} className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition">{editingRate ? 'Update Rate Card' : 'Add Rate Card'}</button>
                    <button onClick={() => { setShowRateForm(false); setEditingRate(null); setRateForm(emptyRateCard); }} className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-200 transition">Cancel</button>
                  </div>
                </div>
              </div>
            )}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-5 border-b border-gray-100 flex flex-wrap gap-3 justify-between items-center">
                <h2 className="font-bold text-gray-800">Rate Cards ({filteredRates.length})</h2>
                <div className="flex gap-3 flex-wrap">
                  <select value={rateServiceFilter} onChange={e => setRateServiceFilter(e.target.value)} className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200">
                    <option value="">All Services</option>
                    {SERVICE_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <div className="relative"><FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 text-xs" /><input type="text" placeholder="Search origin, dest, carrier..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-8 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 w-56" /></div>
                  <button onClick={() => { setShowRateForm(true); setEditingRate(null); setRateForm(emptyRateCard); }} className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-blue-700 transition"><FaPlus /> Add Rate</button>
                </div>
              </div>
              {loading ? <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent"></div></div> : (
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-gray-50 border-b border-gray-100"><tr>{['Service', 'Route', 'Carrier', 'Transit', 'Base Price', 'Per KG', 'Per Container', 'Surge', 'Status', 'Actions'].map(h => <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase whitespace-nowrap">{h}</th>)}</tr></thead>
                    <tbody className="divide-y divide-gray-50">
                      {filteredRates.length > 0 ? filteredRates.map(rate => (
                        <tr key={rate.id} className={`hover:bg-gray-50 transition-colors ${!rate.is_active ? 'opacity-50' : ''}`}>
                          <td className="px-4 py-3 text-xs font-bold text-blue-600 whitespace-nowrap">{rate.service_type}</td>
                          <td className="px-4 py-3 text-xs text-gray-700 whitespace-nowrap">{rate.origin} → {rate.destination}</td>
                          <td className="px-4 py-3 text-xs font-medium text-gray-800 whitespace-nowrap">{rate.carrier}</td>
                          <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{rate.transit_time}</td>
                          <td className="px-4 py-3 text-xs font-semibold text-gray-800 whitespace-nowrap">₹{parseFloat(rate.base_price as any).toLocaleString('en-IN')}</td>
                          <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">₹{parseFloat(rate.price_per_kg as any)}/kg</td>
                          <td className="px-4 py-3 text-xs text-gray-600 whitespace-nowrap">₹{parseFloat(rate.price_per_container as any).toLocaleString('en-IN')}</td>
                          <td className="px-4 py-3 text-xs whitespace-nowrap">
                            {parseFloat(rate.surge_multiplier as any) > 1.0 ? (
                              <span className="flex items-center gap-1 text-orange-600 font-bold"><FaFire className="text-orange-500" />{rate.surge_multiplier}x</span>
                            ) : <span className="text-gray-400">Normal</span>}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap"><span className={`px-2 py-1 text-xs font-semibold rounded-full ${rate.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-500'}`}>{rate.is_active ? 'Active' : 'Inactive'}</span></td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <button onClick={() => handleToggleActive(rate)} className={`text-lg ${rate.is_active ? 'text-blue-500' : 'text-gray-400'} hover:opacity-70 transition`}>{rate.is_active ? <FaToggleOn /> : <FaToggleOff />}</button>
                              <button onClick={() => handleEditRate(rate)} className="text-gray-400 hover:text-blue-600 transition"><FaEdit /></button>
                              <button onClick={() => handleDeleteRate(rate.id)} className="text-gray-400 hover:text-red-500 transition"><FaTrash /></button>
                            </div>
                          </td>
                        </tr>
                      )) : <tr><td colSpan={10} className="px-5 py-12 text-center text-gray-400 text-sm">No rate cards found.</td></tr>}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Dynamic Pricing Tab */}
        {activeTab === 'demand' && (
          <div className="space-y-6">
            {/* Search Stats */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-5 border-b border-gray-100">
                <h2 className="font-bold text-gray-800 flex items-center gap-2"><FaRoute className="text-blue-600" /> Today's Route Search Stats</h2>
                <p className="text-gray-400 text-sm mt-1">Routes with high search counts trigger automatic surge pricing</p>
              </div>
              {loading ? <div className="flex justify-center py-16"><div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-500 border-t-transparent"></div></div> : (
                <div className="overflow-x-auto">
                  <table className="min-w-full">
                    <thead className="bg-gray-50 border-b border-gray-100"><tr>{['Service', 'Route', 'Searches Today', 'Last Searched', 'Demand Level'].map(h => <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase">{h}</th>)}</tr></thead>
                    <tbody className="divide-y divide-gray-50">
                      {searchStats.length > 0 ? searchStats.map((stat, i) => (
                        <tr key={i} className="hover:bg-gray-50">
                          <td className="px-5 py-4 text-xs font-bold text-blue-600">{stat.service_type}</td>
                          <td className="px-5 py-4 text-sm text-gray-700">{stat.origin} → {stat.destination}</td>
                          <td className="px-5 py-4 text-sm font-bold text-gray-800">{stat.search_count}</td>
                          <td className="px-5 py-4 text-xs text-gray-400">{new Date(stat.last_searched_at).toLocaleTimeString('en-IN')}</td>
                          <td className="px-5 py-4">
                            {stat.search_count >= 100 ? <span className="flex items-center gap-1 text-red-600 font-bold text-xs"><FaFire />Very High</span>
                              : stat.search_count >= 50 ? <span className="flex items-center gap-1 text-orange-500 font-bold text-xs"><FaFire />High</span>
                              : stat.search_count >= 20 ? <span className="text-yellow-600 font-bold text-xs">Medium</span>
                              : <span className="text-green-600 font-bold text-xs">Normal</span>}
                          </td>
                        </tr>
                      )) : <tr><td colSpan={5} className="px-5 py-12 text-center text-gray-400 text-sm">No searches recorded today yet.</td></tr>}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Surge Rules */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-5 border-b border-gray-100">
                <h2 className="font-bold text-gray-800 flex items-center gap-2"><FaFire className="text-orange-500" /> Auto Surge Rules</h2>
                <p className="text-gray-400 text-sm mt-1">When search count exceeds threshold, price automatically increases</p>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50 border-b border-gray-100"><tr>{['Service', 'Searches Threshold', 'Surge Multiplier', 'Description', 'Status'].map(h => <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase">{h}</th>)}</tr></thead>
                  <tbody className="divide-y divide-gray-50">
                    {surgeRules.length > 0 ? surgeRules.map(rule => (
                      <tr key={rule.id} className="hover:bg-gray-50">
                        <td className="px-5 py-4 text-xs font-bold text-blue-600">{rule.service_type || 'All'}</td>
                        <td className="px-5 py-4 text-sm font-bold text-gray-800">{rule.searches_threshold}+ searches</td>
                        <td className="px-5 py-4"><span className="flex items-center gap-1 text-orange-600 font-bold"><FaFire className="text-orange-500" />{rule.surge_multiplier}x</span></td>
                        <td className="px-5 py-4 text-sm text-gray-600">{rule.description}</td>
                        <td className="px-5 py-4"><span className={`px-2 py-1 text-xs font-semibold rounded-full ${rule.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-500'}`}>{rule.is_active ? 'Active' : 'Inactive'}</span></td>
                      </tr>
                    )) : <tr><td colSpan={5} className="px-5 py-12 text-center text-gray-400 text-sm">No surge rules found.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPage;
