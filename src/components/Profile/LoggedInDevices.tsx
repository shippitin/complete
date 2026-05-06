// src/components/Profile/LoggedInDevices.tsx
import React, { useEffect, useState } from 'react';
import api from '../../services/api';

interface Session {
  id: string;
  user_agent: string;
  ip_address: string;
  created_at: string;
  expires_at: string;
}

const parseDevice = (userAgent: string) => {
  if (!userAgent) return 'Unknown Device';
  if (/iPhone/i.test(userAgent)) return 'iPhone';
  if (/iPad/i.test(userAgent)) return 'iPad';
  if (/Android/i.test(userAgent)) return 'Android Device';
  if (/Windows/i.test(userAgent)) {
    if (/Chrome/i.test(userAgent)) return 'Chrome on Windows';
    if (/Firefox/i.test(userAgent)) return 'Firefox on Windows';
    if (/Edge/i.test(userAgent)) return 'Edge on Windows';
    return 'Windows Device';
  }
  if (/Mac/i.test(userAgent)) return 'Mac Device';
  if (/Linux/i.test(userAgent)) return 'Linux Device';
  return 'Unknown Device';
};

const timeAgo = (dateStr: string) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 2) return 'Just now';
  if (mins < 60) return `${mins} minutes ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs > 1 ? 's' : ''} ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days > 1 ? 's' : ''} ago`;
};

const LoggedInDevices: React.FC = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [revoking, setRevoking] = useState<string | null>(null);

  const fetchSessions = async () => {
    try {
      const res = await api.get('/user/sessions');
      setSessions(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch sessions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSessions(); }, []);

  const handleRevoke = async (id: string) => {
    setRevoking(id);
    try {
      await api.delete(`/user/sessions/${id}`);
      setSessions(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      console.error('Failed to revoke session:', err);
    } finally {
      setRevoking(null);
    }
  };

  const handleRevokeAll = async () => {
    if (!confirm('This will log you out of all other devices. Continue?')) return;
    try {
      await api.delete('/user/sessions');
      // Keep only the first session (current)
      setSessions(prev => prev.slice(0, 1));
    } catch (err) {
      console.error('Failed to revoke all sessions:', err);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 sm:p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Logged In Devices</h1>
          <p className="text-gray-500 text-sm mt-1">Manage where your Shippitin account is active</p>
        </div>
        {sessions.length > 1 && (
          <button onClick={handleRevokeAll}
            className="text-sm text-red-500 hover:text-red-700 font-semibold border border-red-200 px-3 py-1.5 rounded-lg hover:bg-red-50 transition">
            Logout All Other Devices
          </button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-10 text-gray-400">Loading sessions...</div>
      ) : sessions.length === 0 ? (
        <div className="text-center py-10 text-gray-400 italic">No active sessions found.</div>
      ) : (
        <ul className="space-y-4">
          {sessions.map((session, index) => (
            <li key={session.id}
              className="flex items-center justify-between border border-gray-100 rounded-xl p-4 bg-gray-50">
              <div className="flex items-center gap-3">
                {/* Device icon */}
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <div className="font-semibold text-gray-800 text-sm">
                    {parseDevice(session.user_agent)}
                    {index === 0 && (
                      <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Current</span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    IP: {session.ip_address || 'Unknown'} · Logged in {timeAgo(session.created_at)}
                  </div>
                </div>
              </div>
              {index !== 0 && (
                <button
                  onClick={() => handleRevoke(session.id)}
                  disabled={revoking === session.id}
                  className="text-sm text-red-500 hover:text-red-700 font-semibold ml-4 disabled:opacity-50">
                  {revoking === session.id ? 'Logging out...' : 'Logout'}
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default LoggedInDevices;
