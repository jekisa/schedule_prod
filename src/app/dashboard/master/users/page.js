'use client';

import { useState, useMemo, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import DataTable from '@/components/ui/DataTable';
import Modal from '@/components/ui/Modal';
import { RoleBadge } from '@/components/ui/Badge';
import { useUsers, useCreateUser, useUpdateUser, useDeleteUser } from '@/hooks/useApi';

export default function UsersPage() {
  const [showModal, setShowModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [formData, setFormData] = useState({
    id: '',
    username: '',
    password: '',
    full_name: '',
    email: '',
    role: 'staff',
  });

  const { data, isLoading } = useUsers();
  const createMutation = useCreateUser();
  const updateMutation = useUpdateUser();
  const deleteMutation = useDeleteUser();

  const users = data?.users || [];

  // Get current user role from localStorage
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

  const isAdmin = currentUser?.role === 'admin';

  const columns = useMemo(
    () => {
      const baseColumns = [
        {
          accessorKey: 'username',
          header: 'Username',
          cell: ({ getValue }) => (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center">
                <span className="text-primary-700 font-semibold text-sm">
                  {getValue()?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>
              <span className="font-semibold text-gray-900">{getValue()}</span>
            </div>
          ),
        },
        {
          accessorKey: 'full_name',
          header: 'Nama Lengkap',
          cell: ({ getValue }) => (
            <span className="text-gray-700">{getValue()}</span>
          ),
        },
        {
          accessorKey: 'email',
          header: 'Email',
          cell: ({ getValue }) => (
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span className="text-gray-500">{getValue()}</span>
            </div>
          ),
        },
        {
          accessorKey: 'role',
          header: 'Role',
          cell: ({ getValue }) => <RoleBadge role={getValue()} />,
        },
      ];

      // Only add actions column if user is admin
      if (isAdmin) {
        baseColumns.push({
          id: 'actions',
          header: 'Aksi',
          cell: ({ row }) => (
            <div className="flex items-center gap-1">
              <button
                onClick={() => handleEdit(row.original)}
                className="p-2 rounded-lg text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition-colors"
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
                className="p-2 rounded-lg text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors"
                title="Hapus"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          ),
        });
      }

      return baseColumns;
    },
    [isAdmin]
  );

  const resetForm = () => {
    setFormData({
      id: '',
      username: '',
      password: '',
      full_name: '',
      email: '',
      role: 'staff',
    });
  };

  const handleEdit = (user) => {
    if (!isAdmin) {
      alert('Hanya admin yang dapat mengedit user');
      return;
    }
    setFormData({
      id: user.id,
      username: user.username,
      password: '',
      full_name: user.full_name,
      email: user.email,
      role: user.role,
    });
    setEditMode(true);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAdmin) {
      alert('Hanya admin yang dapat menambah/mengedit user');
      return;
    }
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

  const handleDelete = async () => {
    if (!isAdmin || !deleteId) return;
    try {
      await deleteMutation.mutateAsync(deleteId);
      setShowDeleteConfirm(false);
      setDeleteId(null);
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <DashboardLayout title="Master User" subtitle="Kelola data user dan PIC">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-500 to-rose-600 flex items-center justify-center shadow-lg shadow-rose-500/30">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Daftar User</h2>
            <p className="text-gray-500 text-sm">{users.length} pengguna terdaftar</p>
          </div>
        </div>

        {isAdmin ? (
          <button
            onClick={() => {
              resetForm();
              setEditMode(false);
              setShowModal(true);
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-medium rounded-xl shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40 transition-all"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Tambah User
          </button>
        ) : (
          <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-700">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className="text-sm font-medium">Hanya admin yang dapat mengelola user</span>
          </div>
        )}
      </div>

      {/* Data Table */}
      <DataTable
        data={users}
        columns={columns}
        isLoading={isLoading}
        searchPlaceholder="Cari username, nama, email..."
        emptyMessage="Belum ada data user"
      />

      {/* Add/Edit Modal */}
      {isAdmin && (
        <Modal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setEditMode(false);
            resetForm();
          }}
          title={editMode ? 'Edit User' : 'Tambah User Baru'}
          subtitle={editMode ? 'Perbarui informasi user' : 'Isi data untuk menambah user baru'}
          icon="info"
          footer={
            <>
              <button
                type="button"
                onClick={() => {
                  setShowModal(false);
                  setEditMode(false);
                  resetForm();
                }}
                className="px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-all"
              >
                Batal
              </button>
              <button
                type="submit"
                form="user-form"
                disabled={createMutation.isPending || updateMutation.isPending}
                className="px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center gap-2"
              >
                {(createMutation.isPending || updateMutation.isPending) && (
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                )}
                {editMode ? 'Update' : 'Simpan'}
              </button>
            </>
          }
        >
          <form id="user-form" onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                placeholder="Masukkan username"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password {editMode ? '(kosongkan jika tidak diubah)' : <span className="text-red-500">*</span>}
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                placeholder={editMode ? 'Kosongkan jika tidak diubah' : 'Masukkan password'}
                required={!editMode}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nama Lengkap <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                placeholder="Masukkan nama lengkap"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                placeholder="contoh@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Role <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all bg-white"
                required
              >
                <option value="staff">Staff</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {isAdmin && (
        <Modal
          isOpen={showDeleteConfirm}
          onClose={() => {
            setShowDeleteConfirm(false);
            setDeleteId(null);
          }}
          title="Hapus User"
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
            Apakah Anda yakin ingin menghapus user ini? Data yang sudah dihapus tidak dapat dikembalikan.
          </p>
        </Modal>
      )}
    </DashboardLayout>
  );
}
