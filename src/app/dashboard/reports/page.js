'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import * as XLSX from 'xlsx';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table';
import { useReportSchedules } from '@/hooks/useApi';

// ─── Config ──────────────────────────────────────────────────────────────────

const TYPE_CONFIG = {
  potong: { label: 'Potong', badgeClass: 'badge-blue', gradient: 'from-blue-500 to-blue-700', light: 'bg-blue-50 text-blue-700 border-blue-200' },
  jahit:  { label: 'Jahit',  badgeClass: 'badge-green', gradient: 'from-emerald-500 to-emerald-700', light: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  sablon: { label: 'Sablon', badgeClass: 'badge-purple', gradient: 'from-purple-500 to-purple-700', light: 'bg-purple-50 text-purple-700 border-purple-200' },
  bordir: { label: 'Bordir', badgeClass: 'badge-orange', gradient: 'from-orange-500 to-orange-700', light: 'bg-orange-50 text-orange-700 border-orange-200' },
};

const STATUS_CONFIG = {
  scheduled:   { label: 'Terjadwal',     badgeClass: 'badge-blue',   dot: 'bg-blue-500' },
  in_progress: { label: 'Sedang Proses', badgeClass: 'badge-yellow', dot: 'bg-amber-500' },
  completed:   { label: 'Selesai',       badgeClass: 'badge-green',  dot: 'bg-emerald-500' },
  cancelled:   { label: 'Dibatalkan',    badgeClass: 'badge-red',    dot: 'bg-red-500' },
};

const TYPE_OPTIONS  = ['all', 'potong', 'jahit', 'sablon', 'bordir'];
const STATUS_OPTIONS = ['all', 'scheduled', 'in_progress', 'completed'];

function formatDate(dateStr) {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
}

// ─── Sort Icon ────────────────────────────────────────────────────────────────

function SortIcon({ sorted }) {
  if (!sorted) return (
    <svg className="w-3.5 h-3.5 text-gray-300 ml-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
    </svg>
  );
  return sorted === 'asc' ? (
    <svg className="w-3.5 h-3.5 text-blue-500 ml-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
    </svg>
  ) : (
    <svg className="w-3.5 h-3.5 text-blue-500 ml-1 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  );
}

// ─── Column Definitions ───────────────────────────────────────────────────────

const columnHelper = createColumnHelper();

const columns = [
  columnHelper.display({
    id: 'no',
    header: '#',
    cell: (info) => {
      const { pageIndex, pageSize } = info.table.getState().pagination;
      const posInPage = info.table.getRowModel().rows.findIndex((r) => r.id === info.row.id);
      return (
        <span className="text-gray-400 text-xs font-medium tabular-nums w-full text-center block">
          {pageIndex * pageSize + posInPage + 1}
        </span>
      );
    },
    enableSorting: false,
    size: 48,
  }),
  columnHelper.accessor('article_name', {
    header: 'Artikel',
    cell: (info) => (
      <div className="min-w-0">
        <div className="font-semibold text-gray-900 text-sm truncate">{info.getValue()}</div>
        {info.row.original.description && (
          <div className="text-xs text-gray-400 mt-0.5 truncate">{info.row.original.description}</div>
        )}
      </div>
    ),
    size: 200,
  }),
  columnHelper.accessor('schedule_type', {
    header: 'Jenis',
    cell: (info) => {
      const cfg = TYPE_CONFIG[info.getValue()];
      return cfg ? <span className={`badge ${cfg.badgeClass}`}>{cfg.label}</span> : '—';
    },
    size: 100,
    filterFn: 'equals',
  }),
  columnHelper.accessor('supplier_name', {
    header: 'Supplier',
    cell: (info) => (
      <span className="text-sm text-gray-700">{info.getValue() || '—'}</span>
    ),
    size: 150,
  }),
  columnHelper.accessor('pic_name', {
    header: 'PIC',
    cell: (info) => {
      const name = info.getValue();
      if (!name) return <span className="text-gray-400 text-sm">—</span>;
      return (
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-400 to-purple-600 flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0 shadow-sm">
            {name.charAt(0).toUpperCase()}
          </div>
          <span className="text-sm text-gray-700 truncate">{name}</span>
        </div>
      );
    },
    size: 150,
  }),
  columnHelper.accessor('quantity', {
    header: 'Qty',
    cell: (info) => (
      <span className="font-semibold text-gray-900 tabular-nums text-sm">
        {info.getValue()?.toLocaleString('id-ID') ?? '—'}
      </span>
    ),
    size: 80,
  }),
  columnHelper.accessor('week_delivery', {
    header: 'Week Delivery',
    cell: (info) => info.getValue()
      ? <span className="badge badge-gray text-xs">{info.getValue()}</span>
      : <span className="text-gray-400 text-sm">—</span>,
    size: 120,
  }),
  columnHelper.accessor('start_date', {
    header: 'Tgl Mulai',
    cell: (info) => (
      <span className="text-sm text-gray-600 tabular-nums whitespace-nowrap">{formatDate(info.getValue())}</span>
    ),
    sortingFn: 'datetime',
    size: 110,
  }),
  columnHelper.accessor('end_date', {
    header: 'Tgl Selesai',
    cell: (info) => (
      <span className="text-sm text-gray-600 tabular-nums whitespace-nowrap">{formatDate(info.getValue())}</span>
    ),
    sortingFn: 'datetime',
    size: 110,
  }),
  columnHelper.accessor('status', {
    header: 'Status',
    cell: (info) => {
      const cfg = STATUS_CONFIG[info.getValue()];
      return cfg ? (
        <span className={`badge ${cfg.badgeClass}`}>
          <span className="badge-dot" />
          {cfg.label}
        </span>
      ) : '—';
    },
    size: 140,
    filterFn: 'equals',
  }),
];

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ReportPage() {
  const [sorting, setSorting]               = useState([{ id: 'start_date', desc: true }]);
  const [columnFilters, setColumnFilters]   = useState([]);
  const [globalFilter, setGlobalFilter]     = useState('');
  const [pagination, setPagination]         = useState({ pageIndex: 0, pageSize: 10 });

  const { data, isLoading, isError, isFetching } = useReportSchedules();
  const allSchedules = data?.schedules || [];

  // Derive active filter values from columnFilters state
  const activeType   = columnFilters.find((f) => f.id === 'schedule_type')?.value ?? 'all';
  const activeStatus = columnFilters.find((f) => f.id === 'status')?.value ?? 'all';

  const setTypeFilter = (type) => {
    setColumnFilters((prev) => {
      const rest = prev.filter((f) => f.id !== 'schedule_type');
      return type === 'all' ? rest : [...rest, { id: 'schedule_type', value: type }];
    });
    setPagination((p) => ({ ...p, pageIndex: 0 }));
  };

  const setStatusFilter = (status) => {
    setColumnFilters((prev) => {
      const rest = prev.filter((f) => f.id !== 'status');
      return status === 'all' ? rest : [...rest, { id: 'status', value: status }];
    });
    setPagination((p) => ({ ...p, pageIndex: 0 }));
  };

  // Stats based on type filter only (not status filter)
  const stats = useMemo(() => {
    const base = activeType === 'all'
      ? allSchedules
      : allSchedules.filter((s) => s.schedule_type === activeType);
    return {
      total:       base.length,
      scheduled:   base.filter((s) => s.status === 'scheduled').length,
      in_progress: base.filter((s) => s.status === 'in_progress').length,
      completed:   base.filter((s) => s.status === 'completed').length,
    };
  }, [allSchedules, activeType]);

  const table = useReactTable({
    data: allSchedules,
    columns,
    state: { sorting, columnFilters, globalFilter, pagination },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: (val) => {
      setGlobalFilter(val);
      setPagination((p) => ({ ...p, pageIndex: 0 }));
    },
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    globalFilterFn: (row, _columnId, filterValue) => {
      const q = filterValue.toLowerCase();
      return (
        row.original.article_name?.toLowerCase().includes(q) ||
        row.original.supplier_name?.toLowerCase().includes(q) ||
        row.original.pic_name?.toLowerCase().includes(q) ||
        row.original.week_delivery?.toLowerCase().includes(q)
      );
    },
  });

  const { pageIndex, pageSize } = table.getState().pagination;
  const totalFiltered = table.getFilteredRowModel().rows.length;
  const totalPages    = table.getPageCount();
  const pageRows      = table.getRowModel().rows;

  const printDate = new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
  const handlePrint = () => window.print();

  const handleExportExcel = () => {
    // Use all filtered rows (not just current page) for export
    const rows = table.getFilteredRowModel().rows;

    // Build worksheet rows
    const wsData = [
      // Header row
      ['No', 'Artikel', 'Deskripsi', 'Jenis', 'Supplier', 'PIC', 'Qty', 'Week Delivery', 'Tgl Mulai', 'Tgl Selesai', 'Status'],
      // Data rows
      ...rows.map((row, i) => {
        const s = row.original;
        return [
          i + 1,
          s.article_name ?? '',
          s.description ?? '',
          TYPE_CONFIG[s.schedule_type]?.label ?? s.schedule_type ?? '',
          s.supplier_name ?? '',
          s.pic_name ?? '',
          s.quantity ?? 0,
          s.week_delivery ?? '',
          s.start_date ? new Date(s.start_date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '',
          s.end_date   ? new Date(s.end_date).toLocaleDateString('id-ID',   { day: '2-digit', month: 'short', year: 'numeric' }) : '',
          STATUS_CONFIG[s.status]?.label ?? s.status ?? '',
        ];
      }),
    ];

    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // Column widths
    ws['!cols'] = [
      { wch: 5  },  // No
      { wch: 28 },  // Artikel
      { wch: 24 },  // Deskripsi
      { wch: 10 },  // Jenis
      { wch: 22 },  // Supplier
      { wch: 20 },  // PIC
      { wch: 10 },  // Qty
      { wch: 14 },  // Week Delivery
      { wch: 14 },  // Tgl Mulai
      { wch: 14 },  // Tgl Selesai
      { wch: 14 },  // Status
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Laporan Jadwal');

    const fileName = `Laporan_Jadwal_${activeType !== 'all' ? TYPE_CONFIG[activeType]?.label + '_' : ''}${new Date().toISOString().slice(0, 10)}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="page-container">

      {/* ── Print-only header ───────────────────────────────────────────────── */}
      <div className="report-print-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h1 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0, color: '#0f172a' }}>PT. GNP — Production Scheduler</h1>
            <p style={{ color: '#64748b', margin: '4px 0 0', fontSize: '13px' }}>Laporan Jadwal Produksi</p>
          </div>
          <div style={{ textAlign: 'right', fontSize: '11px', color: '#64748b' }}>
            <p style={{ margin: 0 }}>Dicetak: {printDate}</p>
            <p style={{ margin: '2px 0 0' }}>
              {activeType !== 'all' ? TYPE_CONFIG[activeType]?.label : 'Semua Jenis'}
              {' | '}
              {activeStatus !== 'all' ? STATUS_CONFIG[activeStatus]?.label : 'Semua Status'}
            </p>
          </div>
        </div>
        <hr style={{ borderColor: '#e2e8f0', margin: '10px 0 0' }} />
      </div>

      {/* ── Hero Header (screen only) ────────────────────────────────────────── */}
      <div className="no-print relative overflow-hidden rounded-2xl mb-6 bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-900 shadow-xl">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-blue-500/10 blur-3xl" />
          <div className="absolute -bottom-16 -left-16 w-72 h-72 rounded-full bg-indigo-500/10 blur-3xl" />
          <div className="absolute top-0 left-0 w-full h-full opacity-5"
            style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />
        </div>

        <div className="relative px-6 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-white transition-all duration-200 flex-shrink-0"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <div className="w-6 h-6 rounded-lg bg-blue-500/30 flex items-center justify-center">
                  <svg className="w-3.5 h-3.5 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <span className="text-blue-300 text-xs font-semibold uppercase tracking-widest">Production Reports</span>
              </div>
              <h1 className="text-2xl font-bold text-white tracking-tight">Laporan Jadwal Produksi</h1>
              <p className="text-blue-200/70 text-sm mt-0.5">Ringkasan seluruh jadwal — scheduled, proses, dan selesai</p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {isFetching && !isLoading && (
              <div className="flex items-center gap-1.5 text-blue-200/60 text-xs">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                Memperbarui...
              </div>
            )}
            {/* Export Excel */}
            <button
              onClick={handleExportExcel}
              disabled={isLoading || totalFiltered === 0}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-semibold transition-all duration-200 shadow-lg shadow-black/20 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Export ke Excel (.xlsx)"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="hidden sm:inline">Export Excel</span>
            </button>
            {/* Print */}
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-gray-900 text-sm font-semibold hover:bg-blue-50 transition-all duration-200 shadow-lg shadow-black/20"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              <span className="hidden sm:inline">Cetak</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Stats Cards ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6 no-print">
        {/* Total */}
        <div className="relative overflow-hidden rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-5">
          <div className="absolute top-0 right-0 w-20 h-20 rounded-full bg-gray-50 -mr-8 -mt-8" />
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total</span>
            </div>
            <p className="text-3xl font-bold text-gray-900 tabular-nums">{isLoading ? '—' : stats.total}</p>
            <p className="text-xs text-gray-500 mt-1">Semua jadwal aktif</p>
          </div>
        </div>

        {/* Terjadwal */}
        <div className="relative overflow-hidden rounded-2xl bg-white border border-blue-100 shadow-sm hover:shadow-md transition-shadow p-5">
          <div className="absolute top-0 right-0 w-20 h-20 rounded-full bg-blue-50 -mr-8 -mt-8" />
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <span className="text-xs font-semibold text-blue-400 uppercase tracking-wider">Terjadwal</span>
            </div>
            <p className="text-3xl font-bold text-blue-600 tabular-nums">{isLoading ? '—' : stats.scheduled}</p>
            <p className="text-xs text-blue-400 mt-1">Menunggu dimulai</p>
          </div>
        </div>

        {/* Sedang Proses */}
        <div className="relative overflow-hidden rounded-2xl bg-white border border-amber-100 shadow-sm hover:shadow-md transition-shadow p-5">
          <div className="absolute top-0 right-0 w-20 h-20 rounded-full bg-amber-50 -mr-8 -mt-8" />
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="text-xs font-semibold text-amber-500 uppercase tracking-wider">Proses</span>
            </div>
            <p className="text-3xl font-bold text-amber-600 tabular-nums">{isLoading ? '—' : stats.in_progress}</p>
            <p className="text-xs text-amber-400 mt-1">Sedang berjalan</p>
          </div>
        </div>

        {/* Selesai */}
        <div className="relative overflow-hidden rounded-2xl bg-white border border-emerald-100 shadow-sm hover:shadow-md transition-shadow p-5">
          <div className="absolute top-0 right-0 w-20 h-20 rounded-full bg-emerald-50 -mr-8 -mt-8" />
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-xs font-semibold text-emerald-500 uppercase tracking-wider">Selesai</span>
            </div>
            <p className="text-3xl font-bold text-emerald-600 tabular-nums">{isLoading ? '—' : stats.completed}</p>
            <p className="text-xs text-emerald-400 mt-1">Sudah selesai</p>
          </div>
        </div>
      </div>

      {/* ── Filter & Search Bar (screen only) ───────────────────────────────── */}
      <div className="no-print bg-white rounded-2xl border border-gray-100 shadow-sm mb-4 overflow-hidden">
        {/* Search row */}
        <div className="px-4 pt-4 pb-3 border-b border-gray-50">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={globalFilter}
              onChange={(e) => table.setGlobalFilter(e.target.value)}
              placeholder="Cari artikel, supplier, PIC, atau week delivery..."
              className="w-full pl-10 pr-10 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all placeholder-gray-400"
            />
            {globalFilter && (
              <button
                onClick={() => table.setGlobalFilter('')}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Filter chips */}
        <div className="px-4 py-3 flex flex-wrap items-center gap-3">
          {/* Type filter */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mr-1">Jenis</span>
            {TYPE_OPTIONS.map((type) => {
              const cfg = TYPE_CONFIG[type];
              const isActive = activeType === type;
              return (
                <button
                  key={type}
                  onClick={() => setTypeFilter(type)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all duration-150 ${
                    type === 'all'
                      ? isActive
                        ? 'bg-gray-900 text-white border-gray-900'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                      : isActive
                      ? `bg-gradient-to-r ${cfg.gradient} text-white border-transparent shadow-sm`
                      : `${cfg.light} border hover:opacity-80`
                  }`}
                >
                  {type === 'all' ? 'Semua' : cfg.label}
                </button>
              );
            })}
          </div>

          <div className="w-px h-5 bg-gray-200 hidden sm:block" />

          {/* Status filter */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mr-1">Status</span>
            {STATUS_OPTIONS.map((status) => {
              const cfg = STATUS_CONFIG[status];
              const isActive = activeStatus === status;
              return (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold border transition-all duration-150 ${
                    status === 'all'
                      ? isActive
                        ? 'bg-gray-900 text-white border-gray-900'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                      : isActive
                      ? 'bg-gray-900 text-white border-gray-900'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
                  }`}
                >
                  {status === 'all' ? 'Semua' : cfg.label}
                </button>
              );
            })}
          </div>

          <div className="ml-auto flex items-center gap-2 text-xs text-gray-400">
            <span className="font-semibold text-gray-700 text-sm">{totalFiltered}</span>
            <span>hasil</span>
            {(globalFilter || activeType !== 'all' || activeStatus !== 'all') && (
              <button
                onClick={() => {
                  setColumnFilters([]);
                  setGlobalFilter('');
                  table.setGlobalFilter('');
                }}
                className="ml-1 px-2 py-0.5 rounded-md bg-gray-100 text-gray-500 hover:bg-gray-200 text-xs font-medium transition-colors"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Print-only full table (all filtered rows, no pagination) ───────── */}
      <div className="report-print-table">
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #e2e8f0', background: '#f8fafc' }}>
              {['#','Artikel','Jenis','Supplier','PIC','Qty','Week Delivery','Tgl Mulai','Tgl Selesai','Status'].map((h) => (
                <th key={h} style={{ padding: '6px 8px', textAlign: 'left', fontWeight: 700, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', whiteSpace: 'nowrap' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.getFilteredRowModel().rows.map((row, i) => {
              const s = row.original;
              return (
                <tr key={row.id} style={{ borderBottom: '1px solid #f1f5f9', background: i % 2 === 0 ? '#fff' : '#f8fafc' }}>
                  <td style={{ padding: '5px 8px', color: '#94a3b8', width: '32px' }}>{i + 1}</td>
                  <td style={{ padding: '5px 8px' }}>
                    <div style={{ fontWeight: 600, color: '#0f172a' }}>{s.article_name}</div>
                    {s.description && <div style={{ fontSize: '10px', color: '#94a3b8' }}>{s.description}</div>}
                  </td>
                  <td style={{ padding: '5px 8px', whiteSpace: 'nowrap' }}>{TYPE_CONFIG[s.schedule_type]?.label ?? s.schedule_type}</td>
                  <td style={{ padding: '5px 8px' }}>{s.supplier_name || '—'}</td>
                  <td style={{ padding: '5px 8px' }}>{s.pic_name || '—'}</td>
                  <td style={{ padding: '5px 8px', fontWeight: 600 }}>{s.quantity?.toLocaleString('id-ID') ?? '—'}</td>
                  <td style={{ padding: '5px 8px', whiteSpace: 'nowrap' }}>{s.week_delivery || '—'}</td>
                  <td style={{ padding: '5px 8px', whiteSpace: 'nowrap' }}>{formatDate(s.start_date)}</td>
                  <td style={{ padding: '5px 8px', whiteSpace: 'nowrap' }}>{formatDate(s.end_date)}</td>
                  <td style={{ padding: '5px 8px', whiteSpace: 'nowrap' }}>{STATUS_CONFIG[s.status]?.label ?? s.status}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ── TanStack Table ───────────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden no-print">
        {/* Print filter info */}
        <div className="report-print-filter-info">
          {activeType !== 'all' ? TYPE_CONFIG[activeType]?.label : 'Semua Jenis'}
          {' — '}
          {activeStatus !== 'all' ? STATUS_CONFIG[activeStatus]?.label : 'Semua Status'}
          {' — '}
          {totalFiltered} jadwal
        </div>

        {/* Loading state */}
        {isLoading && (
          <div className="flex items-center justify-center gap-3 py-20 text-gray-400">
            <div className="loading-spinner" />
            <span className="text-sm">Memuat data laporan...</span>
          </div>
        )}

        {/* Error state */}
        {isError && !isLoading && (
          <div className="flex flex-col items-center justify-center py-20 text-center px-4">
            <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mb-3">
              <svg className="w-7 h-7 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <p className="font-semibold text-gray-700">Gagal memuat laporan</p>
            <p className="text-sm text-gray-400 mt-1">Coba refresh halaman ini</p>
          </div>
        )}

        {/* Table */}
        {!isLoading && !isError && (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                {table.getHeaderGroups().map((hg) => (
                  <tr key={hg.id} className="border-b border-gray-100">
                    {hg.headers.map((header) => (
                      <th
                        key={header.id}
                        style={{ width: header.getSize() }}
                        className={`px-4 py-3 text-left text-xs font-700 uppercase tracking-wider text-gray-500 bg-gray-50/80 whitespace-nowrap select-none ${
                          header.column.getCanSort() ? 'cursor-pointer hover:text-gray-900 hover:bg-gray-100 transition-colors' : ''
                        }`}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        <div className="flex items-center">
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {header.column.getCanSort() && (
                            <SortIcon sorted={header.column.getIsSorted()} />
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {pageRows.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length}>
                      <div className="flex flex-col items-center justify-center py-20 text-center px-4">
                        <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mb-3">
                          <svg className="w-7 h-7 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <p className="font-semibold text-gray-600">Tidak ada jadwal ditemukan</p>
                        <p className="text-sm text-gray-400 mt-1">Coba ubah filter atau kata kunci pencarian</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  pageRows.map((row, rowIdx) => (
                    <tr
                      key={row.id}
                      className={`border-b border-gray-50 transition-colors hover:bg-blue-50/40 ${
                        rowIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
                      }`}
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="px-4 py-3">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* ── Pagination ──────────────────────────────────────────────────── */}
        {!isLoading && !isError && totalFiltered > 0 && (
          <div className="no-print flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-gray-100 bg-gray-50/50">
            {/* Page size + info */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Tampilkan</span>
                <select
                  value={pageSize}
                  onChange={(e) => {
                    table.setPageSize(Number(e.target.value));
                    table.setPageIndex(0);
                  }}
                  className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
                >
                  {[10, 20, 50, 100].map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
                <span className="text-xs text-gray-500">baris</span>
              </div>
              <span className="text-xs text-gray-400 hidden sm:block">
                {pageIndex * pageSize + 1}–{Math.min((pageIndex + 1) * pageSize, totalFiltered)} dari {totalFiltered}
              </span>
            </div>

            {/* Page buttons */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => table.setPageIndex(0)}
                disabled={!table.getCanPreviousPage()}
                className="flex items-center justify-center w-8 h-8 rounded-lg text-gray-500 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                title="Halaman pertama"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="flex items-center justify-center w-8 h-8 rounded-lg text-gray-500 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              {/* Page number pills */}
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let page;
                if (totalPages <= 5) {
                  page = i;
                } else if (pageIndex < 3) {
                  page = i;
                } else if (pageIndex > totalPages - 4) {
                  page = totalPages - 5 + i;
                } else {
                  page = pageIndex - 2 + i;
                }
                return (
                  <button
                    key={page}
                    onClick={() => table.setPageIndex(page)}
                    className={`w-8 h-8 rounded-lg text-xs font-semibold transition-all ${
                      page === pageIndex
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {page + 1}
                  </button>
                );
              })}

              <button
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="flex items-center justify-center w-8 h-8 rounded-lg text-gray-500 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              <button
                onClick={() => table.setPageIndex(totalPages - 1)}
                disabled={!table.getCanNextPage()}
                className="flex items-center justify-center w-8 h-8 rounded-lg text-gray-500 hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                title="Halaman terakhir"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Print footer ─────────────────────────────────────────────────────── */}
      <div className="report-print-footer">
        Laporan dibuat otomatis oleh PT. GNP Production Scheduler · {printDate}
      </div>
    </div>
  );
}
