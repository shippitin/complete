// src/components/dashboards/PersonaDashboard.tsx
//
// Generic, data-driven dashboard renderer. Each persona supplies a
// DashboardConfig (header + quick actions + stat cards + a primary table);
// this component renders it. Keeps every persona's screen distinct while
// sharing one well-tested layout. Styling intentionally minimal for now.
//
import React from 'react';
import { useNavigate } from 'react-router-dom';

export interface DashStat {
  label: string;
  value: string;
}
export interface DashColumn {
  key: string;
  label: string;
}
export type DashRow = Record<string, string>;
export interface DashAction {
  label: string;
  to?: string;
}
export interface DashboardConfig {
  title: string;
  subtitle: string;
  actions?: DashAction[];
  stats: DashStat[];
  tableTitle: string;
  columns: DashColumn[];
  rows: DashRow[];
  statusKey?: string; // which column renders as a status badge
  note?: string;
}

const brandGradient = { background: 'linear-gradient(to right, #53b2fe, #065af3)' };

const statusColor = (status: string): string => {
  const s = status.toLowerCase();
  if (/(deliver|cleared|complete|paid|done|confirm|active)/.test(s)) return 'bg-green-50 text-green-700 ring-green-200';
  if (/(transit|en route|sail|schedul|assess|process|loading|unloading|departed|booking|allot)/.test(s)) return 'bg-blue-50 text-blue-700 ring-blue-200';
  if (/(pending|await|received|filed|query|examination|maintenance|hold|congest|pickup)/.test(s)) return 'bg-amber-50 text-amber-700 ring-amber-200';
  return 'bg-gray-100 text-gray-600 ring-gray-200';
};

const PersonaDashboard: React.FC<{ config: DashboardConfig }> = ({ config }) => {
  const navigate = useNavigate();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div style={brandGradient} className="rounded-2xl px-6 py-5 text-white mb-6 shadow-sm">
        <h1 className="text-xl font-bold">{config.title}</h1>
        <p className="text-sm text-blue-50/90 mt-0.5">{config.subtitle}</p>
        {config.actions && config.actions.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {config.actions.map(a => (
              <button
                key={a.label}
                onClick={() => a.to && navigate(a.to)}
                className="rounded-lg bg-white/15 hover:bg-white/25 ring-1 ring-white/30 text-white text-sm font-medium px-3 py-1.5 transition"
              >
                {a.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {config.stats.map(s => (
          <div key={s.label} className="rounded-xl border border-gray-200 bg-white p-4">
            <div className="text-2xl font-bold text-gray-900">{s.value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Primary table */}
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-900">{config.tableTitle}</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-500 bg-gray-50">
                {config.columns.map(c => (
                  <th key={c.key} className="px-4 py-2 font-medium whitespace-nowrap">{c.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {config.rows.map((row, i) => (
                <tr key={i} className="border-t border-gray-100">
                  {config.columns.map(c => (
                    <td key={c.key} className="px-4 py-2.5 whitespace-nowrap text-gray-700">
                      {config.statusKey === c.key ? (
                        <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ring-1 ${statusColor(row[c.key] || '')}`}>
                          {row[c.key]}
                        </span>
                      ) : (
                        row[c.key]
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {config.note && <p className="mt-4 text-center text-xs text-gray-400">{config.note}</p>}
    </div>
  );
};

export default PersonaDashboard;
