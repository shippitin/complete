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
//  • Shippitin Customer gets a simplified email + phone + password form. full_name
//    is derived from the email so the backend's register validator still passes.
//  • Social sign-in (Google/LinkedIn) buttons are present; real OAuth needs a
//    backend token-exchange endpoint (see handleGoogle/handleLinkedIn). (post-demo)
//
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';
import { ChevronDown, Eye, EyeOff, Sparkles, UserPlus } from 'lucide-react';
import { FcGoogle } from 'react-icons/fc';
import { FaLinkedin } from 'react-icons/fa';

// ── Persona list (value = role string stored on the user) ──
const PERSONAS: { value: string; label: string; group: string }[] = [
  { value: 'importer_exporter', label: 'Importer / Exporter',                     group: 'Trade' },
  { value: 'freight_forwarder', label: 'Freight Forwarder',                       group: 'Trade' },
  { value: 'concor',            label: 'CONCOR (Container Corporation of India)',  group: 'Partner' },
  { value: 'cto',               label: 'Container Train Operator (CTO)',           group: 'Partner' },
  { value: 'cha',               label: 'Customs Agent / CHA',                     group: 'Partner' },
  { value: 'shipping_line',     label: 'Shipping Line',                           group: 'Partner' },
  { value: 'transporter',       label: 'Truck Operator',                          group: 'Partner' },
  { value: 'customer',          label: 'Shippitin Customer',                      group: 'General' },
];

