'use client';

import { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';

const ACTION_COLORS = {
  CREATE: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  UPDATE: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  DELETE: 'bg-red-500/20 text-red-400 border-red-500/30',
};

const ENTITY_TYPES = [
  'Article', 'Schedule', 'Supplier', 'User',
  'Brand', 'Buyer', 'Category', 'Window', 'Ingredient',
];

function formatDate(dateStr) {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleString('id-ID', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function DiffView({ oldValues, newValues, action }) {
  if (action === 'CREATE') {
    return (
      <div>
        <p className="text-xs text-gray-400 mb-1">Data dibuat:</p>
        <pre className="text-xs text-gray-300 bg-gray-900 rounded-lg p-3 overflow-auto max-h-48 whitespace-pre-wrap">
          {JSON.stringify(newValues, null, 2)}
        </pre>
      </div>
    );
  }
  if (action === 'DELETE') {
    return (
      <div>
        <p className="text-xs text-gray-400 mb-1">Data sebelum dihapus:</p>
        <pre className="text-xs text-gray-300 bg-gray-900 rounded-lg p-3 overflow-auto max-h-48 whitespace-pre-wrap">
          {JSON.stringify(oldValues, null, 2)}
        </pre>
      </div>
    );
  }
  // UPDATE: show diff
  const allKeys = new Set([
    ...Object.keys(oldValues || {}),
    ...Object.keys(newValues || {}),
  ]);
  const ignoredKeys = ['_id', '__v', 'created_at', 'updated_at'];
  const changedKeys = [...allKeys].filter(k => {
    if (ignoredKeys.includes(k)) return false;
    return JSON.stringify(oldValues?.[k]) !== JSON.stringify(newValues?.[k]);
  });

  if (changedKeys.length === 0) {
    return <p className="text-xs text-gray-500">Tidak ada perubahan terdeteksi</p>;
  }

  return (
    <div className="space-y-2">
      {changedKeys.map(key => (
        <div key={key} className="text-xs">
          <span className="text-gray-400 font-medium">{key}:</span>
          <div className="flex gap-2 mt-0.5">
            <span className="flex-1 bg-red-900/30 text-red-300 rounded px-2 py-1 font-mono">
              {String(oldValues?.[key] ?? '-')}
            </span>
            <span className="text-gray-500 self-center">→</span>
            <span className="flex-1 bg-emerald-900/30 text-emerald-300 rounded px-2 py-1 font-mono">
              {String(newValues?.[key] ?? '-')}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function AuditPage() {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [expandedRow, setExpandedRow] = useState(null);

  const [filters, setFilters] = useState({
    entity_type: '',
    action: '',
    start_date: '',
    end_date: '',
  });
  const [page, setPage] = useState(1);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({ page, limit: 50 });
      if (filters.entity_type) params.set('entity_type', filters.entity_type);
      if (filters.action) params.set('action', filters.action);
      if (filters.start_date) params.set('start_date', filters.start_date);
      if (filters.end_date) params.set('end_date', filters.end_date);

      const res = await fetch(`/api/audit-logs?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setLogs(data.logs || []);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } catch (e) {
      console.error('Fetch audit logs error:', e);
    } finally {
      setLoading(false);
    }
  }, [page, filters]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  function handleFilterChange(e) {
    setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setPage(1);
  }

  function toggleRow(id) {
    setExpandedRow(prev => (prev === id ? null : id));
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-white">Audit Trail</h1>
          <p className="text-gray-400 text-sm mt-1">Riwayat seluruh aktivitas perubahan data</p>
        </div>

        {/* Filters */}
        <div className="card p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Tipe Data</label>
              <select
                name="entity_type"
                value={filters.entity_type}
                onChange={handleFilterChange}
                className="input-field w-full text-sm"
              >
                <option value="">Semua</option>
                {ENTITY_TYPES.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Aksi</label>
              <select
                name="action"
                value={filters.action}
                onChange={handleFilterChange}
                className="input-field w-full text-sm"
              >
                <option value="">Semua</option>
                <option value="CREATE">CREATE</option>
                <option value="UPDATE">UPDATE</option>
                <option value="DELETE">DELETE</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Dari Tanggal</label>
              <input
                type="date"
                name="start_date"
                value={filters.start_date}
                onChange={handleFilterChange}
                className="input-field w-full text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Sampai Tanggal</label>
              <input
                type="date"
                name="end_date"
                value={filters.end_date}
                onChange={handleFilterChange}
                className="input-field w-full text-sm"
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="card overflow-hidden">
          <div className="p-4 border-b border-gray-700/50 flex items-center justify-between">
            <p className="text-sm text-gray-400">
              Total: <span className="text-white font-semibold">{total}</span> entri
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-16">
              <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <svg className="w-12 h-12 mx-auto mb-3 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p>Tidak ada data audit</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-700/50">
                    <th className="text-left py-3 px-4 text-gray-400 font-medium text-xs uppercase tracking-wider">Waktu</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium text-xs uppercase tracking-wider">User</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium text-xs uppercase tracking-wider">Aksi</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium text-xs uppercase tracking-wider">Tipe</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium text-xs uppercase tracking-wider">Nama</th>
                    <th className="text-left py-3 px-4 text-gray-400 font-medium text-xs uppercase tracking-wider">Detail</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <>
                      <tr
                        key={log._id}
                        className="border-b border-gray-700/30 hover:bg-gray-700/20 transition-colors cursor-pointer"
                        onClick={() => toggleRow(log._id)}
                      >
                        <td className="py-3 px-4 text-gray-300 whitespace-nowrap text-xs">
                          {formatDate(log.timestamp)}
                        </td>
                        <td className="py-3 px-4">
                          <div>
                            <p className="text-white text-xs font-medium">{log.full_name || log.username}</p>
                            <p className="text-gray-500 text-xs">{log.username}</p>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold border ${ACTION_COLORS[log.action] || 'bg-gray-500/20 text-gray-400'}`}>
                            {log.action}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-300 text-xs">{log.entity_type}</td>
                        <td className="py-3 px-4 text-gray-300 text-xs max-w-[200px] truncate">{log.entity_name}</td>
                        <td className="py-3 px-4">
                          <button className="text-blue-400 hover:text-blue-300 text-xs flex items-center gap-1">
                            <svg className={`w-3.5 h-3.5 transition-transform ${expandedRow === log._id ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                            {expandedRow === log._id ? 'Tutup' : 'Lihat'}
                          </button>
                        </td>
                      </tr>
                      {expandedRow === log._id && (
                        <tr key={`${log._id}-detail`} className="bg-gray-800/50">
                          <td colSpan={6} className="px-4 py-4">
                            <DiffView
                              oldValues={log.old_values}
                              newValues={log.new_values}
                              action={log.action}
                            />
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-gray-700/50 flex items-center justify-between">
              <p className="text-xs text-gray-500">
                Halaman {page} dari {totalPages}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1.5 text-xs rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Sebelumnya
                </button>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1.5 text-xs rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Selanjutnya
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
