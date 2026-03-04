'use client';

import { useState, useEffect, useRef } from 'react';
import {
  useCreateWindow,
  useCreateMasterCategory,
  useCreateBuyer,
  useCreateBrand,
} from '@/hooks/useApi';

const FAB_ITEMS = [
  {
    id: 'window',
    label: 'Master Window',
    placeholder: 'contoh: March W1, April W2 ...',
    color: 'blue',
    fieldKey: 'window_name',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    id: 'category',
    label: 'Master Category',
    placeholder: 'contoh: Short, Tshirt, Jogger ...',
    color: 'violet',
    fieldKey: 'category_name',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
      </svg>
    ),
  },
  {
    id: 'buyer',
    label: 'Master Buyer',
    placeholder: 'contoh: Natasha, Maria Inez ...',
    color: 'emerald',
    fieldKey: 'buyer_name',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    id: 'brand',
    label: 'Master Brand',
    placeholder: 'contoh: Nike, Adidas, Uniqlo ...',
    color: 'amber',
    fieldKey: 'brand_name',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
      </svg>
    ),
  },
];

const COLOR_MAP = {
  blue:    { btn: 'bg-blue-600 hover:bg-blue-700 shadow-blue-500/40',    badge: 'bg-blue-100 text-blue-700',    ring: 'focus:ring-blue-500 focus:border-blue-500',    icon: 'bg-blue-500/10 text-blue-600' },
  violet:  { btn: 'bg-violet-600 hover:bg-violet-700 shadow-violet-500/40',  badge: 'bg-violet-100 text-violet-700',  ring: 'focus:ring-violet-500 focus:border-violet-500',  icon: 'bg-violet-500/10 text-violet-600' },
  emerald: { btn: 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/40', badge: 'bg-emerald-100 text-emerald-700', ring: 'focus:ring-emerald-500 focus:border-emerald-500', icon: 'bg-emerald-500/10 text-emerald-600' },
  amber:   { btn: 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/40',   badge: 'bg-amber-100 text-amber-700',   ring: 'focus:ring-amber-500 focus:border-amber-500',   icon: 'bg-amber-500/10 text-amber-600' },
};

function QuickAddModal({ item, onClose, onSuccess }) {
  const [value, setValue] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  const createWindow   = useCreateWindow();
  const createCategory = useCreateMasterCategory();
  const createBuyer    = useCreateBuyer();
  const createBrand    = useCreateBrand();

  const mutationMap = {
    window:   createWindow,
    category: createCategory,
    buyer:    createBuyer,
    brand:    createBrand,
  };

  const mutation = mutationMap[item.id];
  const c = COLOR_MAP[item.color];

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 50);
  }, []);

  useEffect(() => {
    const handleEsc = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const handleSubmit = async () => {
    if (!value.trim()) { setError('Nama tidak boleh kosong'); return; }
    setError('');
    setLoading(true);
    try {
      await mutation.mutateAsync({ [item.fieldKey]: value.trim() });
      onSuccess(item.label, value.trim());
      onClose();
    } catch (err) {
      setError(err.message || 'Terjadi kesalahan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Backdrop */}
      <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm" aria-hidden="true" />

      {/* Sheet */}
      <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl animate-scale-in overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${c.icon}`}>
            {item.icon}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 text-sm">Tambah {item.label}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-5 py-4">
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => { setValue(e.target.value); setError(''); }}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            placeholder={item.placeholder}
            className={`w-full px-3.5 py-2.5 text-sm rounded-xl border border-gray-200 bg-gray-50 ${c.ring} focus:outline-none focus:ring-2 focus:bg-white transition-all`}
          />
          {error && (
            <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1">
              <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-2 px-5 pb-5">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors disabled:opacity-50"
          >
            Batal
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`flex-1 px-4 py-2.5 text-sm font-medium text-white rounded-xl shadow-lg transition-all disabled:opacity-60 flex items-center justify-center gap-2 ${c.btn}`}
          >
            {loading ? (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            )}
            Simpan
          </button>
        </div>
      </div>
    </div>
  );
}

function Toast({ message, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2500);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div className="fixed bottom-24 right-6 z-50 flex items-center gap-2.5 px-4 py-3 bg-gray-900 text-white text-sm rounded-xl shadow-2xl animate-fade-in">
      <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      {message}
    </div>
  );
}

export default function MasterFAB() {
  const [open, setOpen] = useState(false);
  const [activeItem, setActiveItem] = useState(null);
  const [toast, setToast] = useState(null);
  const containerRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const handleItemClick = (item) => {
    setOpen(false);
    setActiveItem(item);
  };

  const handleSuccess = (label, name) => {
    setToast(`"${name}" ditambahkan ke ${label}`);
  };

  return (
    <>
      {/* FAB container */}
      <div ref={containerRef} className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3">
        {/* Speed-dial items */}
        {FAB_ITEMS.map((item, i) => {
          const c = COLOR_MAP[item.color];
          const delay = open ? `${i * 50}ms` : `${(FAB_ITEMS.length - 1 - i) * 30}ms`;
          return (
            <div
              key={item.id}
              className="flex items-center gap-3"
              style={{
                transitionDelay: delay,
                transitionProperty: 'opacity, transform',
                transitionDuration: '200ms',
                transitionTimingFunction: 'ease',
                opacity: open ? 1 : 0,
                transform: open ? 'translateY(0) scale(1)' : 'translateY(8px) scale(0.9)',
                pointerEvents: open ? 'auto' : 'none',
              }}
            >
              {/* Label chip */}
              <span className={`px-3 py-1.5 rounded-xl text-xs font-semibold shadow-sm border border-white/60 bg-white text-gray-700 whitespace-nowrap select-none`}>
                {item.label}
              </span>
              {/* Icon button */}
              <button
                onClick={() => handleItemClick(item)}
                className={`w-11 h-11 rounded-full text-white shadow-lg flex items-center justify-center transition-transform hover:scale-110 active:scale-95 ${c.btn}`}
                title={item.label}
              >
                {item.icon}
              </button>
            </div>
          );
        })}

        {/* Main FAB button */}
        <button
          onClick={() => setOpen((v) => !v)}
          className="w-14 h-14 rounded-full bg-slate-700 hover:bg-slate-800 text-white shadow-xl shadow-slate-700/40 flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2"
          aria-label={open ? 'Tutup menu' : 'Tambah master data'}
        >
          <svg
            className="w-6 h-6 transition-transform duration-300"
            style={{ transform: open ? 'rotate(45deg)' : 'rotate(0deg)' }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>

      {/* Quick-add modal */}
      {activeItem && (
        <QuickAddModal
          item={activeItem}
          onClose={() => setActiveItem(null)}
          onSuccess={handleSuccess}
        />
      )}

      {/* Toast notification */}
      {toast && (
        <Toast message={toast} onDone={() => setToast(null)} />
      )}
    </>
  );
}
