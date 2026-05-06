// src/components/Profile/BillingPayments.tsx
import React, { useEffect, useState } from 'react';
import api from '../../services/api';

interface Transaction {
  id: string;
  service_type: string;
  origin: string;
  destination: string;
  status: string;
  total_amount: string;
  currency: string;
  payment_status: string;
  payment_method: string;
  booking_date: string;
  created_at: string;
}

interface Summary {
  total_spent: number;
  total_bookings: number;
  paid_count: number;
  pending_count: number;
}

const statusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'paid': return 'bg-green-100 text-green-700';
    case 'pending': return 'bg-yellow-100 text-yellow-700';
    case 'failed': return 'bg-red-100 text-red-700';
    default: return 'bg-gray-100 text-gray-600';
  }
};

const BillingPayments: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await api.get('/user/billing');
        setTransactions(res.data.data.transactions || []);
        setSummary(res.data.data.summary || null);
      } catch (err) {
        console.error('Failed to fetch billing:', err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 sm:p-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-2">Billing & Payments</h1>
      <p className="text-gray-500 text-sm mb-6">Your transaction history and payment summary</p>

      {/* Summary cards */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Spent', value: `₹${summary.total_spent.toLocaleString('en-IN')}`, color: 'text-blue-600' },
            { label: 'Total Bookings', value: summary.total_bookings, color: 'text-gray-800' },
            { label: 'Paid', value: summary.paid_count, color: 'text-green-600' },
            { label: 'Pending', value: summary.pending_count, color: 'text-yellow-600' },
          ].map(card => (
            <div key={card.label} className="bg-gray-50 rounded-xl p-4 border border-gray-100 text-center">
              <div className={`text-2xl font-bold ${card.color}`}>{card.value}</div>
              <div className="text-xs text-gray-500 mt-1">{card.label}</div>
            </div>
          ))}
        </div>
      )}

      {loading ? (
        <div className="text-center py-10 text-gray-400">Loading transactions...</div>
      ) : transactions.length === 0 ? (
        <div className="mt-4 p-6 border border-gray-200 rounded-xl text-center text-gray-400 italic">
          No payment history available yet.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-gray-500 text-xs uppercase">
                <th className="text-left py-3 pr-4">Service</th>
                <th className="text-left py-3 pr-4">Route</th>
                <th className="text-left py-3 pr-4">Date</th>
                <th className="text-left py-3 pr-4">Amount</th>
                <th className="text-left py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {transactions.map(tx => (
                <tr key={tx.id} className="hover:bg-gray-50 transition">
                  <td className="py-3 pr-4 font-medium text-gray-800">{tx.service_type || '—'}</td>
                  <td className="py-3 pr-4 text-gray-600">
                    {tx.origin && tx.destination ? `${tx.origin} → ${tx.destination}` : '—'}
                  </td>
                  <td className="py-3 pr-4 text-gray-500">
                    {tx.booking_date ? new Date(tx.booking_date).toLocaleDateString('en-IN') : '—'}
                  </td>
                  <td className="py-3 pr-4 font-semibold text-gray-800">
                    {tx.total_amount ? `₹${parseFloat(tx.total_amount).toLocaleString('en-IN')}` : '—'}
                  </td>
                  <td className="py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusColor(tx.payment_status)}`}>
                      {tx.payment_status || 'Unknown'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default BillingPayments;
