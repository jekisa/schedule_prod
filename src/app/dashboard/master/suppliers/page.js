'use client';

import { useState, useMemo } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import DataTable from '@/components/ui/DataTable';
import Modal from '@/components/ui/Modal';
import { TypeBadge } from '@/components/ui/Badge';
import { useSuppliers, useCreateSupplier, useUpdateSupplier, useDeleteSupplier } from '@/hooks/useApi';

export default function SuppliersPage() {
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
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
        header: 'Nama Supplier',
        cell: ({ getValue }) => (
          <span className="font-medium text-gray-900">{getValue()}</span>
        ),
      },
      {
        accessorKey: 'supplier_type',
        header: 'Tipe',
        cell: ({ getValue }) => <TypeBadge type={getValue()} />,
      },
      {
        accessorKey: 'contact_person',
        header: 'Contact Person',
        cell: ({ getValue }) => getValue() || '-',
      },
      {
        accessorKey: 'phone',
        header: 'Telepon',
        cell: ({ getValue }) => getValue() || '-',
      },
      {
        accessorKey: 'address',
        header: 'Alamat',
        cell: ({ getValue }) => (
          <span className="truncate max-w-[200px] block">{getValue() || '-'}</span>
        ),
      },
      {
        id: 'actions',
        header: 'Aksi',
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleEdit(row.original)}
              className="btn btn-ghost btn-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50"
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

  const handleDelete = async (id) => {
    if (!confirm('Yakin ingin menghapus supplier ini?')) return;
    try {
      await deleteMutation.mutateAsync(id);
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
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-indigo-600 text-white">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <span className="font-medium">Data Supplier</span>
        </div>

        <button onClick={handleOpenAdd} className="btn btn-primary">
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

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditMode(false);
          resetForm();
        }}
        title={editMode ? 'Edit Supplier' : 'Tambah Supplier Baru'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="form-group">
              <label className="label label-required">Nama Supplier</label>
              <input
                type="text"
                value={formData.supplier_name}
                onChange={(e) => setFormData({ ...formData, supplier_name: e.target.value })}
                className="input"
                placeholder="Masukkan nama supplier"
                required
              />
            </div>

            <div className="form-group">
              <label className="label label-required">Tipe Supplier</label>
              <select
                value={formData.supplier_type}
                onChange={(e) => setFormData({ ...formData, supplier_type: e.target.value })}
                className="select"
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
              <input
                type="text"
                value={formData.contact_person}
                onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                className="input"
                placeholder="Nama contact person"
              />
            </div>

            <div className="form-group">
              <label className="label">No. Telepon</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="input"
                placeholder="08xx-xxxx-xxxx"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="label">Alamat</label>
            <textarea
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="input"
              rows="3"
              placeholder="Alamat lengkap supplier"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
              className="btn btn-primary flex-1"
            >
              {(createMutation.isPending || updateMutation.isPending) ? 'Menyimpan...' : (editMode ? 'Update' : 'Simpan')}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowModal(false);
                setEditMode(false);
                resetForm();
              }}
              className="btn btn-secondary flex-1"
            >
              Batal
            </button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  );
}
