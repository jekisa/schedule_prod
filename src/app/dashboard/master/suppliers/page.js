'use client';

import { useState, useMemo } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import DataTable from '@/components/ui/DataTable';
import Modal, { ConfirmModal } from '@/components/ui/Modal';
import { TypeBadge } from '@/components/ui/Badge';
import { useSuppliers, useCreateSupplier, useUpdateSupplier, useDeleteSupplier } from '@/hooks/useApi';

// Supplier type config with colors
const supplierTypeConfig = {
  potong: {
    color: 'bg-blue-500',
    lightColor: 'bg-blue-100',
    textColor: 'text-blue-700',
  },
  jahit: {
    color: 'bg-emerald-500',
    lightColor: 'bg-emerald-100',
    textColor: 'text-emerald-700',
  },
  sablon: {
    color: 'bg-purple-500',
    lightColor: 'bg-purple-100',
    textColor: 'text-purple-700',
  },
  bordir: {
    color: 'bg-orange-500',
    lightColor: 'bg-orange-100',
    textColor: 'text-orange-700',
  },
};

export default function SuppliersPage() {
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [supplierToDelete, setSupplierToDelete] = useState(null);
  const [formData, setFormData] = useState({
    id: '',
    supplier_name: '',
    supplier_type: 'potong',
    contact_person: '',
    phone: '',
    address: '',
  });

  const { data, isLoading } = useSuppliers();
  const createMutation = useCreateSupplier();
  const updateMutation = useUpdateSupplier();
  const deleteMutation = useDeleteSupplier();

  const suppliers = data?.suppliers || [];

  const columns = useMemo(
    () => [
      {
        accessorKey: 'supplier_name',
        header: 'Supplier',
        cell: ({ row }) => {
          const supplier = row.original;
          const typeConfig = supplierTypeConfig[supplier.supplier_type] || supplierTypeConfig.potong;
          const initials = supplier.supplier_name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .substring(0, 2)
            .toUpperCase();

          return (
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${typeConfig.lightColor} ${typeConfig.textColor} flex items-center justify-center font-semibold text-sm shadow-sm`}>
                {initials}
              </div>
              <div>
                <div className="font-semibold text-gray-900">{supplier.supplier_name}</div>
                {supplier.contact_person && (
                  <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    {supplier.contact_person}
                  </div>
                )}
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: 'supplier_type',
        header: 'Tipe',
        cell: ({ getValue }) => <TypeBadge type={getValue()} />,
      },
      {
        accessorKey: 'phone',
        header: 'Telepon',
        cell: ({ getValue }) => {
          const phone = getValue();
          if (!phone) return <span className="text-gray-400">-</span>;
          return (
            <div className="flex items-center gap-2 text-gray-600">
              <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center">
                <svg className="w-3.5 h-3.5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <span className="text-sm">{phone}</span>
            </div>
          );
        },
      },
      {
        accessorKey: 'address',
        header: 'Alamat',
        cell: ({ getValue }) => {
          const address = getValue();
          if (!address) return <span className="text-gray-400">-</span>;
          return (
            <div className="flex items-start gap-2 max-w-[250px]">
              <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-3.5 h-3.5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <span className="text-sm text-gray-600 line-clamp-2">{address}</span>
            </div>
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
              title="Edit supplier"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              onClick={() => openDeleteModal(row.original)}
              className="p-2 rounded-lg text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors"
              title="Hapus supplier"
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
      supplier_name: '',
      supplier_type: 'potong',
      contact_person: '',
      phone: '',
      address: '',
    });
  };

  const handleEdit = (supplier) => {
    setFormData(supplier);
    setEditMode(true);
    setShowModal(true);
  };

  const openDeleteModal = (supplier) => {
    setSupplierToDelete(supplier);
    setDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!supplierToDelete) return;
    try {
      await deleteMutation.mutateAsync(supplierToDelete.id);
      setDeleteModalOpen(false);
      setSupplierToDelete(null);
    } catch (error) {
      alert(error.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editMode) {
        await updateMutation.mutateAsync(formData);
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

  return (
    <DashboardLayout title="Master Supplier" subtitle={`${suppliers.length} supplier terdaftar`}>
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="inline-flex items-center gap-3 px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-lg shadow-indigo-500/25">
          <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <span className="font-semibold">Data Supplier</span>
        </div>

        <button onClick={handleOpenAdd} className="btn btn-primary shadow-lg shadow-blue-500/25">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Tambah Supplier
        </button>
      </div>

      {/* Data Table */}
      <DataTable
        data={suppliers}
        columns={columns}
        isLoading={isLoading}
        searchPlaceholder="Cari nama supplier, contact person..."
        emptyMessage="Belum ada data supplier"
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setSupplierToDelete(null);
        }}
        onConfirm={handleDelete}
        title="Hapus Supplier"
        message={
          supplierToDelete
            ? `Yakin ingin menghapus supplier "${supplierToDelete.supplier_name}"? Data yang sudah dihapus tidak dapat dikembalikan.`
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
        title={editMode ? 'Edit Supplier' : 'Tambah Supplier Baru'}
        subtitle={editMode ? 'Perbarui informasi supplier' : 'Isi data supplier baru'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="form-group">
              <label className="label label-required">Nama Supplier</label>
              <input
                type="text"
                value={formData.supplier_name}
                onChange={(e) => setFormData({ ...formData, supplier_name: e.target.value })}
                className="input rounded-xl"
                placeholder="Masukkan nama supplier"
                required
              />
            </div>

            <div className="form-group">
              <label className="label label-required">Tipe Supplier</label>
              <select
                value={formData.supplier_type}
                onChange={(e) => setFormData({ ...formData, supplier_type: e.target.value })}
                className="select rounded-xl"
                required
              >
                <option value="potong">Potong</option>
                <option value="jahit">Jahit</option>
                <option value="sablon">Sablon</option>
                <option value="bordir">Bordir</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="form-group">
              <label className="label">Contact Person</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={formData.contact_person}
                  onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                  className="input rounded-xl pl-10"
                  placeholder="Nama contact person"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="label">No. Telepon</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="input rounded-xl pl-10"
                  placeholder="08xx-xxxx-xxxx"
                />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="label">Alamat</label>
            <div className="relative">
              <div className="absolute left-3 top-3 text-gray-400">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <textarea
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="input rounded-xl pl-10"
                rows="3"
                placeholder="Alamat lengkap supplier"
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
              ) : (editMode ? 'Update Supplier' : 'Simpan Supplier')}
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
