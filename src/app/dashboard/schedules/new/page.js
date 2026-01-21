'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { TypeBadge } from '@/components/ui/Badge';
import { useArticles, useSuppliers, useUsers, useCreateSchedule } from '@/hooks/useApi';

const scheduleTypes = [
  { value: 'potong', label: 'Potong', color: 'blue', gradient: 'from-blue-500 to-blue-600', bg: 'bg-blue-500' },
  { value: 'jahit', label: 'Jahit', color: 'green', gradient: 'from-green-500 to-green-600', bg: 'bg-green-500' },
  { value: 'sablon', label: 'Sablon', color: 'purple', gradient: 'from-purple-500 to-purple-600', bg: 'bg-purple-500' },
  { value: 'bordir', label: 'Bordir', color: 'orange', gradient: 'from-orange-500 to-orange-600', bg: 'bg-orange-500' },
];

export default function NewSchedulePage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);
  const [formData, setFormData] = useState({
    schedule_type: 'potong',
    article_id: '',
    article_name: '',
    description: '',
    quantity: '',
    pic_id: '',
    week_delivery: '',
    supplier_id: '',
    start_date: '',
    end_date: '',
    notes: '',
  });

  const { data: articlesData, isLoading: articlesLoading } = useArticles();
  const { data: suppliersData, isLoading: suppliersLoading } = useSuppliers();
  const { data: usersData, isLoading: usersLoading } = useUsers();

  // Get current user from localStorage and auto-fill PIC
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setCurrentUser(user);
        // Auto-fill PIC with current user's ID
        setFormData((prev) => ({ ...prev, pic_id: user.id.toString() }));
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }
  }, []);

  const createSchedulePotong = useCreateSchedule('potong');
  const createScheduleJahit = useCreateSchedule('jahit');
  const createScheduleSablon = useCreateSchedule('sablon');
  const createScheduleBordir = useCreateSchedule('bordir');

  const articles = articlesData?.articles || [];
  const suppliers = suppliersData?.suppliers || [];
  const users = usersData?.users || [];

  const isLoading = articlesLoading || suppliersLoading || usersLoading;

  const currentType = scheduleTypes.find((t) => t.value === formData.schedule_type);

  const filteredSuppliers = useMemo(() => {
    return suppliers.filter((s) => s.supplier_type === formData.schedule_type);
  }, [suppliers, formData.schedule_type]);

  const handleArticleChange = (e) => {
    const articleId = e.target.value;
    const selectedArticle = articles.find((a) => a.id === parseInt(articleId));
    setFormData({
      ...formData,
      article_id: articleId,
      article_name: selectedArticle ? selectedArticle.article_name : '',
      description: selectedArticle ? selectedArticle.description || '' : '',
    });
  };

  const handleScheduleTypeChange = (type) => {
    setFormData({
      ...formData,
      schedule_type: type,
      supplier_id: '',
    });
  };

  const getCreateMutation = () => {
    switch (formData.schedule_type) {
      case 'potong':
        return createSchedulePotong;
      case 'jahit':
        return createScheduleJahit;
      case 'sablon':
        return createScheduleSablon;
      case 'bordir':
        return createScheduleBordir;
      default:
        return createSchedulePotong;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const mutation = getCreateMutation();

    try {
      await mutation.mutateAsync({
        article_id: parseInt(formData.article_id),
        article_name: formData.article_name,
        description: formData.description,
        quantity: parseInt(formData.quantity),
        pic_id: parseInt(formData.pic_id),
        week_delivery: formData.week_delivery,
        supplier_id: parseInt(formData.supplier_id),
        start_date: formData.start_date,
        end_date: formData.end_date,
        notes: formData.notes,
      });
      router.push(`/dashboard/schedules/${formData.schedule_type}`);
    } catch (error) {
      alert(error.message);
    }
  };

  const isSubmitting = createSchedulePotong.isPending || createScheduleJahit.isPending || createScheduleSablon.isPending || createScheduleBordir.isPending;

  if (isLoading) {
    return (
      <DashboardLayout title="Input Schedule Baru" subtitle="Memuat data...">
        <div className="flex items-center justify-center py-20">
          <div className="loading-spinner"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Input Schedule Produksi Baru" subtitle="Buat jadwal produksi baru">
      {/* Header Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r ${currentType?.gradient} text-white`}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span className="font-medium">Tambah Schedule {currentType?.label}</span>
        </div>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Schedule Type Selection */}
          <div className="form-group">
            <label className="label label-required">Tipe Schedule</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {scheduleTypes.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => handleScheduleTypeChange(type.value)}
                  className={`relative p-4 rounded-xl border-2 transition-all duration-200 ${
                    formData.schedule_type === type.value
                      ? `border-${type.color}-500 bg-gradient-to-r ${type.gradient} text-white shadow-lg scale-[1.02]`
                      : 'border-gray-200 hover:border-gray-300 bg-white hover:shadow-md'
                  }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        formData.schedule_type === type.value
                          ? 'bg-white/20'
                          : `bg-${type.color}-100`
                      }`}
                    >
                      <svg
                        className={`w-5 h-5 ${
                          formData.schedule_type === type.value
                            ? 'text-white'
                            : `text-${type.color}-600`
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <span className="font-semibold">{type.label}</span>
                  </div>
                  {formData.schedule_type === type.value && (
                    <div className="absolute top-2 right-2">
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          <hr className="border-gray-200" />

          {/* Article and Quantity */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="form-group">
              <label className="label label-required">Artikel</label>
              <select
                value={formData.article_id}
                onChange={handleArticleChange}
                className="select"
                required
              >
                <option value="">-- Pilih Artikel --</option>
                {articles.map((article) => (
                  <option key={article.id} value={article.id}>
                    {article.article_name} {article.category ? `(${article.category})` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="label label-required">Quantity</label>
              <input
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                className="input"
                placeholder="Jumlah unit"
                min="1"
                required
              />
            </div>
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="label">Deskripsi</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input"
              rows="2"
              placeholder="Deskripsi tambahan (opsional)"
            />
          </div>

          {/* Supplier and PIC */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="form-group">
              <label className="label label-required">
                Supplier <TypeBadge type={formData.schedule_type} />
              </label>
              <select
                value={formData.supplier_id}
                onChange={(e) => setFormData({ ...formData, supplier_id: e.target.value })}
                className="select"
                required
              >
                <option value="">-- Pilih Supplier --</option>
                {filteredSuppliers.map((supplier) => (
                  <option key={supplier.id} value={supplier.id}>
                    {supplier.supplier_name}
                  </option>
                ))}
              </select>
              {filteredSuppliers.length === 0 && (
                <p className="text-sm text-red-500 mt-1 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  Tidak ada supplier untuk tipe {currentType?.label}
                </p>
              )}
            </div>

            <div className="form-group">
              <label className="label label-required">PIC (Person In Charge)</label>
              <select
                value={formData.pic_id}
                onChange={(e) => setFormData({ ...formData, pic_id: e.target.value })}
                className="select"
                required
              >
                <option value="">-- Pilih PIC --</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.full_name} ({user.role})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Week Delivery */}
          <div className="form-group">
            <label className="label label-required">Week Delivery</label>
            <input
              type="text"
              value={formData.week_delivery}
              onChange={(e) => setFormData({ ...formData, week_delivery: e.target.value })}
              className="input"
              placeholder="contoh: W01-2025, W02-2025"
              required
            />
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="form-group">
              <label className="label label-required">Tanggal Mulai</label>
              <input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className="input"
                required
              />
            </div>

            <div className="form-group">
              <label className="label label-required">Tanggal Selesai</label>
              <input
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                className="input"
                min={formData.start_date}
                required
              />
            </div>
          </div>

          {/* Notes */}
          <div className="form-group">
            <label className="label">Catatan</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="input"
              rows="3"
              placeholder="Catatan tambahan (opsional)"
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`btn flex-1 py-3 bg-gradient-to-r ${currentType?.gradient} text-white hover:opacity-90 disabled:opacity-50`}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Menyimpan...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Simpan Schedule {currentType?.label}
                </span>
              )}
            </button>
            <Link href="/dashboard" className="btn btn-secondary flex-1 py-3 text-center">
              Batal
            </Link>
          </div>
        </form>
      </div>

      {/* Quick Links */}
      <div className="card mt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Akses Cepat - Lihat Schedule yang Ada
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {scheduleTypes.map((type) => (
            <Link
              key={type.value}
              href={`/dashboard/schedules/${type.value}`}
              className={`p-4 text-center rounded-xl bg-${type.color}-50 text-${type.color}-700 hover:bg-${type.color}-100 transition-all hover:shadow-md border border-${type.color}-100`}
            >
              <div className="font-medium">Schedule {type.label}</div>
            </Link>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