// ── CONCOR sub-roles (shown only when CONCOR is selected) ──
const CONCOR_ROLES: { value: string; label: string }[] = [
  { value: 'business_associate', label: 'Business Associate' },
  { value: 'administration',     label: 'Administration' },
  { value: 'terminal_manager',   label: 'Terminal Manager' },
  { value: 'customer',           label: 'Customer' },
  { value: 'cha',                label: 'CHA (Customs House Agent)' },
  { value: 'flml',               label: 'FLML (First & Last Mile Logistics)' },
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
  importer_exporter: [
    { name: 'iec',   label: 'IEC (Importer-Exporter Code)', placeholder: 'AAAAA1234A', help: '10-character DGFT code (PAN-based)', required: true, len: 10, upper: true },
    { name: 'gstin', label: 'GSTIN', placeholder: '22AAAAA0000A1Z5', help: '15-character GST Identification Number', required: true, len: 15, upper: true },
  ],
  freight_forwarder: [
    { name: 'mto',   label: 'MTO Registration No.', placeholder: 'MTO/DGS/0000', help: 'Multimodal Transport Operator reg. (DG Shipping)', required: true, upper: true },
    { name: 'iata',  label: 'IATA Cargo Agent Code', placeholder: '00-0 0000', help: 'For air freight (optional)', required: false },
    { name: 'gstin', label: 'GSTIN', placeholder: '22AAAAA0000A1Z5', help: '15-character GST Identification Number', required: true, len: 15, upper: true },
  ],
  cto: [
    { name: 'cto_license', label: 'CTO Licence No.', placeholder: 'CTO/IR/0000', help: 'Container Train Operator licence (Indian Railways)', required: true, upper: true },
    { name: 'gstin',       label: 'GSTIN', placeholder: '22AAAAA0000A1Z5', help: '15-character GST Identification Number', required: true, len: 15, upper: true },
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
  transporter: [
    { name: 'transporter_id', label: 'GST Transporter ID', placeholder: '88AAAAA0000A1Z5', help: '15-character TRANSIN used for e-way bills', required: true, len: 15, upper: true },
    { name: 'fleet_size',     label: 'Fleet Size', placeholder: '25', help: 'Number of trucks (optional)', required: false, numeric: true },
    { name: 'gstin',          label: 'GSTIN', placeholder: '22AAAAA0000A1Z5', help: 'Optional', required: false, len: 15, upper: true },
  ],
  customer: [
    { name: 'gstin', label: 'GSTIN (Optional)', placeholder: '22AAAAA0000A1Z5', help: 'For GST-compliant invoices (optional)', required: false, len: 15, upper: true },
  ],
};

// ── Credential fields per CONCOR sub-role (sensible defaults — easy to adjust) ──
const CONCOR_FIELDS: Record<string, ExtraField[]> = {
  business_associate: [
    { name: 'ba_code', label: 'Business Associate Code', placeholder: 'BA/0000', help: 'CONCOR-issued BA code', required: true, upper: true },
    { name: 'gstin',   label: 'GSTIN', placeholder: '22AAAAA0000A1Z5', help: 'Optional', required: false, len: 15, upper: true },
  ],
  administration: [
    { name: 'employee_id', label: 'CONCOR Employee ID', placeholder: 'EMP00000', help: 'Your CONCOR staff ID', required: true, upper: true },
  ],
  terminal_manager: [
    { name: 'terminal_code', label: 'Terminal / ICD Code', placeholder: 'ICD-TKD', help: 'CONCOR terminal/ICD you manage', required: true, upper: true },
    { name: 'employee_id',   label: 'CONCOR Employee ID', placeholder: 'EMP00000', help: 'Optional', required: false, upper: true },
  ],
  customer: [
    { name: 'gstin', label: 'GSTIN', placeholder: '22AAAAA0000A1Z5', help: '15-character GST Identification Number', required: true, len: 15, upper: true },
  ],
  cha: [
    { name: 'cb_license', label: 'Customs Broker Licence No.', placeholder: 'CB/00/2024', help: 'CBLR 2018 licence issued by CBIC', required: true, upper: true },
    { name: 'gstin',      label: 'GSTIN', placeholder: '22AAAAA0000A1Z5', help: 'Optional', required: false, len: 15, upper: true },
  ],
  flml: [
    { name: 'transporter_id', label: 'GST Transporter ID', placeholder: '88AAAAA0000A1Z5', help: '15-character TRANSIN used for e-way bills', required: true, len: 15, upper: true },
    { name: 'fleet_size',     label: 'Fleet Size', placeholder: '25', help: 'Number of trucks (optional)', required: false, numeric: true },
  ],
};

// Derive a display name from the email local-part for the lite customer signup.
const deriveName = (email: string) => {
  const local = (email.split('@')[0] || '').replace(/[._\-]+/g, ' ').trim();
  return local.length >= 2 ? local : 'Shippitin Customer';
};

const SignUpPage: React.FC = () => {
  const navigate = useNavigate();

  const [role, setRole] = useState('');
  const [concorRole, setConcorRole] = useState('');
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    company_name: '',
    password: '',
  });
  const [extras, setExtras] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const isCustomer = role === 'customer';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ── Phone: fixed +91 country code; store the full value, edit local digits only ──
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, '').slice(-10); // last 10 digits
    setFormData(prev => ({ ...prev, phone: digits ? `+91 ${digits}` : '' }));
  };

  const chooseRole = (value: string) => {
    setRole(value);
    setConcorRole(''); // reset CONCOR sub-role
    setExtras({});     // clear previous persona's fields
  };

  const chooseConcorRole = (value: string) => {
    setConcorRole(value);
    setExtras({}); // clear previous sub-role's fields
  };

  const handleExtraChange = (field: ExtraField, value: string) => {
    const v = field.upper ? value.toUpperCase() : value;
    setExtras(prev => ({ ...prev, [field.name]: v }));
  };

  // Social sign-in — real OAuth needs a backend /auth/google (and /auth/linkedin)
  // endpoint to exchange the provider identity for a Shippitin JWT. Until that
  // is wired + deployed, point users to email signup so nothing silently fails.
  const handleGoogle = () => {
    toast('Google sign-in is being set up — please continue with email for now.', { icon: '🔧' });
  };
  const handleLinkedIn = () => {
    toast('LinkedIn sign-in is being set up — please continue with email for now.', { icon: '🔧' });
  };

  // Active credential fields depend on the persona — and the CONCOR sub-role.
  // The lite customer form collects no trade credentials.
  const roleFields = isCustomer
    ? []
    : role === 'concor'
      ? (CONCOR_FIELDS[concorRole] || [])
      : (ROLE_FIELDS[role] || []);

  const handleSignup = async () => {
    // ── validation (common) ──
    if (!formData.email || !formData.phone || !formData.password) {
      toast.error('Please fill in all required fields.');
      return;
    }
    if (!isCustomer && !formData.full_name) {
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
    if (role === 'concor' && !concorRole) {
      toast.error('Please select your role at CONCOR.');
      return;
    }
    // ── validation (persona-specific) ──
    for (const f of roleFields) {
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
      // Customer has no name field — derive it from the email so the validator passes.
      const full_name = isCustomer ? deriveName(formData.email) : formData.full_name;
      const payload = {
        full_name,
        email: formData.email,
        phone: formData.phone,
        company_name: formData.company_name,
        password: formData.password,
      };

      const response = await authAPI.register(payload);
      const { token, refreshToken, user } = response.data.data;

      // ── attach persona + codes to the user on the client so role-based
      //    screens work immediately (server persistence is a post-demo follow-up) ──
      const baseLabel = PERSONAS.find(p => p.value === role)?.label || role;
      const concorLabel = CONCOR_ROLES.find(c => c.value === concorRole)?.label;
      const persona_label = role === 'concor' && concorLabel ? `CONCOR — ${concorLabel}` : baseLabel;

      const enrichedUser = {
        ...user,
        role,
        concor_role: role === 'concor' ? concorRole : undefined,
        persona_label,
        profile: {
          ...extras,
          ...(role === 'concor' ? { concor_role: concorRole } : {}),
        },
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

  const selectBase =
    'w-full appearance-none rounded-xl border border-gray-300 bg-white px-4 py-3 pr-10 text-sm ' +
    'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition ';
  const selectClassFor = (filled: boolean) => selectBase + (filled ? 'text-gray-800' : 'text-gray-400');

  const groupOrder = Array.from(new Set(PERSONAS.map(p => p.group)));
  const credentialsLabel =
    role === 'concor'
      ? (CONCOR_ROLES.find(c => c.value === concorRole)?.label || 'CONCOR')
      : (PERSONAS.find(p => p.value === role)?.label || '');
  const phoneLocal = formData.phone.replace(/^\+91\s?/, '');
  const HeaderIcon = isCustomer ? Sparkles : UserPlus;

  // ── Reusable field blocks (shared by the full and lite forms) ──
  const emailField = (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Email Address <span className="text-red-500">*</span></label>
      <input type="email" name="email" value={formData.email} onChange={handleChange}
        className={fieldClass} placeholder="you@company.com" />
    </div>
  );

  const phoneField = (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number <span className="text-red-500">*</span></label>
      <div className="flex rounded-xl border border-gray-300 overflow-hidden transition focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent">
        <span className="inline-flex items-center gap-1 px-3 bg-gray-50 border-r border-gray-300 text-sm text-gray-600 select-none">
          🇮🇳 +91
        </span>
        <input
          type="tel"
          inputMode="numeric"
          value={phoneLocal}
          onChange={handlePhoneChange}
          className="flex-1 px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none"
          placeholder="98765 43210"
        />
      </div>
    </div>
  );

  const passwordField = (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Password <span className="text-red-500">*</span></label>
      <div className="relative">
        <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange}
          className={fieldClass + ' pr-10'} placeholder="At least 6 characters" />
        <button type="button" onClick={() => setShowPassword(s => !s)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );

  const socialButtons = (
    <div className="space-y-3">
      <div className="flex items-center gap-3 text-xs text-gray-400">
        <div className="h-px flex-1 bg-gray-200" />
        or
        <div className="h-px flex-1 bg-gray-200" />
      </div>
      <button type="button" onClick={handleGoogle}
        className="w-full flex items-center justify-center gap-3 border border-gray-300 rounded-xl py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition">
        <FcGoogle className="h-5 w-5" /> Continue with Google
      </button>
      <button type="button" onClick={handleLinkedIn}
        className="w-full flex items-center justify-center gap-3 border border-gray-300 rounded-xl py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition">
        <FaLinkedin className="h-5 w-5 text-[#0A66C2]" /> Continue with LinkedIn
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-gray-50 flex items-start justify-center px-4 pt-6 pb-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl ring-1 ring-gray-100 p-6 sm:p-8">
          <div className="mb-6">
            <div className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/20">
              <HeaderIcon className="h-5 w-5" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-gray-900">
              {isCustomer ? 'Let’s get started' : 'Create your account'}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              {isCustomer
                ? 'Shipping. Simplified.'
                : 'Tell us who you are — we’ll ask only for the credentials that apply.'}
            </p>
          </div>

          <div className="space-y-4">
            {/* Role dropdown (grouped) — always shown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                I am a… <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <select
                  value={role}
                  onChange={e => chooseRole(e.target.value)}
                  className={selectClassFor(!!role)}
                >
                  <option value="">Select your role</option>
                  {groupOrder.map(group => (
                    <optgroup key={group} label={group}>
                      {PERSONAS.filter(p => p.group === group).map(p => (
                        <option key={p.value} value={p.value}>{p.label}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
            </div>

            {isCustomer ? (
              /* ── Lite customer form (email + phone + password + social) ── */
              <div className="animate-fade-in space-y-4">
                {emailField}
                {phoneField}
                {passwordField}

                <button onClick={handleSignup} disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold shadow-sm transition active:scale-[0.99] disabled:opacity-50">
                  {loading ? 'Creating account…' : 'Create your free account'}
                </button>

                {socialButtons}

                <p className="text-xs text-gray-400 leading-relaxed">
                  By signing up, you agree to Shippitin’s Terms & Conditions. You can opt out of
                  freight updates and marketing communications at any time.
                </p>
              </div>
            ) : (
              /* ── Full persona form ── */
              <>
                {/* CONCOR sub-role dropdown (only when CONCOR is selected) */}
                {role === 'concor' && (
                  <div className="animate-fade-in">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Your role at CONCOR <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        value={concorRole}
                        onChange={e => chooseConcorRole(e.target.value)}
                        className={selectClassFor(!!concorRole)}
                      >
                        <option value="">Select your CONCOR role</option>
                        {CONCOR_ROLES.map(c => (
                          <option key={c.value} value={c.value}>{c.label}</option>
                        ))}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                )}

                {/* Full Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name <span className="text-red-500">*</span></label>
                  <input type="text" name="full_name" value={formData.full_name} onChange={handleChange}
                    className={fieldClass} placeholder="John Doe" />
                </div>

                {emailField}
                {phoneField}

                {/* Company */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company Name <span className="text-gray-400 font-normal">(optional)</span></label>
                  <input type="text" name="company_name" value={formData.company_name} onChange={handleChange}
                    className={fieldClass} placeholder="Your Company Pvt Ltd" />
                </div>

                {/* Persona-specific credential fields */}
                {roleFields.length > 0 && (
                  <div className="animate-fade-in rounded-xl border border-blue-100 bg-blue-50/50 p-4 space-y-4">
                    <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide">
                      {credentialsLabel} — required credentials
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

                {passwordField}

                <button onClick={handleSignup} disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-semibold shadow-sm transition active:scale-[0.99] disabled:opacity-50">
                  {loading ? 'Creating account…' : 'Create account'}
                </button>
              </>
            )}
          </div>

          <p className="mt-5 text-center text-sm text-gray-500">
            Already have an account?{' '}
            <span className="text-blue-600 hover:underline cursor-pointer font-semibold" onClick={() => navigate('/login')}>
              Log in
            </span>
          </p>
        </div>

        <p className="mt-6 text-center text-xs text-gray-400">
          🔒 Your trade credentials are used only to verify your business.
        </p>
      </div>
    </div>
  );
};

export default SignUpPage;
