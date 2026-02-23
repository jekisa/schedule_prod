'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useNearDeadlineAlerts } from '@/hooks/useApi';

const TYPE_COLORS = {
  potong:  { bg: 'bg-blue-100',   text: 'text-blue-700',   label: 'Potong'  },
  jahit:   { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Jahit'   },
  sablon:  { bg: 'bg-purple-100', text: 'text-purple-700', label: 'Sablon'  },
  bordir:  { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Bordir'  },
};

export default function Header({ onMenuClick, title, subtitle }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const dropdownRef = useRef(null);
  const notifRef = useRef(null);

  const { count: alertCount, alerts } = useNearDeadlineAlerts(2);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/');
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-gradient-to-r from-purple-500 to-indigo-500';
      case 'manager':
        return 'bg-gradient-to-r from-blue-500 to-cyan-500';
      default:
        return 'bg-gradient-to-r from-emerald-500 to-teal-500';
    }
  };

  return (
    <header
      className={`header ${isScrolled ? 'header-scrolled' : ''}`}
    >
      <div className="h-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-full">
          {/* Left side */}
          <div className="flex items-center gap-4">
            {/* Mobile menu button */}
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            {/* Page title */}
            <div className="animate-fade-in">
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{title}</h1>
              </div>
              {subtitle && (
                <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>
              )}
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Quick actions - Hidden on mobile */}
            <div className="hidden md:flex items-center gap-2">
              <button
                onClick={() => router.push('/dashboard/schedules/new')}
                className="btn btn-primary btn-sm"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>New Schedule</span>
              </button>
            </div>

            {/* Notifications */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setShowNotifications((v) => !v)}
                className="relative p-2.5 rounded-xl hover:bg-gray-100 transition-colors"
                title={alertCount > 0 ? `${alertCount} jadwal mendekati batas waktu` : 'Notifikasi'}
              >
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {alertCount > 0 && (
                  <>
                    <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 bg-amber-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
                      {alertCount > 9 ? '9+' : alertCount}
                    </span>
                    <span className="absolute top-1 right-1 min-w-[18px] h-[18px] bg-amber-400 rounded-full animate-ping opacity-60" />
                  </>
                )}
              </button>

              {/* Notification dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden">
                  {/* Header */}
                  <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900">Notifikasi Jadwal</h3>
                      <p className="text-xs text-gray-500 mt-0.5">Sedang proses & berakhir ≤ 2 hari</p>
                    </div>
                    {alertCount > 0 && (
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-semibold rounded-full">
                        {alertCount} jadwal
                      </span>
                    )}
                  </div>

                  {/* Alert list */}
                  <div className="max-h-72 overflow-y-auto">
                    {alertCount === 0 ? (
                      <div className="flex flex-col items-center justify-center py-8 text-gray-400">
                        <svg className="w-10 h-10 mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-sm font-medium">Semua jadwal on track</p>
                        <p className="text-xs mt-0.5">Tidak ada yang mendekati batas waktu</p>
                      </div>
                    ) : (
                      <ul className="divide-y divide-gray-50">
                        {alerts.map((s) => {
                          const tc = TYPE_COLORS[s.type] || {};
                          const isOverdue = s.daysLeft < 0;
                          const isToday = s.daysLeft === 0;
                          return (
                            <li key={`${s.type}-${s.id}`}>
                              <Link
                                href={`/dashboard/schedules/${s.type}`}
                                onClick={() => setShowNotifications(false)}
                                className="flex items-start gap-3 px-4 py-3 hover:bg-amber-50/60 transition-colors"
                              >
                                {/* Urgency indicator */}
                                <div className={`mt-0.5 flex-shrink-0 w-2 h-2 rounded-full ${isOverdue ? 'bg-red-500' : isToday ? 'bg-amber-500 animate-pulse' : 'bg-amber-400'}`} />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-sm font-semibold text-gray-900 truncate">{s.article_name}</span>
                                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${tc.bg} ${tc.text}`}>
                                      {tc.label || s.type}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2 mt-0.5">
                                    <span className="text-xs text-gray-500">
                                      Selesai: {new Date(s.end_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                    </span>
                                  </div>
                                </div>
                                <span className={`flex-shrink-0 text-xs font-bold px-2 py-1 rounded-lg ${
                                  isOverdue
                                    ? 'bg-red-100 text-red-600'
                                    : isToday
                                    ? 'bg-amber-100 text-amber-700'
                                    : 'bg-yellow-100 text-yellow-700'
                                }`}>
                                  {isOverdue ? `${Math.abs(s.daysLeft)}h terlambat` : isToday ? 'Hari ini' : `${s.daysLeft}h lagi`}
                                </span>
                              </Link>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>

                  {/* Footer */}
                  {alertCount > 0 && (
                    <div className="px-4 py-2.5 border-t border-gray-100 bg-gray-50/80">
                      <Link
                        href="/dashboard"
                        onClick={() => setShowNotifications(false)}
                        className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline"
                      >
                        Lihat semua jadwal →
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* User dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="flex items-center gap-3 p-1.5 pr-3 rounded-2xl hover:bg-gray-100 transition-all"
              >
                {/* Avatar */}
                <div className={`w-10 h-10 rounded-xl ${getRoleColor(user?.role)} flex items-center justify-center text-white font-semibold text-sm shadow-lg`}>
                  {getInitials(user?.full_name)}
                </div>

                {/* User info - Hidden on mobile */}
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-semibold text-gray-900 leading-tight">
                    {user?.full_name || 'User'}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">{user?.role || 'Staff'}</p>
                </div>

                {/* Dropdown arrow */}
                <svg
                  className={`w-4 h-4 text-gray-400 transition-transform hidden sm:block ${
                    showDropdown ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown menu */}
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 animate-scale-in origin-top-right">
                  {/* User info in dropdown */}
                  <div className="px-4 py-3 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-xl ${getRoleColor(user?.role)} flex items-center justify-center text-white font-semibold shadow-lg`}>
                        {getInitials(user?.full_name)}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{user?.full_name || 'User'}</p>
                        <p className="text-sm text-gray-500">{user?.email || 'user@example.com'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Menu items */}
                  <div className="py-2">
                    <button
                      onClick={() => {
                        setShowDropdown(false);
                        router.push('/dashboard/master/users');
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <span>My Profile</span>
                    </button>
                    <button
                      onClick={() => {
                        setShowDropdown(false);
                        // Add settings page later
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>Settings</span>
                    </button>
                  </div>

                  {/* Logout */}
                  <div className="border-t border-gray-100 pt-2">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
