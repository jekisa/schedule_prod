'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { TypeBadge } from '@/components/ui/Badge';
import { useArticles, useSuppliers, useUsers, useCreateSchedule } from '@/hooks/useApi';

const scheduleTypes = [
  {
    value: 'potong',
    label: 'Potong',
    color: 'blue',
    gradient: 'from-blue-500 to-blue-600',
    bg: 'bg-blue-500',
    light: 'bg-blue-50',
    border: 'border-blue-200',
    text: 'text-blue-600',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243 4.243 3 3 0 004.243-4.243zm0-5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z" />
      </svg>
    ),
  },
  {
    value: 'jahit',
    label: 'Jahit',
    color: 'emerald',
    gradient: 'from-emerald-500 to-emerald-600',
    bg: 'bg-emerald-500',
    light: 'bg-emerald-50',
    border: 'border-emerald-200',
    text: 'text-emerald-600',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
      </svg>
    ),
  },
  {
    value: 'sablon',
    label: 'Sablon',
    color: 'purple',
    gradient: 'from-purple-500 to-purple-600',
    bg: 'bg-purple-500',
    light: 'bg-purple-50',
    border: 'border-purple-200',
    text: 'text-purple-600',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    value: 'bordir',
    label: 'Bordir',
    color: 'orange',
    gradient: 'from-orange-500 to-orange-600',
    bg: 'bg-orange-500',
    light: 'bg-orange-50',
    border: 'border-orange-200',
    text: 'text-orange-600',
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
      </svg>
    ),
  },
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
    const selectedArticle = articles.find((a) => a.id === articleId);
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
        article_id: formData.article_id,
        article_name: formData.article_name,
        description: formData.description,
        quantity: parseInt(formData.quantity),
        pic_id: formData.pic_id,
        week_delivery: formData.week_delivery,
        supplier_id: formData.supplier_id,
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
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 rounded-full border-4 border-primary-200 border-t-primary-500 animate-spin" />
            <p className="text-gray-500">Memuat data...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Input Schedule Produksi Baru" subtitle="Buat jadwal produksi baru">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div className="flex items-center gap-4">
          <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${currentType?.gradient} flex items-center justify-center shadow-lg text-white`}>
            {currentType?.icon}
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Tambah Schedule {currentType?.label}</h2>
            <p className="text-gray-500 text-sm">Isi form di bawah untuk membuat jadwal baru</p>
          </div>
        </div>
      </div>

      <div className="card shadow-lg shadow-gray-200/50 border border-gray-100">
        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          {/* Schedule Type Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-4">
              Tipe Schedule <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {scheduleTypes.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => handleScheduleTypeChange(type.value)}
                  className={`relative p-5 rounded-2xl border-2 transition-all duration-200 ${
                    formData.schedule_type === type.value
                      ? `border-${type.color}-500 bg-gradient-to-br ${type.gradient} text-white shadow-lg scale-[1.02]`
                      : `border-gray-200 bg-white hover:border-gray-300 hover:shadow-md`
                  }`}
                >
                  <div className="flex flex-col items-center gap-3">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        formData.schedule_type === type.value
                          ? 'bg-white/20'
                          : type.light
                      }`}
                    >
                      <span className={formData.schedule_type === type.value ? 'text-white' : type.text}>
                        {type.icon}
                      </span>
                    </div>
                    <span className="font-semibold">{type.label}</span>
                  </div>
                  {formData.schedule_type === type.value && (
                    <div className="absolute top-3 right-3">
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Artikel <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.article_id}
                onChange={handleArticleChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all bg-white"
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                placeholder="Jumlah unit"
                min="1"
                required
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Deskripsi</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all resize-none"
              rows="2"
              placeholder="Deskripsi tambahan (opsional)"
            />
          </div>

          {/* Supplier and PIC */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <span className="flex items-center gap-2">
                  Supplier <TypeBadge type={formData.schedule_type} size="xs" /> <span className="text-red-500">*</span>
                </span>
              </label>
              <select
                value={formData.supplier_id}
                onChange={(e) => setFormData({ ...formData, supplier_id: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all bg-white"
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
                <div className="mt-2 flex items-center gap-2 text-sm text-amber-600 bg-amber-50 px-3 py-2 rounded-lg">
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  Tidak ada supplier untuk tipe {currentType?.label}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                PIC (Person In Charge) <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.pic_id}
                onChange={(e) => setFormData({ ...formData, pic_id: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all bg-white"
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Week Delivery <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.week_delivery}
              onChange={(e) => setFormData({ ...formData, week_delivery: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
              placeholder="contoh: W01-2025, W02-2025"
              required
            />
          </div>

          {/* Date Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tanggal Mulai <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tanggal Selesai <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                min={formData.start_date}
                required
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Catatan</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all resize-none"
              rows="3"
              placeholder="Catatan tambahan (opsional)"
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`flex-1 py-3.5 px-6 bg-gradient-to-r ${currentType?.gradient} text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2`}
            >
              {isSubmitting ? (
                <>
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Menyimpan...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Simpan Schedule {currentType?.label}
                </>
              )}
            </button>
            <Link
              href="/dashboard"
              className="flex-1 py-3.5 px-6 bg-white text-gray-700 font-semibold rounded-xl border border-gray-200 hover:bg-gray-50 transition-all text-center"
            >
              Batal
            </Link>
          </div>
        </form>
      </div>

      {/* Quick Links */}
      <div className="card shadow-lg shadow-gray-200/50 border border-gray-100 mt-6 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Akses Cepat - Lihat Schedule yang Ada
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {scheduleTypes.map((type) => (
            <Link
              key={type.value}
              href={`/dashboard/schedules/${type.value}`}
              className={`group p-4 rounded-xl ${type.light} ${type.border} border hover:shadow-md transition-all`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${type.gradient} flex items-center justify-center text-white group-hover:scale-110 transition-transform`}>
                  {type.icon}
                </div>
                <div>
                  <div className={`font-semibold ${type.text}`}>Schedule {type.label}</div>
                  <div className="text-xs text-gray-500">Lihat daftar</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
