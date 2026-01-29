'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navigation = [
  {
    group: 'Menu',
    items: [
      {
        name: 'Dashboard',
        href: '/dashboard',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v5a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v2a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 12a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1v-7z" />
          </svg>
        ),
      },
      {
        name: 'Input Schedule',
        href: '/dashboard/schedules/new',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        ),
        highlight: true,
      },
    ],
  },
  {
    group: 'Penjadwalan',
    items: [
      {
        name: 'Potong',
        href: '/dashboard/schedules/potong',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243 4.243 3 3 0 004.243-4.243zm0-5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z" />
          </svg>
        ),
        color: 'blue',
      },
      {
        name: 'Jahit',
        href: '/dashboard/schedules/jahit',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
        ),
        color: 'green',
      },
      {
        name: 'Sablon',
        href: '/dashboard/schedules/sablon',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
          </svg>
        ),
        color: 'purple',
      },
      {
        name: 'Bordir',
        href: '/dashboard/schedules/bordir',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
          </svg>
        ),
        color: 'orange',
      },
    ],
  },
  {
    group: 'Master Data',
    items: [
      {
        name: 'Users',
        href: '/dashboard/master/users',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        ),
      },
      {
        name: 'Suppliers',
        href: '/dashboard/master/suppliers',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        ),
      },
      {
        name: 'Articles',
        href: '/dashboard/master/articles',
        icon: (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        ),
      },
    ],
  },
];

const colorClasses = {
  blue: {
    text: 'text-blue-400',
    bg: 'bg-blue-500/20',
    activeBg: 'bg-blue-500/30',
    dot: 'bg-blue-400',
  },
  green: {
    text: 'text-emerald-400',
    bg: 'bg-emerald-500/20',
    activeBg: 'bg-emerald-500/30',
    dot: 'bg-emerald-400',
  },
  purple: {
    text: 'text-purple-400',
    bg: 'bg-purple-500/20',
    activeBg: 'bg-purple-500/30',
    dot: 'bg-purple-400',
  },
  orange: {
    text: 'text-orange-400',
    bg: 'bg-orange-500/20',
    activeBg: 'bg-orange-500/30',
    dot: 'bg-orange-400',
  },
};

export default function Sidebar({ isOpen, onClose }) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div className="sidebar-overlay lg:hidden" onClick={onClose} />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        {/* Logo */}
        <div className="sidebar-header">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-400 via-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-gray-900 animate-pulse" />
            </div>
            <div>
              <h1 className="font-bold text-lg text-white tracking-tight">JQSA</h1>
              <p className="text-xs text-gray-400 font-medium">Production Scheduler</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {navigation.map((group, groupIndex) => (
            <div key={group.group} className={groupIndex > 0 ? 'mt-6' : ''}>
              <div className="sidebar-nav-group">{group.group}</div>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const isActive = pathname === item.href;
                  const colors = item.color ? colorClasses[item.color] : null;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`sidebar-nav-item group ${isActive ? 'active' : ''} ${
                        item.highlight && !isActive
                          ? 'bg-gradient-to-r from-blue-500/10 to-transparent border border-blue-500/20'
                          : ''
                      }`}
                      onClick={() => onClose?.()}
                    >
                      <span
                        className={`flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-200 ${
                          isActive
                            ? colors
                              ? colors.activeBg
                              : 'bg-blue-500/20'
                            : colors
                            ? `${colors.bg} group-hover:${colors.activeBg}`
                            : 'bg-gray-700/50 group-hover:bg-gray-700'
                        }`}
                      >
                        <span className={colors ? colors.text : isActive ? 'text-blue-400' : ''}>
                          {item.icon}
                        </span>
                      </span>
                      <span className="flex-1 font-medium">{item.name}</span>
                      {colors && (
                        <span
                          className={`w-2 h-2 rounded-full ${colors.dot} ${
                            isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-50'
                          } transition-opacity`}
                        />
                      )}
                      {item.highlight && !isActive && (
                        <span className="px-2 py-0.5 text-[10px] font-semibold bg-blue-500/20 text-blue-400 rounded-full uppercase tracking-wider">
                          New
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-gray-800 to-gray-800/50 border border-gray-700/50">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-400 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg shadow-purple-500/20">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white">Pro Version</p>
              <p className="text-xs text-gray-400">v1.0.0</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
