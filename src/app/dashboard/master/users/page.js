'use client';

import { useState, useMemo, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import DataTable from '@/components/ui/DataTable';
import Modal from '@/components/ui/Modal';
import { RoleBadge } from '@/components/ui/Badge';
import { useUsers, useCreateUser, useUpdateUser, useDeleteUser } from '@/hooks/useApi';

export default function UsersPage() {
  const [showModal, setShowModal] = useState(false);
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
            <span className="font-medium text-gray-900">{getValue()}</span>
          ),
        },
        {
          accessorKey: 'full_name',
          header: 'Nama Lengkap',
        },
        {
          accessorKey: 'email',
          header: 'Email',
          cell: ({ getValue }) => (
            <span className="text-gray-500">{getValue()}</span>
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

  const handleDelete = async (id) => {
    if (!isAdmin) {
      alert('Hanya admin yang dapat menghapus user');
      return;
    }
    if (!confirm('Yakin ingin menghapus user ini?')) return;
    try {
      await deleteMutation.mutateAsync(id);
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <DashboardLayout title="Master User" subtitle="Kelola data user dan PIC">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <span className="font-medium">{users.length} User</span>
        </div>

        {isAdmin ? (
          <button
            onClick={() => {
              resetForm();
              setEditMode(false);
              setShowModal(true);
            }}
            className="btn btn-primary"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Tambah User
          </button>
        ) : (
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-yellow-50 border border-yellow-200 text-yellow-700">
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

      {/* Modal - Only render if admin */}
      {isAdmin && (
        <Modal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setEditMode(false);
            resetForm();
          }}
          title={editMode ? 'Edit User' : 'Tambah User Baru'}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-group">
              <label className="label label-required">Username</label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="input"
                required
              />
            </div>

            <div className="form-group">
              <label className="label label-required">
                Password {editMode && '(kosongkan jika tidak diubah)'}
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="input"
                required={!editMode}
              />
            </div>

            <div className="form-group">
              <label className="label label-required">Nama Lengkap</label>
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className="input"
                required
              />
            </div>

            <div className="form-group">
              <label className="label label-required">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="input"
                required
              />
            </div>

            <div className="form-group">
              <label className="label label-required">Role</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="select"
                required
              >
                <option value="staff">Staff</option>
                <option value="manager">Manager</option>
                <option value="admin">Admin</option>
              </select>
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
      )}
    </DashboardLayout>
  );
}
