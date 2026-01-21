'use client';

import { useState, useMemo } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import DataTable from '@/components/ui/DataTable';
import Modal from '@/components/ui/Modal';
import Badge from '@/components/ui/Badge';
import { useArticles, useCreateArticle, useUpdateArticle, useDeleteArticle } from '@/hooks/useApi';

export default function ArticlesPage() {
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    id: '',
    article_name: '',
    description: '',
    category: '',
  });

  const { data, isLoading } = useArticles();
  const createMutation = useCreateArticle();
  const updateMutation = useUpdateArticle();
  const deleteMutation = useDeleteArticle();

  const articles = data?.articles || [];

  const columns = useMemo(
    () => [
      {
        accessorKey: 'article_name',
        header: 'Nama Artikel',
        cell: ({ getValue }) => (
          <span className="font-medium text-gray-900">{getValue()}</span>
        ),
      },
      {
        accessorKey: 'category',
        header: 'Kategori',
        cell: ({ getValue }) => {
          const category = getValue();
          if (!category) return <span className="text-gray-400">-</span>;
          return <Badge variant="blue">{category}</Badge>;
        },
      },
      {
        accessorKey: 'description',
        header: 'Deskripsi',
        cell: ({ getValue }) => (
          <span className="truncate max-w-[300px] block text-gray-500">
            {getValue() || '-'}
          </span>
        ),
      },
      {
        accessorKey: 'is_active',
        header: 'Status',
        cell: ({ getValue }) => (
          <Badge variant={getValue() ? 'green' : 'gray'}>
            {getValue() ? 'Aktif' : 'Nonaktif'}
          </Badge>
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
      article_name: '',
      description: '',
      category: '',
    });
  };

  const handleEdit = (article) => {
    setFormData({
      id: article.id,
      article_name: article.article_name,
      description: article.description || '',
      category: article.category || '',
    });
    setEditMode(true);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Yakin ingin menghapus artikel ini?')) return;
    try {
      await deleteMutation.mutateAsync(id);
    } catch (error) {
      alert(error.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        is_active: true,
      };
      if (editMode) {
        await updateMutation.mutateAsync(payload);
      } else {
        await createMutation.mutateAsync(payload);
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
    <DashboardLayout title="Master Artikel" subtitle={`${articles.length} artikel terdaftar`}>
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 text-white">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <span className="font-medium">Data Artikel</span>
        </div>

        <button onClick={handleOpenAdd} className="btn btn-primary">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Tambah Artikel
        </button>
      </div>

      {/* Data Table */}
      <DataTable
        data={articles}
        columns={columns}
        isLoading={isLoading}
        searchPlaceholder="Cari nama artikel, kategori..."
        emptyMessage="Belum ada data artikel"
      />

      {/* Add/Edit Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditMode(false);
          resetForm();
        }}
        title={editMode ? 'Edit Artikel' : 'Tambah Artikel Baru'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-group">
            <label className="label label-required">Nama Artikel</label>
            <input
              type="text"
              value={formData.article_name}
              onChange={(e) => setFormData({ ...formData, article_name: e.target.value })}
              className="input"
              placeholder="Masukkan nama artikel"
              required
            />
          </div>

          <div className="form-group">
            <label className="label">Kategori</label>
            <input
              type="text"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="input"
              placeholder="contoh: Kaos, Jaket, Kemeja, Celana"
            />
          </div>

          <div className="form-group">
            <label className="label">Deskripsi</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input"
              rows="3"
              placeholder="Deskripsi artikel (opsional)"
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
