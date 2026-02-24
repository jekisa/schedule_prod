'use client';

import { useState, useMemo } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import DataTable from '@/components/ui/DataTable';
import Modal, { ConfirmModal } from '@/components/ui/Modal';
import Badge from '@/components/ui/Badge';
import { useIngredients, useCreateIngredient, useUpdateIngredient, useDeleteIngredient } from '@/hooks/useApi';

const statusConfig = {
  'Menunggu': { variant: 'gray', light: 'bg-gray-100', text: 'text-gray-700' },
  'On Order': { variant: 'blue', light: 'bg-blue-100', text: 'text-blue-700' },
  'Dalam Pengiriman': { variant: 'yellow', light: 'bg-amber-100', text: 'text-amber-700' },
  'Terkirim': { variant: 'green', light: 'bg-emerald-100', text: 'text-emerald-700' },
  'Ditolak': { variant: 'red', light: 'bg-red-100', text: 'text-red-700' },
};

export default function IngredientsPage() {
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [formData, setFormData] = useState({
    id: '',
    no_po_bahan: '',
    status_bahan: '',
    plan_delivery: '',
    qty_po_bahan: '',
  });

  const { data, isLoading } = useIngredients();
  const createMutation = useCreateIngredient();
  const updateMutation = useUpdateIngredient();
  const deleteMutation = useDeleteIngredient();

  const ingredients = data?.ingredients || [];

  const columns = useMemo(
    () => [
      {
        accessorKey: 'no_po_bahan',
        header: 'No PO Bahan',
        cell: ({ getValue }) => (
          <span className="inline-flex items-center gap-1.5 font-semibold text-gray-900 text-sm">
            <svg className="w-4 h-4 text-indigo-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            {getValue()}
          </span>
        ),
      },
      {
        accessorKey: 'status_bahan',
        header: 'Status Bahan',
        cell: ({ getValue }) => {
          const status = getValue();
          if (!status) return <span className="text-gray-400">-</span>;
          const config = statusConfig[status] || { variant: 'gray' };
          return <Badge variant={config.variant} size="sm">{status}</Badge>;
        },
      },
      {
        accessorKey: 'plan_delivery',
        header: 'Plan Delivery',
        cell: ({ getValue }) => {
          const v = getValue();
          if (!v) return <span className="text-gray-400">-</span>;
          return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 text-sm font-medium">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {v}
            </span>
          );
        },
      },
      {
        accessorKey: 'qty_po_bahan',
        header: 'QTY PO Bahan',
        cell: ({ getValue }) => {
          const v = getValue();
          if (!v && v !== 0) return <span className="text-gray-400">-</span>;
          return (
            <span className="text-sm font-semibold text-gray-700">
              {Number(v).toLocaleString('id-ID')}
            </span>
          );
        },
      },
      {
        id: 'actions',
        header: 'Aksi',
        cell: ({ row }) => (
          <div className="flex items-center gap-1">
            <button
              onClick={() => handleEdit(row.original)}
              className="p-2 rounded-lg text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-colors"
              title="Edit bahan"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              onClick={() => openDeleteModal(row.original)}
              className="p-2 rounded-lg text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors"
              title="Hapus bahan"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        ),
      },
    ],
    []
  );

  const resetForm = () => {
    setFormData({
      id: '',
      no_po_bahan: '',
      status_bahan: '',
      plan_delivery: '',
      qty_po_bahan: '',
    });
  };

  const handleEdit = (item) => {
    setFormData({
      id: item.id,
      no_po_bahan: item.no_po_bahan,
      status_bahan: item.status_bahan || '',
      plan_delivery: item.plan_delivery || '',
      qty_po_bahan: item.qty_po_bahan ?? '',
    });
    setEditMode(true);
    setShowModal(true);
  };

  const openDeleteModal = (item) => {
    setItemToDelete(item);
    setDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!itemToDelete) return;
    try {
      await deleteMutation.mutateAsync(itemToDelete.id);
      setDeleteModalOpen(false);
      setItemToDelete(null);
    } catch (error) {
      alert(error.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editMode) {
        await updateMutation.mutateAsync({ ...formData, is_active: true });
      } else {
        await createMutation.mutateAsync(formData);
      }
      setShowModal(false);
      setEditMode(false);
      resetForm();
    } catch (error) {
      alert(error.message);
    }
  };

  const handleOpenAdd = () => {
    resetForm();
    setEditMode(false);
    setShowModal(true);
  };

  // Status stats
  const statusStats = useMemo(() => {
    const stats = {};
    ingredients.forEach((item) => {
      const s = item.status_bahan || 'Tidak Ada Status';
      stats[s] = (stats[s] || 0) + 1;
    });
    return stats;
  }, [ingredients]);

  return (
    <DashboardLayout title="Master Bahan" subtitle={`${ingredients.length} bahan terdaftar`}>
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="inline-flex items-center gap-3 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg shadow-amber-500/25">
          <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <span className="font-semibold">Data Bahan</span>
        </div>

        <button onClick={handleOpenAdd} className="btn btn-primary shadow-lg shadow-blue-500/25">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Tambah Bahan
        </button>
      </div>

      {/* Status Stats */}
      {Object.keys(statusStats).length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {Object.entries(statusStats).map(([status, count]) => {
            const config = statusConfig[status] || { light: 'bg-gray-100', text: 'text-gray-700', variant: 'gray' };
            return (
              <div
                key={status}
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg ${config.light} ${config.text} text-sm font-medium`}
              >
                <span>{status}</span>
                <span className="px-1.5 py-0.5 rounded-md bg-white/60 text-xs font-semibold">
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Data Table */}
      <DataTable
        data={ingredients}
        columns={columns}
        isLoading={isLoading}
        searchPlaceholder="Cari No PO Bahan, status..."
        emptyMessage="Belum ada data bahan"
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setItemToDelete(null);
        }}
        onConfirm={handleDelete}
        title="Hapus Bahan"
        message={
          itemToDelete
            ? `Yakin ingin menghapus bahan "${itemToDelete.no_po_bahan}"? Data yang sudah dihapus tidak dapat dikembalikan.`
            : ''
        }
        confirmText="Hapus"
        cancelText="Batal"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditMode(false);
          resetForm();
        }}
        title={editMode ? 'Edit Bahan' : 'Tambah Bahan Baru'}
        subtitle={editMode ? 'Perbarui informasi bahan' : 'Isi data bahan baru'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* No PO Bahan */}
          <div className="form-group">
            <label className="label label-required">No PO Bahan</label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <input
                type="text"
                value={formData.no_po_bahan}
                onChange={(e) => setFormData({ ...formData, no_po_bahan: e.target.value })}
                className="input rounded-xl pl-10"
                placeholder="Masukkan No PO Bahan"
                required
              />
            </div>
          </div>

          {/* Status Bahan */}
          <div className="form-group">
            <label className="label">Status Bahan</label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <select
                value={formData.status_bahan}
                onChange={(e) => setFormData({ ...formData, status_bahan: e.target.value })}
                className="input rounded-xl pl-10 appearance-none"
              >
                <option value="">-- Pilih Status --</option>
                <option value="Menunggu">Menunggu</option>
                <option value="On Order">On Order</option>
                <option value="Dalam Pengiriman">Dalam Pengiriman</option>
                <option value="Terkirim">Terkirim</option>
                <option value="Ditolak">Ditolak</option>
              </select>
            </div>
          </div>

          {/* Plan Delivery */}
          <div className="form-group">
            <label className="label">Plan Delivery</label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <input
                type="date"
                value={formData.plan_delivery}
                onChange={(e) => setFormData({ ...formData, plan_delivery: e.target.value })}
                className="input rounded-xl pl-10"
              />
            </div>
          </div>

          {/* QTY PO Bahan */}
          <div className="form-group">
            <label className="label">QTY PO Bahan</label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                </svg>
              </div>
              <input
                type="number"
                min="0"
                value={formData.qty_po_bahan}
                onChange={(e) => setFormData({ ...formData, qty_po_bahan: e.target.value })}
                className="input rounded-xl pl-10"
                placeholder="0"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
              className="btn btn-primary flex-1 rounded-xl shadow-lg shadow-blue-500/25"
            >
              {(createMutation.isPending || updateMutation.isPending) ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Menyimpan...
                </span>
              ) : (editMode ? 'Update Bahan' : 'Simpan Bahan')}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowModal(false);
                setEditMode(false);
                resetForm();
              }}
              className="btn btn-secondary flex-1 rounded-xl"
            >
              Batal
            </button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
