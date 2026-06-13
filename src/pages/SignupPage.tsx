// src/pages/SignUpPage.tsx
//
// Persona-aware signup. Each persona collects its real trade credentials
// (IEC, Customs Broker licence, SCAC, MTO reg, GST Transporter ID, CTO licence, GSTIN).
//
// IMPORTANT — logic preserved:
//  • The backend register() call sends the SAME 5 fields as before
//    (full_name, email, phone, company_name, password) so your existing
//    validator can never reject the new data. No backend change needed for the demo.
//  • The selected persona + its codes are attached to the user object saved in
//    localStorage, so role-based screens can read `user.role` immediately.
//  • To persist the codes server-side later: add columns to `users`, accept them
//    in the register endpoint, then add them to the payload below. (post-demo)
//
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

// ── Persona list (value = role string stored on the user) ──
const PERSONAS: { value: string; label: string; group: string }[] = [
  { value: 'exporter',            label: 'Shipper / Exporter',              group: 'Trade' },
  { value: 'importer',            label: 'Importer / Consignee',            group: 'Trade' },
  { value: 'freight_forwarder',   label: 'Freight Forwarder',               group: 'Trade' },
  { value: 'cha',                 label: 'Customs Agent / CHA',             group: 'Partner' },
  { value: 'shipping_line',       label: 'Shipping Line',                   group: 'Partner' },
  { value: 'shipping_line_agent', label: 'Shipping Line Agent',             group: 'Partner' },
  { value: 'transporter',         label: 'Transporter / Truck Operator',    group: 'Partner' },
  { value: 'cto',                 label: 'Container Train Operator (CONCOR/CTO)', group: 'Partner' },
  { value: 'customer',            label: 'Shippitin Customer',              group: 'General' },
];

type ExtraField = {
  name: string;
  label: string;
  placeholder: string;
  help?: string;
  required?: boolean;
  len?: number;        // exact length check (only when a value is entered)
  upper?: boolean;     // auto-uppercase (codes)
  numeric?: boolean;   // input type number
};

// ── Real-world credential fields per persona ──
const ROLE_FIELDS: Record<string, ExtraField[]> = {
  exporter: [
    { name: 'iec',   label: 'IEC (Importer-Exporter Code)', placeholder: 'AAAAA1234A', help: '10-character DGFT code (PAN-based)', required: true, len: 10, upper: true },
    { name: 'gstin', label: 'GSTIN', placeholder: '22AAAAA0000A1Z5', help: '15-character GST Identification Number', required: true, len: 15, upper: true },
  ],
  importer: [
    { name: 'iec',   label: 'IEC (Importer-Exporter Code)', placeholder: 'AAAAA1234A', help: '10-character DGFT code (PAN-based)', required: true, len: 10, upper: true },
    { name: 'gstin', label: 'GSTIN', placeholder: '22AAAAA0000A1Z5', help: '15-character GST Identification Number', required: true, len: 15, upper: true },
  ],
  freight_forwarder: [
    { name: 'mto',   label: 'MTO Registration No.', placeholder: 'MTO/DGS/0000', help: 'Multimodal Transport Operator reg. (DG Shipping)', required: true, upper: true },
    { name: 'iata',  label: 'IATA Cargo Agent Code', placeholder: '00-0 0000', help: 'For air freight (optional)', required: false },
    { name: 'gstin', label: 'GSTIN', placeholder: '22AAAAA0000A1Z5', help: '15-character GST Identification Number', required: true, len: 15, upper: true },
  ],
  cha: [
    { name: 'cb_license', label: 'Customs Broker Licence No.', placeholder: 'CB/00/2024', help: 'CBLR 2018 licence issued by CBIC', required: true, upper: true },
    { name: 'gstin',      label: 'GSTIN', placeholder: '22AAAAA0000A1Z5', help: '15-character GST Identification Number', required: true, len: 15, upper: true },
  ],
  shipping_line: [
    { name: 'scac',  label: 'SCAC Code', placeholder: 'MAEU', help: 'Standard Carrier Alpha Code (2–4 letters)', required: true, upper: true },
    { name: 'imo',   label: 'IMO Company Number', placeholder: '1234567', help: '7-digit IMO identifier (optional)', required: false, len: 7, numeric: true },
    { name: 'gstin', label: 'GSTIN', placeholder: '22AAAAA0000A1Z5', help: '15-character GST Identification Number', required: true, len: 15, upper: true },
  ],
  shipping_line_agent: [
    { name: 'agency_code', label: 'Agency / MLO Code', placeholder: 'AGT-0000', help: 'Main Line Operator / agency code', required: true, upper: true },
    { name: 'gstin',       label: 'GSTIN', placeholder: '22AAAAA0000A1Z5', help: '15-character GST Identification Number', required: true, len: 15, upper: true },
  ],
  transporter: [
    { name: 'transporter_id', label: 'GST Transporter ID', placeholder: '88AAAAA0000A1Z5', help: '15-character TRANSIN used for e-way bills', required: true, len: 15, upper: true },
    { name: 'fleet_size',     label: 'Fleet Size', placeholder: '25', help: 'Number of trucks (optional)', required: false, numeric: true },
    { name: 'gstin',          label: 'GSTIN', placeholder: '22AAAAA0000A1Z5', help: 'Optional', required: false, len: 15, upper: true },
  ],
  cto: [
    { name: 'cto_license', label: 'CTO Licence No.', placeholder: 'CTO/IR/0000', help: 'Container Train Operator licence (Indian Railways)', required: true, upper: true },
    { name: 'gstin',       label: 'GSTIN', placeholder: '22AAAAA0000A1Z5', help: '15-character GST Identification Number', required: true, len: 15, upper: true },
  ],
  customer: [
    { name: 'gstin', label: 'GSTIN (Optional)', placeholder: '22AAAAA0000A1Z5', help: 'For GST-compliant invoices (optional)', required: false, len: 15, upper: true },
  ],
};

