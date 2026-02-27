'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { ConfirmModal } from '@/components/ui/Modal';
import {
  useWindows, useCreateWindow, useUpdateWindow, useDeleteWindow,
  useMasterCategories, useCreateMasterCategory, useUpdateMasterCategory, useDeleteMasterCategory,
  useBuyers, useCreateBuyer, useUpdateBuyer, useDeleteBuyer,
  useBrands, useCreateBrand, useUpdateBrand, useDeleteBrand,
} from '@/hooks/useApi';

// ─── Reusable Master List Section ───────────────────────────────────────────

function MasterSection({ title, subtitle, icon, color, items, isLoading, onAdd, onEdit, onDelete, inputPlaceholder }) {
  const [inputValue, setInputValue] = useState('');
  const [editId, setEditId] = useState(null);
  const [editValue, setEditValue] = useState('');
  const [deleteItem, setDeleteItem] = useState(null);
  const [error, setError] = useState('');

  const colorMap = {
    blue: {
      badge: 'bg-blue-100 text-blue-700',
      btn: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500',
      icon: 'bg-blue-500/10 text-blue-600',
      border: 'border-blue-200',
      ring: 'focus:ring-blue-500 focus:border-blue-500',
      editBtn: 'text-blue-600 hover:bg-blue-50',
    },
    violet: {
      badge: 'bg-violet-100 text-violet-700',
      btn: 'bg-violet-600 hover:bg-violet-700 focus:ring-violet-500',
      icon: 'bg-violet-500/10 text-violet-600',
      border: 'border-violet-200',
      ring: 'focus:ring-violet-500 focus:border-violet-500',
      editBtn: 'text-violet-600 hover:bg-violet-50',
    },
    emerald: {
      badge: 'bg-emerald-100 text-emerald-700',
      btn: 'bg-emerald-600 hover:bg-emerald-700 focus:ring-emerald-500',
      icon: 'bg-emerald-500/10 text-emerald-600',
      border: 'border-emerald-200',
      ring: 'focus:ring-emerald-500 focus:border-emerald-500',
      editBtn: 'text-emerald-600 hover:bg-emerald-50',
    },
    amber: {
      badge: 'bg-amber-100 text-amber-700',
      btn: 'bg-amber-600 hover:bg-amber-700 focus:ring-amber-500',
      icon: 'bg-amber-500/10 text-amber-600',
      border: 'border-amber-200',
      ring: 'focus:ring-amber-500 focus:border-amber-500',
      editBtn: 'text-amber-600 hover:bg-amber-50',
    },
  };
  const c = colorMap[color] || colorMap.blue;

  const handleAdd = async () => {
    if (!inputValue.trim()) { setError('Nama tidak boleh kosong'); return; }
    setError('');
    try {
      await onAdd(inputValue.trim());
      setInputValue('');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEditSave = async (id) => {
    if (!editValue.trim()) return;
    try {
      await onEdit(id, editValue.trim());
      setEditId(null);
      setEditValue('');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      await onDelete(deleteItem.id);
      setDeleteItem(null);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-4 px-6 py-5 border-b border-gray-100">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${c.icon}`}>
          {icon}
        </div>
        <div>
          <h3 className="font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-500">{subtitle}</p>
        </div>
        <span className={`ml-auto px-2.5 py-1 rounded-lg text-xs font-semibold ${c.badge}`}>
          {items.length} item
        </span>
      </div>

      {/* Add Input */}
      <div className="px-6 py-4 bg-gray-50 border-b border-gray-100">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => { setInputValue(e.target.value); setError(''); }}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            placeholder={inputPlaceholder}
            className={`flex-1 px-3 py-2 text-sm rounded-xl border border-gray-200 bg-white ${c.ring} focus:outline-none focus:ring-2 transition-colors`}
          />
          <button
            onClick={handleAdd}
            className={`px-4 py-2 rounded-xl text-white text-sm font-medium ${c.btn} focus:outline-none focus:ring-2 focus:ring-offset-1 transition-colors flex items-center gap-1.5`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Tambah
          </button>
        </div>
        {error && (
          <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </p>
        )}
      </div>

      {/* List */}
      <div className="divide-y divide-gray-50">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <svg className="animate-spin w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-400">
            <svg className="w-10 h-10 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <p className="text-sm">Belum ada data. Tambah di atas.</p>
          </div>
        ) : (
          items.map((item, index) => (
            <div key={item.id} className="flex items-center gap-3 px-6 py-3 hover:bg-gray-50 group transition-colors">
              <span className="text-xs font-medium text-gray-400 w-5 text-center">{index + 1}</span>

              {editId === item.id ? (
                <input
                  autoFocus
                  type="text"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleEditSave(item.id);
                    if (e.key === 'Escape') { setEditId(null); setEditValue(''); }
                  }}
                  className={`flex-1 px-2.5 py-1.5 text-sm rounded-lg border ${c.ring} focus:outline-none focus:ring-2 transition-colors`}
                />
              ) : (
                <span className="flex-1 text-sm font-medium text-gray-800">{item.name}</span>
              )}

              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {editId === item.id ? (
                  <>
                    <button
                      onClick={() => handleEditSave(item.id)}
                      className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors"
                      title="Simpan"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </button>
                    <button
                      onClick={() => { setEditId(null); setEditValue(''); }}
                      className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
                      title="Batal"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => { setEditId(item.id); setEditValue(item.name); }}
                      className={`p-1.5 rounded-lg transition-colors ${c.editBtn}`}
                      title="Edit"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => setDeleteItem(item)}
                      className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                      title="Hapus"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Delete Confirm */}
      <ConfirmModal
        isOpen={!!deleteItem}
        onClose={() => setDeleteItem(null)}
        onConfirm={handleDeleteConfirm}
        title={`Hapus ${title}`}
        message={deleteItem ? `Yakin ingin menghapus "${deleteItem.name}"?` : ''}
        confirmText="Hapus"
        cancelText="Batal"
        variant="danger"
      />
    </div>
  );
}

// ─── Main Settings Page ───────────────────────────────────────────────────────

const TABS = [
  { id: 'windows', label: 'Master Window', shortLabel: 'Window' },
  { id: 'categories', label: 'Master Category', shortLabel: 'Category' },
  { id: 'buyers', label: 'Master Buyer', shortLabel: 'Buyer' },
  { id: 'brands', label: 'Master Brand', shortLabel: 'Brand' },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('windows');

  // Windows
  const { data: windowsData, isLoading: windowsLoading } = useWindows();
  const createWindow = useCreateWindow();
  const updateWindow = useUpdateWindow();
  const deleteWindow = useDeleteWindow();

  // Categories
  const { data: categoriesData, isLoading: categoriesLoading } = useMasterCategories();
  const createCategory = useCreateMasterCategory();
  const updateCategory = useUpdateMasterCategory();
  const deleteCategory = useDeleteMasterCategory();

  // Buyers
  const { data: buyersData, isLoading: buyersLoading } = useBuyers();
  const createBuyer = useCreateBuyer();
  const updateBuyer = useUpdateBuyer();
  const deleteBuyer = useDeleteBuyer();

  // Brands
  const { data: brandsData, isLoading: brandsLoading } = useBrands();
  const createBrand = useCreateBrand();
  const updateBrand = useUpdateBrand();
  const deleteBrand = useDeleteBrand();

  const windows = (windowsData?.windows || []).map((w) => ({ id: w.id, name: w.window_name }));
  const categories = (categoriesData?.categories || []).map((c) => ({ id: c.id, name: c.category_name }));
  const buyers = (buyersData?.buyers || []).map((b) => ({ id: b.id, name: b.buyer_name }));
  const brands = (brandsData?.brands || []).map((b) => ({ id: b.id, name: b.brand_name }));

  const totalItems = windows.length + categories.length + buyers.length + brands.length;

  return (
    <DashboardLayout title="Settings" subtitle={`${totalItems} total item master`}>
      {/* Page Header */}
      <div className="flex items-center gap-4 mb-6">
        <div className="inline-flex items-center gap-3 px-4 py-2.5 rounded-xl bg-gradient-to-r from-slate-600 to-slate-700 text-white shadow-lg shadow-slate-500/25">
          <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <span className="font-semibold">Master Data Settings</span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Master Window', count: windows.length, color: 'blue', icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          )},
          { label: 'Master Category', count: categories.length, color: 'violet', icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
          )},
          { label: 'Master Buyer', count: buyers.length, color: 'emerald', icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          )},
          { label: 'Master Brand', count: brands.length, color: 'amber', icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          )},
        ].map(({ label, count, color, icon }) => {
          const bg = color === 'blue' ? 'bg-blue-500/10' : color === 'violet' ? 'bg-violet-500/10' : color === 'emerald' ? 'bg-emerald-500/10' : 'bg-amber-500/10';
          const text = color === 'blue' ? 'text-blue-600' : color === 'violet' ? 'text-violet-600' : color === 'emerald' ? 'text-emerald-600' : 'text-amber-600';
          const num = color === 'blue' ? 'text-blue-700' : color === 'violet' ? 'text-violet-700' : color === 'emerald' ? 'text-emerald-700' : 'text-amber-700';
          return (
            <div key={label} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3 shadow-sm">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${bg} ${text}`}>{icon}</div>
              <div>
                <p className="text-xs text-gray-500 font-medium">{label}</p>
                <p className={`text-2xl font-bold ${num}`}>{count}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-gray-100 rounded-xl mb-6 w-fit">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
              activeTab === tab.id
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <span className="hidden sm:inline">{tab.label}</span>
            <span className="sm:hidden">{tab.shortLabel}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'windows' && (
        <MasterSection
          title="Master Window"
          subtitle="Kelola daftar window produksi (misal: March W1, March W2)"
          color="blue"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          }
          items={windows}
          isLoading={windowsLoading}
          inputPlaceholder="contoh: March W1, April W2 ..."
          onAdd={(name) => createWindow.mutateAsync({ window_name: name })}
          onEdit={(id, name) => updateWindow.mutateAsync({ id, window_name: name })}
          onDelete={(id) => deleteWindow.mutateAsync(id)}
        />
      )}

      {activeTab === 'categories' && (
        <MasterSection
          title="Master Category"
          subtitle="Kelola daftar kategori produk (misal: Short, Tshirt, Jogger)"
          color="violet"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
          }
          items={categories}
          isLoading={categoriesLoading}
          inputPlaceholder="contoh: Short, Tshirt, Jogger ..."
          onAdd={(name) => createCategory.mutateAsync({ category_name: name })}
          onEdit={(id, name) => updateCategory.mutateAsync({ id, category_name: name })}
          onDelete={(id) => deleteCategory.mutateAsync(id)}
        />
      )}

      {activeTab === 'buyers' && (
        <MasterSection
          title="Master Buyer"
          subtitle="Kelola daftar buyer (misal: Natasha, Maria Inez)"
          color="emerald"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          }
          items={buyers}
          isLoading={buyersLoading}
          inputPlaceholder="contoh: Natasha, Maria Inez ..."
          onAdd={(name) => createBuyer.mutateAsync({ buyer_name: name })}
          onEdit={(id, name) => updateBuyer.mutateAsync({ id, buyer_name: name })}
          onDelete={(id) => deleteBuyer.mutateAsync(id)}
        />
      )}

      {activeTab === 'brands' && (
        <MasterSection
          title="Master Brand"
          subtitle="Kelola daftar brand (misal: Nike, Adidas, Uniqlo)"
          color="amber"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          }
          items={brands}
          isLoading={brandsLoading}
          inputPlaceholder="contoh: Nike, Adidas, Uniqlo ..."
          onAdd={(name) => createBrand.mutateAsync({ brand_name: name })}
          onEdit={(id, name) => updateBrand.mutateAsync({ id, brand_name: name })}
          onDelete={(id) => deleteBrand.mutateAsync(id)}
        />
      )}
    </DashboardLayout>
  );
}
