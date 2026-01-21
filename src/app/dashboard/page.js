'use client';

import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useDashboard } from '@/hooks/useApi';
import { StatusBadge, TypeBadge } from '@/components/ui/Badge';

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

  return (
    <DashboardLayout title="Dashboard" subtitle="Overview penjadwalan produksi">
      {/* Quick Action */}
      <div className="mb-6">
        <Link
          href="/dashboard/schedules/new"
          className="btn btn-primary btn-lg"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Input Schedule Baru
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Link href="/dashboard/schedules/potong" className="stat-card stat-card-blue">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-white/80">Schedule Potong</p>
              <p className="text-3xl font-bold mt-1">
                {isLoading ? '-' : data?.stats?.potong || 0}
              </p>
              <p className="text-sm text-white/70 mt-1">Jadwal Aktif</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243 4.243 3 3 0 004.243-4.243zm0-5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z" />
              </svg>
            </div>
          </div>
        </Link>

        <Link href="/dashboard/schedules/jahit" className="stat-card stat-card-green">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-white/80">Schedule Jahit</p>
              <p className="text-3xl font-bold mt-1">
                {isLoading ? '-' : data?.stats?.jahit || 0}
              </p>
              <p className="text-sm text-white/70 mt-1">Jadwal Aktif</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
          </div>
        </Link>

        <Link href="/dashboard/schedules/sablon" className="stat-card stat-card-purple">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-white/80">Schedule Sablon</p>
              <p className="text-3xl font-bold mt-1">
                {isLoading ? '-' : data?.stats?.sablon || 0}
              </p>
              <p className="text-sm text-white/70 mt-1">Jadwal Aktif</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
              </svg>
            </div>
          </div>
        </Link>

        <Link href="/dashboard/schedules/bordir" className="stat-card stat-card-orange">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-white/80">Schedule Bordir</p>
              <p className="text-3xl font-bold mt-1">
                {isLoading ? '-' : data?.stats?.bordir || 0}
              </p>
              <p className="text-sm text-white/70 mt-1">Jadwal Aktif</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
              </svg>
            </div>
          </div>
        </Link>
      </div>

      {/* All Schedules */}
      <div className="card">
        <div className="card-header flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Semua Jadwal Produksi</h2>
          <span className="badge badge-blue">
            {data?.upcomingSchedules?.length || 0} jadwal aktif
          </span>
        </div>

        {isLoading ? (
          <div className="card-body">
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="loading-skeleton h-16" />
              ))}
            </div>
          </div>
        ) : data?.upcomingSchedules?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>No</th>
                  <th>Tipe</th>
                  <th>Artikel</th>
                  <th>Supplier</th>
                  <th>PIC</th>
                  <th>Qty</th>
                  <th>Week</th>
                  <th>Tanggal Mulai</th>
                  <th>Tanggal Selesai</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {data.upcomingSchedules.map((schedule, index) => (
                  <tr key={`${schedule.type}-${schedule.id}`}>
                    <td className="text-gray-500">{index + 1}</td>
                    <td><TypeBadge type={schedule.type} /></td>
                    <td className="font-medium text-gray-900">{schedule.article_name}</td>
                    <td className="text-gray-500">{schedule.supplier_name || '-'}</td>
                    <td className="text-gray-500">{schedule.pic_name || '-'}</td>
                    <td className="text-gray-700 font-medium">{schedule.quantity?.toLocaleString() || '-'}</td>
                    <td className="text-gray-500">{schedule.week_delivery || '-'}</td>
                    <td className="text-gray-500">{formatDate(schedule.start_date)}</td>
                    <td className="text-gray-500">{formatDate(schedule.end_date)}</td>
                    <td><StatusBadge status={schedule.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state py-12">
            <svg className="w-16 h-16 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-gray-500">Belum ada jadwal produksi</p>
            <Link href="/dashboard/schedules/new" className="btn btn-primary mt-4">
              Buat Schedule Baru
            </Link>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
