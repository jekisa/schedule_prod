'use client';

import { useState, useMemo } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import DataTable from '@/components/ui/DataTable';
import Modal, { ConfirmModal } from '@/components/ui/Modal';
import Badge from '@/components/ui/Badge';
import { useArticles, useCreateArticle, useUpdateArticle, useDeleteArticle } from '@/hooks/useApi';

// Category config with colors
const categoryConfig = {
  Kaos: { color: 'bg-blue-500', lightColor: 'bg-blue-100', textColor: 'text-blue-700' },
  Jaket: { color: 'bg-purple-500', lightColor: 'bg-purple-100', textColor: 'text-purple-700' },
  Kemeja: { color: 'bg-emerald-500', lightColor: 'bg-emerald-100', textColor: 'text-emerald-700' },
  Celana: { color: 'bg-amber-500', lightColor: 'bg-amber-100', textColor: 'text-amber-700' },
  default: { color: 'bg-gray-500', lightColor: 'bg-gray-100', textColor: 'text-gray-700' },
};

export default function ArticlesPage() {
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [articleToDelete, setArticleToDelete] = useState(null);
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
        header: 'Artikel',
        cell: ({ row }) => {
          const article = row.original;
          const category = article.category || 'default';
          const config = categoryConfig[category] || categoryConfig.default;
          const initials = article.article_name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .substring(0, 2)
            .toUpperCase();

          return (
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${config.lightColor} ${config.textColor} flex items-center justify-center font-semibold text-sm shadow-sm`}>
                {initials}
              </div>
              <div>
                <div className="font-semibold text-gray-900">{article.article_name}</div>
                {article.description && (
                  <div className="text-xs text-gray-500 line-clamp-1 max-w-[200px] mt-0.5">
                    {article.description}
                  </div>
                )}
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: 'category',
        header: 'Kategori',
        cell: ({ getValue }) => {
          const category = getValue();
          if (!category) return <span className="text-gray-400">-</span>;

          const config = categoryConfig[category] || categoryConfig.default;
          return (
            <div className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-lg ${config.lightColor} flex items-center justify-center`}>
                <svg className={`w-4 h-4 ${config.textColor}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
              <Badge variant="blue" size="sm">{category}</Badge>
            </div>
          );
        },
      },
      {
        accessorKey: 'is_active',
        header: 'Status',
        cell: ({ getValue }) => {
          const isActive = getValue();
          return (
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-gray-400'}`} />
              <Badge variant={isActive ? 'green' : 'gray'} size="sm">
                {isActive ? 'Aktif' : 'Nonaktif'}
              </Badge>
            </div>
          );
        },
      },
      {
        accessorKey: 'createdAt',
        header: 'Dibuat',
        cell: ({ getValue }) => {
          const date = getValue();
          if (!date) return <span className="text-gray-400">-</span>;

          const formatted = new Date(date).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          });

          return (
            <div className="flex items-center gap-2 text-gray-600">
              <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center">
                <svg className="w-3.5 h-3.5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <span className="text-sm">{formatted}</span>
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
              title="Edit artikel"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              onClick={() => openDeleteModal(row.original)}
              className="p-2 rounded-lg text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors"
              title="Hapus artikel"
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

  const openDeleteModal = (article) => {
    setArticleToDelete(article);
    setDeleteModalOpen(true);
  };

  const handleDelete = async () => {
    if (!articleToDelete) return;
    try {
      await deleteMutation.mutateAsync(articleToDelete.id);
      setDeleteModalOpen(false);
      setArticleToDelete(null);
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

  // Calculate category stats
  const categoryStats = useMemo(() => {
    const stats = {};
    articles.forEach((article) => {
      const cat = article.category || 'Lainnya';
      stats[cat] = (stats[cat] || 0) + 1;
    });
    return stats;
  }, [articles]);

  return (
    <DashboardLayout title="Master Artikel" subtitle={`${articles.length} artikel terdaftar`}>
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="inline-flex items-center gap-3 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/25">
          <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <span className="font-semibold">Data Artikel</span>
        </div>

        <button onClick={handleOpenAdd} className="btn btn-primary shadow-lg shadow-blue-500/25">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Tambah Artikel
        </button>
      </div>

      {/* Category Stats */}
      {Object.keys(categoryStats).length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {Object.entries(categoryStats).map(([category, count]) => {
            const config = categoryConfig[category] || categoryConfig.default;
            return (
              <div
                key={category}
                className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg ${config.lightColor} ${config.textColor} text-sm font-medium`}
              >
                <span>{category}</span>
                <span className={`px-1.5 py-0.5 rounded-md ${config.color} text-white text-xs`}>
                  {count}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* Data Table */}
      <DataTable
        data={articles}
        columns={columns}
        isLoading={isLoading}
        searchPlaceholder="Cari nama artikel, kategori..."
        emptyMessage="Belum ada data artikel"
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setArticleToDelete(null);
        }}
        onConfirm={handleDelete}
        title="Hapus Artikel"
        message={
          articleToDelete
            ? `Yakin ingin menghapus artikel "${articleToDelete.article_name}"? Data yang sudah dihapus tidak dapat dikembalikan.`
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
        title={editMode ? 'Edit Artikel' : 'Tambah Artikel Baru'}
        subtitle={editMode ? 'Perbarui informasi artikel' : 'Isi data artikel baru'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="form-group">
            <label className="label label-required">Nama Artikel</label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
              </div>
              <input
                type="text"
                value={formData.article_name}
                onChange={(e) => setFormData({ ...formData, article_name: e.target.value })}
                className="input rounded-xl pl-10"
                placeholder="Masukkan nama artikel"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="label">Kategori</label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <input
                type="text"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="input rounded-xl pl-10"
                placeholder="contoh: Kaos, Jaket, Kemeja, Celana"
                list="category-suggestions"
              />
              <datalist id="category-suggestions">
                <option value="Kaos" />
                <option value="Jaket" />
                <option value="Kemeja" />
                <option value="Celana" />
                <option value="Sweater" />
                <option value="Hoodie" />
              </datalist>
            </div>
            <p className="text-xs text-gray-500 mt-1">Ketik kategori atau pilih dari saran</p>
          </div>

          <div className="form-group">
            <label className="label">Deskripsi</label>
            <div className="relative">
              <div className="absolute left-3 top-3 text-gray-400">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                </svg>
              </div>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="input rounded-xl pl-10"
                rows="3"
                placeholder="Deskripsi artikel (opsional)"
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
              ) : (editMode ? 'Update Artikel' : 'Simpan Artikel')}
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
