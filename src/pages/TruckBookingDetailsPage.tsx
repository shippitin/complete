import React, { useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { bookingAPI } from '../services/api';

interface SelectedResult {
  price: number;
  pickupPincode: string;
  dropoffPincode: string;
  serviceProvider: string;
  vehicleType: string;
  mode?: string;
}

interface FormData {
  name: string;
  email: string;
  phone: string;
  company: string;
  gstin: string;
  kycType: string;
  insurance: boolean;
}

const Icons = {
  ArrowLeft: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>,
  ArrowRight: () => <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>,
  Truck: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1" /></svg>,
  CheckCircle: () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  CloudUpload: () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
};

const TruckBookingDetailsPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get real data from location state or fall back to defaults
  const stateResult = location.state?.selectedResult;
  const originalFormData = location.state?.originalFormData;

  const selectedResult: SelectedResult = stateResult || {
    price: 12500,
    pickupPincode: '400001',
    dropoffPincode: '560001',
    serviceProvider: 'BlueDart Logistics',
    vehicleType: '32ft MX Container',
    mode: 'truck',
  };

  const [formData, setFormData] = useState<FormData>({
    name: '', email: '', phone: '', company: '', gstin: '',
    kycType: 'GST Certificate', insurance: true
  });
  const [kycFile, setKycFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const insuranceAmount = formData.insurance ? Math.round(selectedResult.price * 0.02) : 0;
  const totalAmount = selectedResult.price + insuranceAmount;

  const handleSubmit = async () => {
    if (!formData.name || !formData.email || !formData.phone) {
      alert('Please fill in your Name, Email, and Phone Number.');
      return;
    }

    setLoading(true);

    const bookingId = `TRK-${Date.now().toString().slice(-6)}-${Math.floor(Math.random() * 1000)}`;

    try {
      await bookingAPI.create({
        booking_number: bookingId,
        service_type: 'Truck',
        origin: selectedResult.pickupPincode,
        destination: selectedResult.dropoffPincode,
        cargo_type: (originalFormData as any)?.cargoType || 'General',
        weight: (originalFormData as any)?.weight || 0,
        booking_date: new Date().toISOString().split('T')[0],
        estimated_price: totalAmount,
        special_instructions: '',
        status: 'confirmed',
      });
    } catch (error) {
      console.error('Failed to save booking:', error);
    } finally {
      setLoading(false);
    }

    const bookingDetails = {
      selectedResult: {
        ...selectedResult,
        mode: 'truck',
        operator: selectedResult.serviceProvider,
      },
      originalFormData,
      kycDetails: {
        companyName: formData.company || 'N/A',
        gstin: formData.gstin || 'N/A',
        mobile: formData.phone,
        email: formData.email,
      },
      bookingDate: new Date().toLocaleDateString('en-IN'),
      bookingTime: new Date().toLocaleTimeString('en-IN'),
      bookingId,
      finalAmount: totalAmount,
    };

    navigate('/booking-confirmation', { state: { bookingDetails } });
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-slate-700">
      <nav className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="flex items-center text-slate-500 hover:text-blue-600 font-medium transition-colors group">
            <span className="group-hover:-translate-x-1 transition-transform"><Icons.ArrowLeft /></span>
            <span className="ml-2">Back to Rates</span>
          </button>
          <div className="flex items-center gap-8 text-[11px] font-bold tracking-widest text-slate-400 uppercase">
            <span className="text-blue-600 border-b-2 border-blue-600 pb-1">01 Details</span>
            <span>02 Payment</span>
            <span>03 Confirm</span>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          <div className="lg:col-span-7 space-y-12">
            <section>
              <h2 className="text-xl font-bold text-slate-800 mb-8 flex items-center gap-3">
                <span className="w-7 h-7 bg-blue-600 text-white rounded-md flex items-center justify-center text-xs">1</span>
                Consignor details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <InputGroup label="Contact name" value={formData.name} onChange={(v: string) => setFormData({...formData, name: v})} placeholder="e.g. Rahul Sharma" required />
                <InputGroup label="Phone number" value={formData.phone} onChange={(v: string) => setFormData({...formData, phone: v})} placeholder="+91" required />
                <div className="md:col-span-2">
                  <InputGroup label="Email address" value={formData.email} onChange={(v: string) => setFormData({...formData, email: v})} placeholder="rahul@company.com" required />
                </div>
                <InputGroup label="Company name" value={formData.company} onChange={(v: string) => setFormData({...formData, company: v})} placeholder="Business name" required={false} />
                <InputGroup label="GST number" value={formData.gstin} onChange={(v: string) => setFormData({...formData, gstin: v})} placeholder="Optional" required={false} />
              </div>
            </section>

            <section>
              <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-3">
                <span className="w-7 h-7 bg-blue-600 text-white rounded-md flex items-center justify-center text-xs">2</span>
                KYC verification
              </h2>
              <div
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center transition-all cursor-pointer ${kycFile ? 'bg-green-50/30 border-green-200' : 'bg-slate-50/50 border-slate-200 hover:border-blue-600'}`}
              >
                <input type="file" ref={fileInputRef} className="hidden" onChange={(e) => setKycFile(e.target.files?.[0] || null)} />
                <div className={`mb-3 ${kycFile ? 'text-green-500' : 'text-blue-600'}`}>
                  {kycFile ? <Icons.CheckCircle /> : <Icons.CloudUpload />}
                </div>
                <p className="text-sm font-semibold text-slate-700">{kycFile ? kycFile.name : "Upload business certificate (GST/Trade)"}</p>
                <p className="text-[11px] text-slate-400 mt-1 uppercase tracking-tight">PDF or Image up to 5MB</p>
              </div>
            </section>

            <section className="bg-slate-50/80 p-5 rounded-xl border border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <input type="checkbox" checked={formData.insurance} onChange={() => setFormData({...formData, insurance: !formData.insurance})} className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600" />
                <div>
                  <p className="text-sm font-bold text-slate-800">Add transit insurance</p>
                  <p className="text-xs text-slate-500">Protection against theft, damage & transit loss</p>
                </div>
              </div>
              <p className="text-sm font-bold text-blue-600">+ ₹{insuranceAmount.toLocaleString()}</p>
            </section>
          </div>

          <div className="lg:col-span-5">
            <div className="sticky top-28 bg-white rounded-2xl p-8 border border-slate-200 shadow-sm">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">Booking summary</h3>
              
              <div className="flex items-center justify-between mb-8 pb-6 border-b border-slate-50">
                <div className="text-center">
                  <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Origin</p>
                  <p className="text-sm font-bold text-slate-800">{selectedResult.pickupPincode}</p>
                </div>
                <div className="flex-1 flex flex-col items-center opacity-20">
                  <Icons.Truck />
                  <div className="w-full h-px bg-slate-400 mt-2"></div>
                </div>
                <div className="text-center">
                  <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Dropoff</p>
                  <p className="text-sm font-bold text-slate-800">{selectedResult.dropoffPincode}</p>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <SummaryRow label="Carrier" value={selectedResult.serviceProvider} />
                <SummaryRow label="Vehicle" value={selectedResult.vehicleType} />
                <div className="pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-500">Base freight</span>
                    <span className="font-semibold text-slate-800">₹{selectedResult.price.toLocaleString()}</span>
                  </div>
                  {formData.insurance && (
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Insurance</span>
                      <span className="font-semibold text-slate-800">₹{insuranceAmount.toLocaleString()}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 mb-8">
                <div className="flex justify-between items-end">
                  <span className="text-sm font-bold text-slate-800">Total payable</span>
                  <div className="text-right">
                    <p className="text-3xl font-bold text-slate-900 leading-none">₹{totalAmount.toLocaleString()}</p>
                    <p className="text-[10px] text-slate-400 font-medium mt-1">Inclusive of all taxes</p>
                  </div>
                </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full bg-blue-600 hover:opacity-90 text-white py-4 rounded-xl font-bold text-md transition-all flex items-center justify-center gap-3 shadow-lg shadow-blue-100 group disabled:opacity-50"
              >
                {loading ? (
                  <span className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></span>
                ) : (
                  <>Proceed to payment <span className="group-hover:translate-x-1 transition-transform"><Icons.ArrowRight /></span></>
                )}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

const SummaryRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between items-center text-xs">
    <span className="text-slate-400 font-semibold uppercase tracking-wider">{label}</span>
    <span className="font-bold text-slate-700">{value}</span>
  </div>
);

const InputGroup = ({ label, value, onChange, placeholder, required }: any) => (
  <div className="flex flex-col gap-2">
    <label className="text-xs font-bold text-slate-500 ml-0.5">
      {label} {required && <span className="text-red-400">*</span>}
    </label>
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-600/5 focus:border-blue-600 transition-all"
    />
  </div>
);

export default TruckBookingDetailsPage;
