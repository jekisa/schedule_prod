'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useDashboard } from '@/hooks/useApi';
import { StatusBadge, TypeBadge } from '@/components/ui/Badge';

// Stat Card Component
const StatCard = ({ href, title, value, subtitle, icon, gradient, isLoading }) => (
  <Link
    href={href}
    className={`group relative overflow-hidden rounded-2xl p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${gradient}`}
  >
    {/* Background Pattern */}
    <div className="absolute inset-0 opacity-10">
      <svg className="absolute -right-4 -top-4 w-32 h-32 text-white" fill="currentColor" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="50" />
      </svg>
      <svg className="absolute -right-8 -bottom-8 w-40 h-40 text-white" fill="currentColor" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="50" />
      </svg>
    </div>

    <div className="relative flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-white/80">{title}</p>
        <p className="text-4xl font-bold mt-2 text-white">
          {isLoading ? (
            <span className="inline-block w-12 h-10 bg-white/20 rounded animate-pulse" />
          ) : (
            value
          )}
        </p>
        <p className="text-sm text-white/70 mt-2 flex items-center gap-1">
          {subtitle}
          <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </p>
      </div>
      <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform">
        {icon}
      </div>
    </div>
  </Link>
);

// Quick Stat Item
const QuickStat = ({ label, value, icon, color }) => (
  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
    <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center flex-shrink-0`}>
      {icon}
    </div>
    <div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  </div>
);

// Schedule Row Component
const ScheduleRow = ({ schedule, index, formatDate }) => (
  <tr className="hover:bg-gray-50/80 transition-colors group">
    <td className="px-6 py-4">
      <span className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-sm font-medium text-gray-600">
        {index + 1}
      </span>
    </td>
    <td className="px-6 py-4">
      <TypeBadge type={schedule.type} />
    </td>
    <td className="px-6 py-4">
      <div>
        <p className="font-semibold text-gray-900">{schedule.article_name}</p>
        {schedule.description && (
          <p className="text-xs text-gray-500 mt-0.5 truncate max-w-[200px]">{schedule.description}</p>
        )}
      </div>
    </td>
    <td className="px-6 py-4">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
          <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        </div>
        <span className="text-gray-700">{schedule.supplier_name || '-'}</span>
      </div>
    </td>
    <td className="px-6 py-4">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
          <svg className="w-4 h-4 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <span className="text-gray-700">{schedule.pic_name || '-'}</span>
      </div>
    </td>
    <td className="px-6 py-4">
      <span className="inline-flex items-center px-3 py-1 rounded-lg bg-gray-100 text-gray-800 font-semibold text-sm">
        {schedule.quantity?.toLocaleString() || '-'}
      </span>
    </td>
    <td className="px-6 py-4">
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-sm font-medium">
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        {schedule.week_delivery || '-'}
      </span>
    </td>
    <td className="px-6 py-4 text-gray-600">{formatDate(schedule.start_date)}</td>
    <td className="px-6 py-4 text-gray-600">{formatDate(schedule.end_date)}</td>
    <td className="px-6 py-4">
      <StatusBadge status={schedule.status} />
    </td>
  </tr>
);

export default function DashboardPage() {
  const { data, isLoading } = useDashboard();

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  // Calculate totals
  const totals = useMemo(() => {
    if (!data?.stats) return { total: 0, inProgress: 0, completed: 0 };
    const total = (data.stats.potong || 0) + (data.stats.jahit || 0) + (data.stats.sablon || 0) + (data.stats.bordir || 0);
    const inProgress = data.upcomingSchedules?.filter(s => s.status === 'in_progress').length || 0;
    const completed = data.upcomingSchedules?.filter(s => s.status === 'completed').length || 0;
    return { total, inProgress, completed };
  }, [data]);

  return (
    <DashboardLayout title="Dashboard" subtitle="Overview penjadwalan produksi">
      {/* Welcome Section */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Selamat Datang di Production Scheduling
          </h2>
          <p className="text-gray-500 mt-1">
            Monitor dan kelola semua jadwal produksi dari satu tempat.
          </p>
        </div>
        <Link
          href="/dashboard/schedules/new"
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold rounded-xl shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40 hover:-translate-y-0.5 transition-all duration-200"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Input Schedule Baru
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <StatCard
          href="/dashboard/schedules/potong"
          title="Schedule Potong"
          value={data?.stats?.potong || 0}
          subtitle="Lihat detail"
          gradient="bg-gradient-to-br from-blue-500 to-blue-600"
          isLoading={isLoading}
          icon={
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243 4.243 3 3 0 004.243-4.243zm0-5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z" />
            </svg>
          }
        />

        <StatCard
          href="/dashboard/schedules/jahit"
          title="Schedule Jahit"
          value={data?.stats?.jahit || 0}
          subtitle="Lihat detail"
          gradient="bg-gradient-to-br from-emerald-500 to-emerald-600"
          isLoading={isLoading}
          icon={
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
            </svg>
          }
        />

        <StatCard
          href="/dashboard/schedules/sablon"
          title="Schedule Sablon"
          value={data?.stats?.sablon || 0}
          subtitle="Lihat detail"
          gradient="bg-gradient-to-br from-purple-500 to-purple-600"
          isLoading={isLoading}
          icon={
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          }
        />

        <StatCard
          href="/dashboard/schedules/bordir"
          title="Schedule Bordir"
          value={data?.stats?.bordir || 0}
          subtitle="Lihat detail"
          gradient="bg-gradient-to-br from-orange-500 to-orange-600"
          isLoading={isLoading}
          icon={
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
            </svg>
          }
        />
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <QuickStat
          label="Total Semua Schedule"
          value={isLoading ? '-' : totals.total}
          color="bg-gradient-to-br from-slate-100 to-slate-200"
          icon={
            <svg className="w-6 h-6 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          }
        />
        <QuickStat
          label="Sedang Proses"
          value={isLoading ? '-' : totals.inProgress}
          color="bg-gradient-to-br from-amber-100 to-amber-200"
          icon={
            <svg className="w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          }
        />
        <QuickStat
          label="Selesai"
          value={isLoading ? '-' : totals.completed}
          color="bg-gradient-to-br from-emerald-100 to-emerald-200"
          icon={
            <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
      </div>

      {/* All Schedules Table */}
      <div className="card overflow-hidden shadow-lg shadow-gray-200/50">
        <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-white to-gray-50/50">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Semua Jadwal Produksi</h2>
              <p className="text-sm text-gray-500 mt-0.5">
                Daftar lengkap jadwal dari semua kategori
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 text-primary-700 text-sm font-medium rounded-xl">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                {data?.upcomingSchedules?.length || 0} jadwal
              </span>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="p-6">
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-1/4" />
                    <div className="h-3 bg-gray-100 rounded animate-pulse w-1/2" />
                  </div>
                  <div className="h-6 w-20 bg-gray-200 rounded-full animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        ) : data?.upcomingSchedules?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-gray-50 to-gray-100/70">
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">No</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Tipe</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Artikel</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Supplier</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">PIC</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Qty</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Week</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Mulai</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Selesai</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.upcomingSchedules.map((schedule, index) => (
                  <ScheduleRow
                    key={`${schedule.type}-${schedule.id}`}
                    schedule={schedule}
                    index={index}
                    formatDate={formatDate}
                  />
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 px-4">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mb-6">
                <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Belum ada jadwal produksi</h3>
              <p className="text-gray-500 max-w-sm mb-6">
                Mulai dengan membuat jadwal produksi baru untuk mengorganisir pekerjaan Anda.
              </p>
              <Link
                href="/dashboard/schedules/new"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-medium rounded-xl shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40 transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Buat Schedule Baru
              </Link>
            </div>
          </div>
        )}
      </div>

    </DashboardLayout>
  );
}