const SignUpPage: React.FC = () => {
  const navigate = useNavigate();

  const [role, setRole] = useState('');
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    company_name: '',
    password: '',
  });
  const [extras, setExtras] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const chooseRole = (value: string) => {
    setRole(value);
    setExtras({}); // clear previous persona's fields
  };

  const handleExtraChange = (field: ExtraField, value: string) => {
    const v = field.upper ? value.toUpperCase() : value;
    setExtras(prev => ({ ...prev, [field.name]: v }));
  };

  const handleSignup = async () => {
    // ── validation (common) ──
    if (!formData.full_name || !formData.email || !formData.phone || !formData.password) {
      toast.error('Please fill in all required fields.');
      return;
    }
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters.');
      return;
    }
    if (!role) {
      toast.error('Please select your persona / role.');
      return;
    }
    // ── validation (persona-specific) ──
    const fields = ROLE_FIELDS[role] || [];
    for (const f of fields) {
      const val = (extras[f.name] || '').trim();
      if (f.required && !val) {
        toast.error(`${f.label} is required.`);
        return;
      }
      if (val && f.len && val.length !== f.len) {
        toast.error(`${f.label} should be ${f.len} characters.`);
        return;
      }
    }

    setLoading(true);
    try {
      // ── KEEP backend payload identical (no new fields => no validator rejection) ──
      const payload = {
        full_name: formData.full_name,
        email: formData.email,
        phone: formData.phone,
        company_name: formData.company_name,
        password: formData.password,
      };

      const response = await authAPI.register(payload);
      const { token, refreshToken, user } = response.data.data;

      // ── attach persona + codes to the user on the client so role-based
      //    screens work immediately (server persistence is a post-demo follow-up) ──
      const enrichedUser = {
        ...user,
        role,
        persona_label: PERSONAS.find(p => p.value === role)?.label || role,
        profile: { ...extras },
      };

      localStorage.setItem('shippitin_token', token);
      localStorage.setItem('shippitin_refresh_token', refreshToken);
      localStorage.setItem('shippitin_user', JSON.stringify(enrichedUser));

      toast.success(`Welcome to Shippitin, ${user.full_name?.split(' ')[0]}! 🎉`);
      navigate('/verify-email');
    } catch (err: any) {
      const message = err.response?.data?.message || 'Signup failed';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const fieldClass =
    'w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-800 placeholder-gray-400 ' +
    'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition';

  const roleFields = ROLE_FIELDS[role] || [];
  const selectedPersona = PERSONAS.find(p => p.value === role);
  const groupOrder = Array.from(new Set(PERSONAS.map(p => p.group)));

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-gray-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg">
        {/* Brand badge */}
        <div className="text-center mb-5">
          <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-xs font-semibold text-blue-700 shadow-sm ring-1 ring-blue-100">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
            Join Shippitin
          </span>
        </div>

        <div className="bg-white rounded-2xl shadow-xl ring-1 ring-gray-100 p-6 sm:p-8">
          <h2 className="text-2xl font-bold text-center text-gray-900">
            Create your account
          </h2>
          <p className="text-center text-sm text-gray-500 mt-1 mb-6">
            Pick your role — we’ll ask only for the credentials that apply to you.
          </p>

          <div className="space-y-5">
            {/* Persona selector — grouped pills */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                I am a… <span className="text-red-500">*</span>
              </label>
              <div className="space-y-3">
                {groupOrder.map(group => (
                  <div key={group}>
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400 mb-1.5">{group}</p>
                    <div className="flex flex-wrap gap-2">
                      {PERSONAS.filter(p => p.group === group).map(p => {
                        const active = role === p.value;
                        return (
                          <button
                            key={p.value}
                            type="button"
                            onClick={() => chooseRole(p.value)}
                            className={
                              'rounded-full border px-3.5 py-1.5 text-sm transition active:scale-95 ' +
                              (active
                                ? 'border-blue-600 bg-blue-50 text-blue-700 font-semibold ring-1 ring-blue-600'
                                : 'border-gray-200 bg-white text-gray-600 hover:border-blue-300 hover:bg-blue-50')
                            }
                          >
                            {p.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Common fields */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name <span className="text-red-500">*</span></label>
              <input type="text" name="full_name" value={formData.full_name} onChange={handleChange}
                className={fieldClass} placeholder="John Doe" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address <span className="text-red-500">*</span></label>
              <input type="email" name="email" value={formData.email} onChange={handleChange}
                className={fieldClass} placeholder="you@example.com" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number <span className="text-red-500">*</span></label>
              <input type="tel" name="phone" value={formData.phone} onChange={handleChange}
                className={fieldClass} placeholder="+91 9876543210" />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company Name <span className="text-gray-400 font-normal">(optional)</span></label>
              <input type="text" name="company_name" value={formData.company_name} onChange={handleChange}
                className={fieldClass} placeholder="Your Company Pvt Ltd" />
            </div>

            {/* Persona-specific credential fields */}
            {role && roleFields.length > 0 && (
              <div className="animate-fade-in rounded-xl border border-blue-100 bg-blue-50/50 p-4 space-y-4">
                <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide">
                  {selectedPersona?.label} — required credentials
                </p>
                {roleFields.map(f => (
                  <div key={f.name}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {f.label} {f.required && <span className="text-red-500">*</span>}
                    </label>
                    <input
                      type={f.numeric ? 'number' : 'text'}
                      value={extras[f.name] || ''}
                      onChange={e => handleExtraChange(f, e.target.value)}
                      className={fieldClass}
                      placeholder={f.placeholder}
                    />
                    {f.help && <p className="text-xs text-gray-400 mt-1">{f.help}</p>}
                  </div>
                ))}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password <span className="text-red-500">*</span></label>
              <input type="password" name="password" value={formData.password} onChange={handleChange}
                className={fieldClass} placeholder="••••••••" />
            </div>

            <button onClick={handleSignup} disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold shadow-sm transition active:scale-[0.99] disabled:opacity-50">
              {loading ? 'Creating account…' : 'Sign Up'}
            </button>
          </div>

          <p className="mt-5 text-center text-sm text-gray-500">
            Already have an account?{' '}
            <span className="text-blue-600 hover:underline cursor-pointer font-semibold" onClick={() => navigate('/login')}>
              Login
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
