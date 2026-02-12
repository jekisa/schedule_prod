'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';
import DataTable from '@/components/ui/DataTable';
import Modal from '@/components/ui/Modal';
import { StatusBadge } from '@/components/ui/Badge';
import { useSchedules, useUpdateSchedule, useDeleteSchedule, useSuppliers, useUsers, useArticles } from '@/hooks/useApi';

const typeConfig = {
  potong: {
    title: 'Schedule Potong',
    color: 'blue',
    gradient: 'from-blue-500 to-blue-600',
    bgLight: 'bg-blue-50',
    textColor: 'text-blue-600',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243 4.243 3 3 0 004.243-4.243zm0-5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z" />
      </svg>
    ),
  },
  jahit: {
    title: 'Schedule Jahit',
    color: 'emerald',
    gradient: 'from-emerald-500 to-emerald-600',
    bgLight: 'bg-emerald-50',
    textColor: 'text-emerald-600',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
      </svg>
    ),
  },
  sablon: {
    title: 'Schedule Sablon',
    color: 'purple',
    gradient: 'from-purple-500 to-purple-600',
    bgLight: 'bg-purple-50',
    textColor: 'text-purple-600',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
  },
  bordir: {
    title: 'Schedule Bordir',
    color: 'orange',
    gradient: 'from-orange-500 to-orange-600',
    bgLight: 'bg-orange-50',
    textColor: 'text-orange-600',
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
      </svg>
    ),
  },
};

