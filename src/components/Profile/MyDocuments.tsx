// src/components/Profile/MyDocuments.tsx
import React, { useEffect, useState } from 'react';
import api from '../../services/api';

interface Document {
  id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  file_url: string;
  document_type: string;
  description: string;
  created_at: string;
}

const documentTypes = [
  'GST Certificate',
  'PAN Card',
  'Trade License',
  'Import Export Code (IEC)',
  'Company Registration',
  'Insurance Certificate',
  'Other',
];

const formatSize = (bytes: number) => {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const MyDocuments: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [form, setForm] = useState({
    file_name: '',
    file_url: '',
    document_type: 'Other',
    description: '',
  });
  const [saving, setSaving] = useState(false);

  const fetchDocuments = async () => {
    try {
      const res = await api.get('/user/documents');
      setDocuments(res.data.data || []);
    } catch (err) {
      console.error('Failed to fetch documents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDocuments(); }, []);

  const handleAdd = async () => {
    if (!form.file_name || !form.file_url) {
      alert('File name and URL are required');
      return;
    }
    setSaving(true);
    try {
      const res = await api.post('/user/documents', form);
      setDocuments(prev => [res.data.data, ...prev]);
      setForm({ file_name: '', file_url: '', document_type: 'Other', description: '' });
      setShowForm(false);
    } catch (err) {
      console.error('Failed to upload document:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this document?')) return;
    setDeleting(id);
    try {
      await api.delete(`/user/documents/${id}`);
      setDocuments(prev => prev.filter(d => d.id !== id));
    } catch (err) {
      console.error('Failed to delete document:', err);
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 sm:p-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">My Documents</h1>
          <p className="text-gray-500 text-sm mt-1">Upload and manage your business documents</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 transition">
          + Add Document
        </button>
      </div>

      {/* Add document form */}
      {showForm && (
        <div className="mb-6 p-4 border border-blue-100 bg-blue-50 rounded-xl space-y-3">
          <h3 className="font-semibold text-gray-700 text-sm">Add New Document</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">File Name*</label>
              <input type="text" value={form.file_name} placeholder="e.g., GST_Certificate_2024.pdf"
                onChange={e => setForm(p => ({ ...p, file_name: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400" />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Document Type</label>
              <select value={form.document_type}
                onChange={e => setForm(p => ({ ...p, document_type: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400">
                {documentTypes.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs text-gray-500 mb-1">File URL* (Google Drive / Dropbox link)</label>
              <input type="url" value={form.file_url} placeholder="https://drive.google.com/..."
                onChange={e => setForm(p => ({ ...p, file_url: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs text-gray-500 mb-1">Description (Optional)</label>
              <input type="text" value={form.description} placeholder="e.g., Valid till Dec 2025"
                onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400" />
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <button onClick={handleAdd} disabled={saving}
              className="bg-blue-600 text-white text-sm font-semibold px-5 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50">
              {saving ? 'Saving...' : 'Save Document'}
            </button>
            <button onClick={() => setShowForm(false)}
              className="text-sm text-gray-500 px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition">
              Cancel
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-10 text-gray-400">Loading documents...</div>
      ) : documents.length === 0 ? (
        <div className="p-6 border border-gray-200 rounded-xl text-center text-gray-400 italic">
          No documents uploaded yet. Click "Add Document" to get started.
        </div>
      ) : (
        <ul className="space-y-3">
          {documents.map(doc => (
            <li key={doc.id}
              className="flex items-center justify-between border border-gray-100 rounded-xl p-4 bg-gray-50 hover:bg-gray-100 transition">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0113 3.414L16.586 7A2 2 0 0117 8.414V16a2 2 0 01-2 2H5a2 2 0 01-2-2V4zm5 2V3.5L14.5 9H10a1 1 0 01-1-1V6z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <div className="font-semibold text-gray-800 text-sm">{doc.file_name}</div>
                  <div className="text-xs text-gray-500 mt-0.5">
                    {doc.document_type} · {doc.description || 'No description'} · {new Date(doc.created_at).toLocaleDateString('en-IN')}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 ml-4">
                <a href={doc.file_url} target="_blank" rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 text-xs font-semibold">
                  View
                </a>
                <button onClick={() => handleDelete(doc.id)} disabled={deleting === doc.id}
                  className="text-red-500 hover:text-red-700 text-xs font-semibold disabled:opacity-50">
                  {deleting === doc.id ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default MyDocuments;
