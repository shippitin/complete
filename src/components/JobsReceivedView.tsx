// src/components/JobsReceivedView.tsx
//
// "Jobs Received" dashboard for partner personas (CHA, Truck Operator,
// Shipping Line, CTO, CONCOR) — incoming bookings with a status pipeline.
// Functional but minimal; styling to be polished later.
//
import React, { useState } from 'react';

type JobStatus = 'Received' | 'Accepted' | 'Scheduled' | 'In Transit' | 'Delivered';

interface Job {
  id: string;
  bookingNumber: string;
  customer: string;
  origin: string;
  destination: string;
  cargo: string;
  date: string;
  status: JobStatus;
}

// ── MOCK DATA (demo only — replace with a GET /jobs feed once it exists) ──
const MOCK_JOBS: Job[] = [
  { id: '1', bookingNumber: 'SHP-IR-100482', customer: 'Aarav Exports Pvt Ltd', origin: 'ICD Tughlakabad (TKD)', destination: 'JNPT, Nhava Sheva',   cargo: '2 × 20ft FCL — Cotton Yarn',  date: '16 Jun 2026', status: 'Received' },
  { id: '2', bookingNumber: 'SHP-IR-100479', customer: 'Meridian Logistics',    origin: 'ICD Whitefield, Bengaluru', destination: 'Chennai Port',     cargo: '1 × 40ft HC — Auto Parts',    date: '16 Jun 2026', status: 'Received' },
  { id: '3', bookingNumber: 'SHP-IR-100471', customer: 'Sunrise Agro Exports',  origin: 'CONCOR Dadri',         destination: 'Mundra Port',           cargo: '3 × 20ft — Basmati Rice',     date: '15 Jun 2026', status: 'Accepted' },
  { id: '4', bookingNumber: 'SHP-IR-100465', customer: 'TechNova Imports',      origin: 'Mundra Port',          destination: 'ICD Tughlakabad (TKD)', cargo: '1 × 40ft — Electronics',      date: '15 Jun 2026', status: 'Scheduled' },
  { id: '5', bookingNumber: 'SHP-IR-100458', customer: 'Global Pharma Ltd',     origin: 'ICD Sanand',           destination: 'JNPT, Nhava Sheva',     cargo: '1 × 20ft Reefer — Pharma',    date: '14 Jun 2026', status: 'In Transit' },
  { id: '6', bookingNumber: 'SHP-IR-100440', customer: 'Coastal Traders',       origin: 'Visakhapatnam Port',   destination: 'CONCOR Nagpur',         cargo: '2 × 20ft — Steel Coils',      date: '13 Jun 2026', status: 'Delivered' },
];

const FLOW: JobStatus[] = ['Received', 'Accepted', 'Scheduled', 'In Transit', 'Delivered'];

const STATUS_STYLES: Record<JobStatus, string> = {
  Received:     'bg-amber-50 text-amber-700 ring-amber-200',
  Accepted:     'bg-blue-50 text-blue-700 ring-blue-200',
  Scheduled:    'bg-indigo-50 text-indigo-700 ring-indigo-200',
  'In Transit': 'bg-sky-50 text-sky-700 ring-sky-200',
  Delivered:    'bg-green-50 text-green-700 ring-green-200',
};

const NEXT_ACTION: Record<JobStatus, string> = {
  Received: 'Accept',
  Accepted: 'Schedule',
  Scheduled: 'Mark in transit',
  'In Transit': 'Mark delivered',
  Delivered: '',
};

const nextStatus = (s: JobStatus): JobStatus | null => {
  const i = FLOW.indexOf(s);
  return i >= 0 && i < FLOW.length - 1 ? FLOW[i + 1] : null;
};

interface Props {
  personaLabel?: string;
}

const JobsReceivedView: React.FC<Props> = ({ personaLabel }) => {
  const [jobs, setJobs] = useState<Job[]>(MOCK_JOBS);

  const advance = (id: string) => {
    setJobs(prev =>
      prev.map(j => {
        if (j.id !== id) return j;
        const n = nextStatus(j.status);
        return n ? { ...j, status: n } : j;
      })
    );
  };

  const counts = FLOW.map(s => ({ status: s, count: jobs.filter(j => j.status === s).length }));

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Jobs Received</h1>
        <p className="text-sm text-gray-500 mt-1">
          Incoming bookings assigned to you{personaLabel ? ` · ${personaLabel}` : ''}.
        </p>
      </div>

      {/* Status summary */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
        {counts.map(c => (
          <div key={c.status} className="rounded-xl border border-gray-200 bg-white p-3">
            <div className="text-2xl font-bold text-gray-900">{c.count}</div>
            <div className="text-xs text-gray-500">{c.status}</div>
          </div>
        ))}
      </div>

      {/* Job list */}
      <div className="space-y-3">
        {jobs.map(job => {
          const action = NEXT_ACTION[job.status];
          return (
            <div
              key={job.id}
              className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-900">{job.bookingNumber}</span>
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ${STATUS_STYLES[job.status]}`}>
                    {job.status}
                  </span>
                </div>
                <div className="text-sm text-gray-700 mt-1">
                  {job.origin} <span className="text-gray-400">→</span> {job.destination}
                </div>
                <div className="text-xs text-gray-500 mt-0.5">
                  {job.cargo} · {job.customer} · {job.date}
                </div>
              </div>
              {action && (
                <button
                  onClick={() => advance(job.id)}
                  className="shrink-0 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 transition"
                >
                  {action}
                </button>
              )}
            </div>
          );
        })}
      </div>

      <p className="mt-6 text-center text-xs text-gray-400">
        Demo data — the live jobs feed connects once the partner jobs API is available.
      </p>
    </div>
  );
};

export default JobsReceivedView;
