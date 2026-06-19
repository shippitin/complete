// src/components/Admin/ShipmentAlertPanel.tsx
import React, { useEffect, useState } from 'react';
import api from '../../services/api';

interface Booking {
  id: string;
  booking_number: string;
  service_type: string;
  origin: string;
  destination: string;
  status: string;
  full_name: string;
  email: string;
  phone: string;
}

interface Alert {
  id: string;
  booking_id: string;
  booking_number: string;
  service_type: string;
  origin: string;
  destination: string;
  full_name: string;
  location: string;
  reason: string;
  estimated_resolution: string;
  resolved: boolean;
  created_at: string;
}

const statusColor = (status: string) => {
  switch (status) {
    case 'confirmed': return 'bg-green-100 text-green-700';
    case 'in_transit': return 'bg-blue-100 text-blue-700';
    case 'delayed': return 'bg-red-100 text-red-700';
    case 'delivered': return 'bg-gray-100 text-gray-600';
    case 'pending': return 'bg-yellow-100 text-yellow-700';
    default: return 'bg-gray-100 text-gray-600';
  }
};

const ShipmentAlertPanel: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'bookings' | 'alerts'>('alerts');

  // Alert form
  const [showAlertForm, setShowAlertForm] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [alertForm, setAlertForm] = useState({ location: '', reason: '', estimated_resolution: '' });
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Status update
  const [showStatusForm, setShowStatusForm] = useState(false);
  const [statusBooking, setStatusBooking] = useState<Booking | null>(null);
  const [newStatus, setNewStatus] = useState('');
  const [statusLocation, setStatusLocation] = useState('');

  const fetchData = async () => {
    try {
      const [bookingsRes, alertsRes] = await Promise.all([
        api.get('/admin/bookings'),
        api.get('/admin/alerts'),
      ]);
      setBookings(bookingsRes.data.data || []);
      setAlerts(alertsRes.data.data || []);
    } catch (err) {
      console.error('Failed to fetch admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreateAlert = async () => {
    if (!selectedBooking || !alertForm.location || !alertForm.reason) return;
    setSubmitting(true);
    try {
      await api.post('/admin/alerts', {
        booking_id: selectedBooking.id,
        ...alertForm,
      });
      setSuccessMsg(`Alert created! ${selectedBooking.full_name} has been notified via email and SMS.`);
      setShowAlertForm(false);
      setAlertForm({ location: '', reason: '', estimated_resolution: '' });
      fetchData();
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err) {
      console.error('Failed to create alert:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleResolveAlert = async (alertId: string) => {
    const note = prompt('Add a resolution note (optional):') || '';
    try {
      await api.put(`/admin/alerts/${alertId}/resolve`, { resolution_note: note });
      fetchData();
    } catch (err) {
      console.error('Failed to resolve alert:', err);
    }
  };

  const handleUpdateStatus = async () => {
    if (!statusBooking || !newStatus) return;
    setSubmitting(true);
    try {
      await api.put(`/admin/bookings/${statusBooking.id}/status`, {
        status: newStatus,
        location: statusLocation,
      });
      setSuccessMsg(`Status updated! ${statusBooking.full_name} has been notified.`);
      setShowStatusForm(false);
      setNewStatus('');
      setStatusLocation('');
      fetchData();
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const unresolvedCount = alerts.filter(a => !a.resolved).length;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Shipment Management</h1>
      <p className="text-gray-500 text-sm mb-6">Monitor shipments, send alerts and notify customers</p>

      {/* Success banner */}
      {successMsg && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 font-medium flex items-center gap-2">
          <span>✅</span> {successMsg}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button onClick={() => setActiveTab('alerts')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${activeTab === 'alerts' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
          🚨 Active Alerts {unresolvedCount > 0 && <span className="ml-1 bg-white text-red-600 px-1.5 py-0.5 rounded-full text-xs">{unresolvedCount}</span>}
        </button>
        <button onClick={() => setActiveTab('bookings')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition ${activeTab === 'bookings' ? 'bg-brand-gradient text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
          📦 All Bookings ({bookings.length})
        </button>
      </div>

      {loading ? (
        <div className="text-center py-10 text-gray-400">Loading...</div>
      ) : activeTab === 'alerts' ? (
        /* ── ALERTS TAB ── */
        <div>
          {alerts.length === 0 ? (
            <div className="text-center py-10 text-gray-400 italic">No alerts raised yet.</div>
          ) : (
            <div className="space-y-3">
              {alerts.map(alert => (
                <div key={alert.id}
                  className={`border rounded-xl p-4 ${alert.resolved ? 'bg-gray-50 border-gray-100 opacity-60' : 'bg-red-50 border-red-200'}`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-gray-800">{alert.booking_number}</span>
                        <span className="text-xs text-gray-500">{alert.service_type} · {alert.origin} → {alert.destination}</span>
                        {alert.resolved
                          ? <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Resolved</span>
                          : <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">Active</span>}
                      </div>
                      <p className="text-sm text-gray-700"><strong>Customer:</strong> {alert.full_name}</p>
                      <p className="text-sm text-gray-700"><strong>Stuck at:</strong> {alert.location}</p>
                      <p className="text-sm text-gray-700"><strong>Reason:</strong> {alert.reason}</p>
                      {alert.estimated_resolution && (
                        <p className="text-sm text-gray-700"><strong>Est. Resolution:</strong> {alert.estimated_resolution}</p>
                      )}
                      <p className="text-xs text-gray-400 mt-1">{new Date(alert.created_at).toLocaleString('en-IN')}</p>
                    </div>
                    {!alert.resolved && (
                      <button onClick={() => handleResolveAlert(alert.id)}
                        className="text-sm bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700 transition ml-4 flex-shrink-0">
                        Mark Resolved
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* ── BOOKINGS TAB ── */
        <div className="space-y-3">
          {bookings.map(booking => (
            <div key={booking.id} className="border border-gray-100 rounded-xl p-4 bg-white hover:bg-gray-50 transition">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-gray-800">{booking.booking_number}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor(booking.status)}`}>
                      {booking.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">{booking.service_type} · {booking.origin} → {booking.destination}</p>
                  <p className="text-sm text-gray-500">{booking.full_name} · {booking.email} · {booking.phone}</p>
                </div>
                <div className="flex gap-2 ml-4 flex-shrink-0">
                  <button
                    onClick={() => { setStatusBooking(booking); setShowStatusForm(true); }}
                    className="text-xs bg-brand-gradient text-white px-3 py-1.5 rounded-lg hover:opacity-90 transition">
                    Update Status
                  </button>
                  <button
                    onClick={() => { setSelectedBooking(booking); setShowAlertForm(true); }}
                    className="text-xs bg-red-600 text-white px-3 py-1.5 rounded-lg hover:bg-red-700 transition">
                    🚨 Mark Stuck
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Alert Form Modal ── */}
      {showAlertForm && selectedBooking && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full">
            <h3 className="text-lg font-bold text-gray-800 mb-1">🚨 Mark Shipment as Stuck</h3>
            <p className="text-sm text-gray-500 mb-4">
              <strong>{selectedBooking.booking_number}</strong> — {selectedBooking.full_name} will be notified via email and SMS immediately.
            </p>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Current Location*</label>
                <input type="text" value={alertForm.location} placeholder="e.g., Chennai Port, Gate 3"
                  onChange={e => setAlertForm(p => ({ ...p, location: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Reason for Delay*</label>
                <textarea value={alertForm.reason} rows={3}
                  placeholder="e.g., Customs inspection hold, documentation required..."
                  onChange={e => setAlertForm(p => ({ ...p, reason: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400 resize-none" />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Estimated Resolution (Optional)</label>
                <input type="text" value={alertForm.estimated_resolution}
                  placeholder="e.g., Within 24-48 hours, by Monday morning"
                  onChange={e => setAlertForm(p => ({ ...p, estimated_resolution: e.target.value }))}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400" />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={handleCreateAlert} disabled={submitting}
                className="flex-1 bg-red-600 text-white font-semibold py-2.5 rounded-lg hover:bg-red-700 transition disabled:opacity-50">
                {submitting ? 'Sending...' : '🚨 Send Alert & Notify Customer'}
              </button>
              <button onClick={() => setShowAlertForm(false)}
                className="px-4 py-2.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition text-sm">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Status Update Modal ── */}
      {showStatusForm && statusBooking && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full">
            <h3 className="text-lg font-bold text-gray-800 mb-1">Update Shipment Status</h3>
            <p className="text-sm text-gray-500 mb-4">
              <strong>{statusBooking.booking_number}</strong> — Customer will be notified automatically.
            </p>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">New Status*</label>
                <select value={newStatus} onChange={e => setNewStatus(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400">
                  <option value="">Select status...</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="picked_up">Picked Up</option>
                  <option value="in_transit">In Transit</option>
                  <option value="out_for_delivery">Out for Delivery</option>
                  <option value="delivered">Delivered</option>
                  <option value="delayed">Delayed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Current Location (Optional)</label>
                <input type="text" value={statusLocation} placeholder="e.g., Mumbai Hub"
                  onChange={e => setStatusLocation(e.target.value)}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400" />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button onClick={handleUpdateStatus} disabled={submitting || !newStatus}
                className="flex-1 bg-brand-gradient text-white font-semibold py-2.5 rounded-lg hover:opacity-90 transition disabled:opacity-50">
                {submitting ? 'Updating...' : '✅ Update & Notify Customer'}
              </button>
              <button onClick={() => setShowStatusForm(false)}
                className="px-4 py-2.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition text-sm">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShipmentAlertPanel;
