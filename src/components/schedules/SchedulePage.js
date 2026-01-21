'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';
import DataTable from '@/components/ui/DataTable';
import Modal from '@/components/ui/Modal';
import { StatusBadge } from '@/components/ui/Badge';
import { useSchedules, useUpdateSchedule, useDeleteSchedule, useSuppliers, useUsers, useArticles } from '@/hooks/useApi';

const typeConfig = {
  potong: { title: 'Schedule Potong', color: 'blue', gradient: 'from-blue-500 to-blue-600' },
  jahit: { title: 'Schedule Jahit', color: 'green', gradient: 'from-green-500 to-green-600' },
  sablon: { title: 'Schedule Sablon', color: 'purple', gradient: 'from-purple-500 to-purple-600' },
  bordir: { title: 'Schedule Bordir', color: 'orange', gradient: 'from-orange-500 to-orange-600' },
};

export default function SchedulePage({ type }) {
  const [showEditModal, setShowEditModal] = useState(false);
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
          <div>
            <div className="font-medium text-gray-900">{row.original.article_name}</div>
            {row.original.description && (
              <div className="text-xs text-gray-500 truncate max-w-[200px]">{row.original.description}</div>
            )}
          </div>
        ),
      },
      {
        accessorKey: 'quantity',
        header: 'Qty',
        cell: ({ getValue }) => (
          <span className="font-medium">{getValue()?.toLocaleString() || '-'}</span>
        ),
      },
      {
        accessorKey: 'supplier_name',
        header: 'Supplier',
      },
      {
        accessorKey: 'pic_name',
        header: 'PIC',
        cell: ({ row }) => (
          <span className={row.original.pic_id === currentUser?.id ? 'font-medium text-blue-600' : ''}>
            {row.original.pic_name}
            {row.original.pic_id === currentUser?.id && ' (Anda)'}
          </span>
        ),
      },
      {
        accessorKey: 'week_delivery',
        header: 'Week',
      },
      {
        id: 'period',
        header: 'Periode',
        cell: ({ row }) => (
          <span className="text-gray-500">
            {formatDate(row.original.start_date)} - {formatDate(row.original.end_date)}
          </span>
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
              <span className="text-xs text-gray-400 italic">
                Milik {row.original.pic_name}
              </span>
            );
          }

          return (
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleEdit(row.original)}
                className={`btn btn-ghost btn-sm text-${config.color}-600 hover:text-${config.color}-700 hover:bg-${config.color}-50`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                onClick={() => handleDelete(row.original.id)}
                className="btn btn-ghost btn-sm text-red-600 hover:text-red-700 hover:bg-red-50"
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
    [config.color, currentUser, isAdmin]
  );

  const handleEdit = (schedule) => {
    // Double-check permission
    if (!canEditSchedule(schedule)) {
      alert('Anda tidak memiliki izin untuk mengedit schedule ini. Hanya PIC yang bersangkutan atau admin yang dapat mengedit.');
      return;
    }

    setEditData({
      ...schedule,
      start_date: schedule.start_date ? schedule.start_date.split('T')[0] : '',
      end_date: schedule.end_date ? schedule.end_date.split('T')[0] : '',
      // Keep the original PIC, don't auto-change
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

  const handleDelete = async (id) => {
    // Find the schedule to check permission
    const schedule = schedules.find(s => s.id === id);
    if (schedule && !canEditSchedule(schedule)) {
      alert('Anda tidak memiliki izin untuk menghapus schedule ini. Hanya PIC yang bersangkutan atau admin yang dapat menghapus.');
      return;
    }

    if (!confirm('Yakin ingin menghapus schedule ini?')) return;
    try {
      await deleteMutation.mutateAsync(id);
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <DashboardLayout title={config.title} subtitle={`${schedules.length} schedule ditemukan`}>
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r ${config.gradient} text-white`}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className="font-medium">{config.title}</span>
        </div>

        <Link href="/dashboard/schedules/new" className="btn btn-primary">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Tambah Schedule
        </Link>
      </div>

      {/* Info Banner */}
      {!isAdmin && (
        <div className="mb-4 p-3 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 text-sm flex items-center gap-2">
          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Anda hanya dapat mengedit/menghapus schedule yang Anda buat (sebagai PIC).</span>
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
        size="lg"
      >
        {editData && (
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="form-group">
                <label className="label label-required">Artikel</label>
                <select
                  value={editData.article_id}
                  onChange={(e) => {
                    const article = articles.find((a) => a.id === parseInt(e.target.value));
                    setEditData({
                      ...editData,
                      article_id: e.target.value,
                      article_name: article ? article.article_name : '',
                    });
                  }}
                  className="select"
                  required
                >
                  {articles.map((article) => (
                    <option key={article.id} value={article.id}>
                      {article.article_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="label label-required">Quantity</label>
                <input
                  type="number"
                  value={editData.quantity}
                  onChange={(e) => setEditData({ ...editData, quantity: e.target.value })}
                  className="input"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="form-group">
                <label className="label label-required">Supplier</label>
                <select
                  value={editData.supplier_id}
                  onChange={(e) => setEditData({ ...editData, supplier_id: e.target.value })}
                  className="select"
                  required
                >
                  {suppliers.map((supplier) => (
                    <option key={supplier.id} value={supplier.id}>
                      {supplier.supplier_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="label label-required">PIC</label>
                {isAdmin ? (
                  <select
                    value={editData.pic_id}
                    onChange={(e) => setEditData({ ...editData, pic_id: e.target.value })}
                    className="select"
                    required
                  >
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.full_name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="input bg-gray-100 flex items-center">
                    <span>{currentUser?.full_name || '-'}</span>
                    <span className="ml-2 text-xs text-gray-500">(Tidak dapat diubah)</span>
                  </div>
                )}
              </div>
            </div>

            <div className="form-group">
              <label className="label label-required">Week Delivery</label>
              <input
                type="text"
                value={editData.week_delivery}
                onChange={(e) => setEditData({ ...editData, week_delivery: e.target.value })}
                className="input"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="form-group">
                <label className="label label-required">Tanggal Mulai</label>
                <input
                  type="date"
                  value={editData.start_date}
                  onChange={(e) => setEditData({ ...editData, start_date: e.target.value })}
                  className="input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="label label-required">Tanggal Selesai</label>
                <input
                  type="date"
                  value={editData.end_date}
                  onChange={(e) => setEditData({ ...editData, end_date: e.target.value })}
                  className="input"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="label">Status</label>
              <select
                value={editData.status}
                onChange={(e) => setEditData({ ...editData, status: e.target.value })}
                className="select"
              >
                <option value="scheduled">Terjadwal</option>
                <option value="in_progress">Proses</option>
                <option value="completed">Selesai</option>
                <option value="cancelled">Batal</option>
              </select>
            </div>

            <div className="form-group">
              <label className="label">Catatan</label>
              <textarea
                value={editData.notes || ''}
                onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
                className="input"
                rows="2"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={updateMutation.isPending}
                className="btn btn-primary flex-1"
              >
                {updateMutation.isPending ? 'Menyimpan...' : 'Update'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowEditModal(false);
                  setEditData(null);
                }}
                className="btn btn-secondary flex-1"
              >
                Batal
              </button>
            </div>
          </form>
        )}
      </Modal>
    </DashboardLayout>
  );
}
