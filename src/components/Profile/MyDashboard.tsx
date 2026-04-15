import React, { useMemo } from 'react';
import { Package, Truck, Shield, Clock, BarChart3, CornerRightUp } from 'lucide-react';

// --- TYPES (Assuming these types are defined elsewhere or added here for completeness) ---

/**
 * NOTE: For your local project, you should import these types from your shared types file.
 * We include them here for a complete, self-contained component example.
 */
interface Shipment {
  id: string;
  bookingId: string;
  serviceType: string;
  status: 'In Transit' | 'Active' | 'Delivered' | 'Cancelled';
  date: string; // YYYY-MM-DD
  amount: number;
  origin: string;
  destination: string;
}

interface DashboardProps {
  shipments: Shipment[];
  pendingPayments: number; // Placeholder for calculated payment data
  documentsPending: number; // Placeholder for calculated document data
  onViewAllBookings: () => void; // Function to navigate to the full list
}

// --- UTILITY COMPONENTS ---

// Status Badge Component
const StatusBadge: React.FC<{ status: Shipment['status'] }> = ({ status }) => {
  let classes = 'px-3 py-1 text-xs font-medium rounded-full';
  switch (status) {
    case 'In Transit':
      classes += ' bg-yellow-100 text-yellow-800';
      break;
    case 'Active':
      classes += ' bg-green-100 text-green-800';
      break;
    case 'Delivered':
      classes += ' bg-blue-100 text-blue-800';
      break;
    case 'Cancelled':
      classes += ' bg-red-100 text-red-800';
      break;
  }
  return <span className={classes}>{status}</span>;
};

// Generic Statistic Card Component
const StatCard: React.FC<{ title: string, value: string | number, icon: React.ElementType, colorClass: string, bgColorClass: string }> = ({ title, value, icon: Icon, colorClass, bgColorClass }) => (
  <div className="bg-white rounded-xl shadow-lg p-5 flex items-center space-x-4 border border-gray-100 hover:shadow-xl transition duration-300">
    <div className={`p-3 rounded-full ${bgColorClass} ${colorClass}`}>
      <Icon className="w-6 h-6" />
    </div>
    <div>
      <p className="text-gray-500 text-sm font-medium">{title}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
  </div>
);

// --- MAIN DASHBOARD COMPONENT ---

const MyDashboard: React.FC<DashboardProps> = ({ shipments, pendingPayments, documentsPending, onViewAllBookings }) => {

  // 1. Calculate Dynamic Stats
  const stats = useMemo(() => {
    const totalBookings = shipments.length;
    const shipmentsInTransit = shipments.filter(s => s.status === 'In Transit').length;
    const deliveredShipments = shipments.filter(s => s.status === 'Delivered').length;

    // Use the top 5 shipments for the recent bookings table, sorted by date (descending)
    const recentBookings = [...shipments]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5);
    
    return {
      totalBookings,
      shipmentsInTransit,
      deliveredShipments,
      recentBookings
    };
  }, [shipments]);


  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8 bg-gray-50">

      {/* Blue Header Section */}
      <div className="bg-blue-600 text-white p-6 rounded-xl shadow-xl">
        <h2 className="text-3xl font-bold flex items-center space-x-3">
          <BarChart3 className="w-7 h-7" />
          <span>My Dashboard</span>
        </h2>
        <p className="text-blue-200 mt-1">Quick overview of your shipping operations.</p>
      </div>

      {/* Statistics Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Bookings"
          value={stats.totalBookings}
          icon={Package}
          colorClass="text-blue-600"
          bgColorClass="bg-blue-100"
        />
        <StatCard
          title="In Transit"
          value={stats.shipmentsInTransit}
          icon={Truck}
          colorClass="text-yellow-600"
          bgColorClass="bg-yellow-100"
        />
        <StatCard
          title="Delivered"
          value={stats.deliveredShipments}
          icon={Shield}
          colorClass="text-green-600"
          bgColorClass="bg-green-100"
        />
        <StatCard
          title="Pending Payments"
          value={`₹ ${pendingPayments.toLocaleString('en-IN')}`} // Format currency
          icon={Clock}
          colorClass="text-red-600"
          bgColorClass="bg-red-100"
        />
      </div>

      {/* Recent Bookings Table */}
      <div className="bg-white rounded-xl shadow-xl p-6 space-y-4">
        <h3 className="text-xl font-bold text-gray-800 flex items-center space-x-2 border-b pb-3">
          <CornerRightUp className="w-5 h-5 text-blue-600" />
          <span>Recent Bookings (Top 5)</span>
        </h3>

        {stats.recentBookings.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">BOOKING ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SERVICE</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">STATUS</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">DESTINATION</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">AMOUNT</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stats.recentBookings.map((shipment) => (
                  <tr key={shipment.id} className="hover:bg-blue-50/50 transition">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">{shipment.bookingId}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{shipment.serviceType}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <StatusBadge status={shipment.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{shipment.destination}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 text-right">₹ {shipment.amount.toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="p-8 text-center text-gray-500">No shipments found. Start creating one!</p>
        )}
        
        <div className="text-right pt-2">
          <button 
            onClick={onViewAllBookings}
            className="text-sm font-medium text-blue-600 hover:text-blue-800 transition"
          >
            View All Bookings &rarr;
          </button>
        </div>
      </div>

      {/* Additional Information / Notifications */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-yellow-500">
          <h4 className="text-lg font-bold text-yellow-800 mb-2">Pending Actions</h4>
          <ul className="space-y-2 text-gray-700 text-sm">
            <li>You have **{documentsPending}** documents pending verification.</li>
            <li>**1** shipment requires booking confirmation by 5 PM today.</li>
          </ul>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
          <h4 className="text-lg font-bold text-green-800 mb-2">Quick Access</h4>
          <ul className="space-y-2 text-gray-700 text-sm">
            <li>Review **latest invoices** and download receipts.</li>
            <li>Update your **profile and preferences**.</li>
          </ul>
        </div>
      </div>

    </div>
  );
};

export default MyDashboard;
