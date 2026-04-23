import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  FaCheckCircle, FaHome, FaHistory, FaInfoCircle, 
  FaTrain, FaTruck, FaPlane, FaShip, FaUser, 
  FaCalendarAlt, FaClock, FaPrint, FaDownload, FaCreditCard
} from 'react-icons/fa';

const BookingConfirmationPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [bookingDetails, setBookingDetails] = useState<any | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let details = location.state?.bookingDetails;
    if (!details) {
      const storedDetails = sessionStorage.getItem('lastBookingDetails');
      if (storedDetails) details = JSON.parse(storedDetails);
    }
    if (details) {
      setBookingDetails(details);
      sessionStorage.setItem('lastBookingDetails', JSON.stringify(details));
      const saveBooking = async () => {
        try {
          const token = localStorage.getItem('shippitin_token');
          if (token && details.bookingId) {
            await fetch('http://localhost:5000/api/bookings', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
              body: JSON.stringify({
                booking_number: details.bookingId,
                service_type: details.selectedResult?.mode || 'General',
                origin: details.selectedResult?.pickupPincode || details.selectedResult?.originStation || 'Origin',
                destination: details.selectedResult?.dropoffPincode || details.selectedResult?.destinationStation || 'Destination',
                cargo_type: details.originalFormData?.loadType || 'General',
                weight: details.originalFormData?.weight || 0,
                booking_date: new Date().toISOString().split('T')[0],
                estimated_price: details.finalAmount || 0,
                status: 'pending',
              }),
            });
          }
        } catch (error) { console.error('Failed to save booking:', error); }
      };
      saveBooking();
    }
    setLoading(false);
  }, [location.state]);

  if (loading) return <LoadingState />;
  if (!bookingDetails) return <ErrorState navigate={navigate} />;

  const { selectedResult = {}, kycDetails = {}, originalFormData = {}, bookingDate = new Date().toLocaleDateString(), bookingTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), bookingId = 'BK-PENDING', finalAmount = 0 } = bookingDetails;
  const mode = selectedResult.mode?.toLowerCase() || 'truck';
  const theme = {
    train: { color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200', icon: <FaTrain /> },
    truck: { color: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-200', icon: <FaTruck /> },
    air: { color: 'text-sky-600', bg: 'bg-sky-50', border: 'border-sky-200', icon: <FaPlane /> },
    sea: { color: 'text-cyan-600', bg: 'bg-cyan-50', border: 'border-cyan-200', icon: <FaShip /> }
  }[mode as 'train' | 'truck' | 'air' | 'sea'] || { color: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-200', icon: <FaTruck /> };

  const handlePayNow = () => {
    navigate('/payment', { state: { bookingId, amount: finalAmount, bookingNumber: bookingId, serviceType: selectedResult.serviceName || selectedResult.mode || 'Freight' } });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] py-12 px-4 font-sans">
      <div className="max-w-4xl mx-auto">
        <div className="bg-emerald-600 rounded-t-[2.5rem] p-10 text-center text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10 text-9xl">{theme.icon}</div>
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 rounded-full mb-4"><FaCheckCircle className="text-4xl" /></div>
          <h1 className="text-4xl font-black tracking-tight">Booking Confirmed!</h1>
          <p className="opacity-90 mt-2 text-lg font-medium">Your shipment has been successfully scheduled.</p>
        </div>

        <div className="bg-white rounded-b-[2.5rem] shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-10 text-center border-b border-slate-100 bg-slate-50/30">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-3">Booking Reference</p>
            <h2 className="text-5xl font-black text-slate-900 tracking-tighter">{bookingId}</h2>
            <div className="flex items-center justify-center gap-6 mt-6 text-slate-500 font-bold text-sm">
               <span className="flex items-center gap-2 px-4 py-1.5 bg-white rounded-full border border-slate-200 shadow-sm"><FaCalendarAlt className="text-blue-500" /> {bookingDate}</span>
               <span className="flex items-center gap-2 px-4 py-1.5 bg-white rounded-full border border-slate-200 shadow-sm"><FaClock className="text-blue-500" /> {bookingTime}</span>
            </div>
            {finalAmount > 0 && (
              <div className="mt-8">
                <button onClick={handlePayNow} className="inline-flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white font-black px-10 py-4 rounded-2xl shadow-lg shadow-blue-200 transition-all text-lg">
                  <FaCreditCard /> Pay ₹{finalAmount.toLocaleString('en-IN')} Now
                </button>
                <p className="text-xs text-slate-400 mt-2">Secure payment via Razorpay</p>
              </div>
            )}
          </div>

          <div className="p-8 lg:p-12 grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className={`${theme.bg} ${theme.border} border rounded-[2rem] p-8`}>
              <h3 className={`text-xl font-black ${theme.color} mb-6 flex items-center gap-3`}>{theme.icon} Shipment Details</h3>
              <div className="space-y-5">
                <SummaryRow label="Carrier" value={selectedResult.serviceProvider || selectedResult.operator || 'Not Specified'} />
                <SummaryRow label="Service" value={selectedResult.vehicleType || selectedResult.serviceName || 'Standard'} />
                <SummaryRow label="Route" value={`${selectedResult.pickupPincode || selectedResult.originStation || 'Origin'} → ${selectedResult.dropoffPincode || selectedResult.destinationStation || 'Destination'}`} />
                <SummaryRow label="Cargo" value={originalFormData.loadType || originalFormData.cargoType || 'General Cargo'} />
                <div className="pt-6 border-t border-slate-200 mt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-bold text-xs uppercase tracking-widest">Total Amount</span>
                    <span className="text-3xl font-black text-slate-900 tracking-tighter">₹{finalAmount.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white border border-slate-200 rounded-[2rem] p-8 shadow-sm">
              <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-3"><FaUser className="text-slate-400" /> Billing Info</h3>
              <div className="space-y-5">
                <SummaryRow label="Customer" value={kycDetails.companyName || 'Guest User'} />
                <SummaryRow label="GSTIN" value={kycDetails.gstin || 'N/A'} />
                <SummaryRow label="Contact" value={kycDetails.mobile || 'N/A'} />
                <SummaryRow label="Email" value={kycDetails.email || 'N/A'} />
                <div className="mt-8 p-4 bg-emerald-50 rounded-xl border border-emerald-100 flex items-start gap-3">
                  <FaInfoCircle className="text-emerald-500 mt-1" />
                  <p className="text-[11px] text-emerald-800 font-bold leading-relaxed">A confirmation email and SMS with tracking details have been sent to your registered contact info.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-8 bg-slate-900 flex flex-col sm:flex-row gap-4">
            <button onClick={() => navigate('/')} className="flex-1 py-4 bg-white/10 hover:bg-white/20 text-white rounded-2xl font-black transition-all flex items-center justify-center gap-2"><FaHome /> Back to Home</button>
            <button onClick={() => navigate('/my-bookings')} className="flex-1 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black shadow-xl transition-all flex items-center justify-center gap-2">My Bookings <FaHistory /></button>
            <button onClick={() => navigate('/track')} className="flex-1 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black shadow-xl transition-all flex items-center justify-center gap-2">Track Shipment <FaHistory /></button>
          </div>
        </div>

        <div className="mt-8 flex justify-center gap-8">
          <button className="flex items-center gap-2 text-slate-400 hover:text-blue-600 font-bold text-xs uppercase tracking-widest transition-all"><FaPrint /> Print Receipt</button>
          <button className="flex items-center gap-2 text-slate-400 hover:text-blue-600 font-bold text-xs uppercase tracking-widest transition-all"><FaDownload /> Download Invoice</button>
        </div>
      </div>
    </div>
  );
};

const SummaryRow = ({ label, value }: { label: string, value: string }) => (
  <div className="flex justify-between items-start gap-4">
    <span className="text-slate-400 font-black uppercase text-[9px] tracking-widest mt-1">{label}</span>
    <span className="text-slate-800 font-bold text-right text-sm tracking-tight">{value}</span>
  </div>
);

const LoadingState = () => (
  <div className="min-h-screen bg-white flex flex-col items-center justify-center p-10">
    <div className="animate-spin rounded-full h-14 w-14 border-4 border-blue-600 border-t-transparent mb-4"></div>
    <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Securing Booking...</p>
  </div>
);

const ErrorState = ({ navigate }: any) => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
    <div className="bg-white p-12 rounded-[3rem] shadow-xl text-center max-w-md border border-slate-200">
      <div className="w-16 h-16 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto mb-6"><FaInfoCircle size={32} /></div>
      <h2 className="text-2xl font-black text-slate-900 tracking-tight">Data Unavailable</h2>
      <p className="text-slate-500 mt-3 mb-8 font-medium leading-relaxed">We couldn't retrieve your booking summary. This usually happens if the page is refreshed or accessed directly.</p>
      <button onClick={() => navigate('/')} className="w-full bg-slate-900 text-white py-4 rounded-2xl font-black shadow-lg hover:bg-black transition-all">Return to Homepage</button>
    </div>
  </div>
);

export default BookingConfirmationPage;