export default function SchedulePage({ type }) {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [editData, setEditData] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);

  const config = typeConfig[type];

  // Get current user from localStorage
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setCurrentUser(user);
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }
  }, []);

  const { data: schedulesData, isLoading } = useSchedules(type);
  const { data: suppliersData } = useSuppliers(type);
  const { data: usersData } = useUsers();
  const { data: articlesData } = useArticles();

  const updateMutation = useUpdateSchedule(type);
  const deleteMutation = useDeleteSchedule(type);

  const schedules = schedulesData?.schedules || [];
  const suppliers = suppliersData?.suppliers || [];
  const users = usersData?.users || [];
  const articles = articlesData?.articles || [];

  const isAdmin = currentUser?.role === 'admin';

  // Check if user can edit/delete a schedule (admin or own schedule)
  const canEditSchedule = (schedule) => {
    if (!currentUser) return false;
    if (isAdmin) return true;
    return schedule.pic_id === currentUser.id;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const columns = useMemo(
    () => [
      {
        accessorKey: 'article_name',
        header: 'Artikel',
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${config.gradient} flex items-center justify-center flex-shrink-0`}>
              <span className="text-white font-bold text-sm">
                {row.original.article_name?.charAt(0)?.toUpperCase() || 'A'}
              </span>
            </div>
            <div>
              <div className="font-semibold text-gray-900">{row.original.article_name}</div>
              {row.original.description && (
                <div className="text-xs text-gray-500 truncate max-w-[200px]">{row.original.description}</div>
              )}
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'quantity',
        header: 'Qty',
        cell: ({ getValue }) => (
          <span className="inline-flex items-center px-3 py-1 rounded-lg bg-gray-100 text-gray-800 font-semibold text-sm">
            {getValue()?.toLocaleString() || '-'}
          </span>
        ),
      },
      {
        accessorKey: 'supplier_name',
        header: 'Supplier',
        cell: ({ getValue }) => (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
              <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <span className="text-gray-700">{getValue() || '-'}</span>
          </div>
        ),
      },
      {
        accessorKey: 'pic_name',
        header: 'PIC',
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              row.original.pic_id === currentUser?.id
                ? 'bg-gradient-to-br from-primary-100 to-primary-200'
                : 'bg-gradient-to-br from-gray-100 to-gray-200'
            }`}>
              <svg className={`w-4 h-4 ${row.original.pic_id === currentUser?.id ? 'text-primary-600' : 'text-gray-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <span className={row.original.pic_id === currentUser?.id ? 'font-medium text-primary-600' : 'text-gray-700'}>
              {row.original.pic_name}
              {row.original.pic_id === currentUser?.id && (
                <span className="ml-1 text-xs text-primary-500">(Anda)</span>
              )}
            </span>
          </div>
        ),
      },
      {
        accessorKey: 'week_delivery',
        header: 'Week',
        cell: ({ getValue }) => (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-sm font-medium">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {getValue() || '-'}
          </span>
        ),
      },
      {
        id: 'period',
        header: 'Periode',
        cell: ({ row }) => (
          <div className="text-sm">
            <div className="text-gray-700">{formatDate(row.original.start_date)}</div>
            <div className="text-gray-400 text-xs">s/d {formatDate(row.original.end_date)}</div>
          </div>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ getValue }) => <StatusBadge status={getValue()} />,
      },
      {
        id: 'actions',
        header: 'Aksi',
        cell: ({ row }) => {
          const canEdit = canEditSchedule(row.original);

          if (!canEdit) {
            return (
              <span className="text-xs text-gray-400 italic px-2 py-1 bg-gray-50 rounded-lg">
                Milik {row.original.pic_name}
              </span>
            );
          }

          return (
            <div className="flex items-center gap-1">
              <button
                onClick={() => handleEdit(row.original)}
                className={`p-2 rounded-lg ${config.textColor} hover:bg-${config.color}-50 transition-colors`}
                title="Edit"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                onClick={() => {
                  setDeleteId(row.original.id);
                  setShowDeleteConfirm(true);
                }}
                className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                title="Hapus"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          );
        },
      },
    ],
    [config, currentUser, isAdmin]
  );

  const handleEdit = (schedule) => {
    if (!canEditSchedule(schedule)) {
      alert('Anda tidak memiliki izin untuk mengedit schedule ini.');
      return;
    }

    setEditData({
      ...schedule,
      start_date: schedule.start_date ? schedule.start_date.split('T')[0] : '',
      end_date: schedule.end_date ? schedule.end_date.split('T')[0] : '',
      pic_id: schedule.pic_id,
    });
    setShowEditModal(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await updateMutation.mutateAsync(editData);
      setShowEditModal(false);
      setEditData(null);
    } catch (error) {
      alert(error.message);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const schedule = schedules.find(s => s.id === deleteId);
    if (schedule && !canEditSchedule(schedule)) {
      alert('Anda tidak memiliki izin untuk menghapus schedule ini.');
      return;
    }

    try {
      await deleteMutation.mutateAsync(deleteId);
      setShowDeleteConfirm(false);
      setDeleteId(null);
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <DashboardLayout title={config.title} subtitle={`${schedules.length} schedule ditemukan`}>
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${config.gradient} flex items-center justify-center shadow-lg shadow-${config.color}-500/30 text-white`}>
            {config.icon}
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{config.title}</h2>
            <p className="text-gray-500 text-sm">{schedules.length} schedule aktif</p>
          </div>
        </div>

        <Link
          href="/dashboard/schedules/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-medium rounded-xl shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Tambah Schedule
        </Link>
      </div>

      {/* Info Banner */}
      {!isAdmin && (
        <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-blue-900">Informasi Akses</p>
              <p className="text-sm text-blue-700 mt-0.5">
                Anda hanya dapat mengedit atau menghapus schedule yang Anda buat sebagai PIC.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Data Table */}
      <DataTable
        data={schedules}
        columns={columns}
        isLoading={isLoading}
        searchPlaceholder="Cari artikel, supplier, PIC..."
        emptyMessage="Belum ada schedule"
      />

      {/* Edit Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditData(null);
        }}
        title={`Edit ${config.title}`}
        subtitle="Perbarui informasi schedule"
        size="lg"
        icon="info"
        footer={
          <>
            <button
              type="button"
              onClick={() => {
                setShowEditModal(false);
                setEditData(null);
              }}
              className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-all"
            >
              Batal
            </button>
            <button
              type="submit"
              form="edit-form"
              disabled={updateMutation.isPending}
              className={`px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r ${config.gradient} rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center gap-2`}
            >
              {updateMutation.isPending && (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              )}
              Update
            </button>
          </>
        }
      >
        {editData && (
          <form id="edit-form" onSubmit={handleUpdate} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Artikel <span className="text-red-500">*</span>
                </label>
                <select
                  value={editData.article_id}
                  onChange={(e) => {
                    const article = articles.find((a) => a.id === e.target.value);
                    setEditData({
                      ...editData,
                      article_id: e.target.value,
                      article_name: article ? article.article_name : '',
                    });
                  }}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all bg-white"
                  required
                >
                  {articles.map((article) => (
                    <option key={article.id} value={article.id}>
                      {article.article_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantity <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={editData.quantity}
                  onChange={(e) => setEditData({ ...editData, quantity: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Supplier <span className="text-red-500">*</span>
                </label>
                <select
                  value={editData.supplier_id}
                  onChange={(e) => setEditData({ ...editData, supplier_id: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all bg-white"
                  required
                >
                  {suppliers.map((supplier) => (
                    <option key={supplier.id} value={supplier.id}>
                      {supplier.supplier_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  PIC <span className="text-red-500">*</span>
                </label>
                {isAdmin ? (
                  <select
                    value={editData.pic_id}
                    onChange={(e) => setEditData({ ...editData, pic_id: e.target.value })}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all bg-white"
                    required
                  >
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.full_name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-gray-700">
                    {currentUser?.full_name || '-'}
                    <span className="ml-2 text-xs text-gray-500">(Tidak dapat diubah)</span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Week Delivery <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={editData.week_delivery}
                onChange={(e) => setEditData({ ...editData, week_delivery: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                placeholder="contoh: W01-2025"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tanggal Mulai <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={editData.start_date}
                  onChange={(e) => setEditData({ ...editData, start_date: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tanggal Selesai <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={editData.end_date}
                  onChange={(e) => setEditData({ ...editData, end_date: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={editData.status}
                onChange={(e) => setEditData({ ...editData, status: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all bg-white"
              >
                <option value="scheduled">Terjadwal</option>
                <option value="in_progress">Proses</option>
                <option value="completed">Selesai</option>
                <option value="cancelled">Batal</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Catatan</label>
              <textarea
                value={editData.notes || ''}
                onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all resize-none"
                rows="3"
                placeholder="Catatan tambahan (opsional)"
              />
            </div>
          </form>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setDeleteId(null);
        }}
        title="Hapus Schedule"
        subtitle="Tindakan ini tidak dapat dibatalkan"
        size="sm"
        icon="danger"
        footer={
          <>
            <button
              onClick={() => {
                setShowDeleteConfirm(false);
                setDeleteId(null);
              }}
              disabled={deleteMutation.isPending}
              className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50"
            >
              Batal
            </button>
            <button
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-red-500 to-red-600 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {deleteMutation.isPending && (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              )}
              Hapus
            </button>
          </>
        }
      >
        <p className="text-gray-600">
          Apakah Anda yakin ingin menghapus schedule ini? Data yang sudah dihapus tidak dapat dikembalikan.
        </p>
      </Modal>
    </DashboardLayout>
  );
}
