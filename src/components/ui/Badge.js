'use client';

const variants = {
  blue: {
    base: 'bg-blue-50 text-blue-700 border-blue-200',
    dot: 'bg-blue-500',
    gradient: 'bg-gradient-to-r from-blue-500 to-blue-600 text-white',
  },
  green: {
    base: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dot: 'bg-emerald-500',
    gradient: 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white',
  },
  yellow: {
    base: 'bg-amber-50 text-amber-700 border-amber-200',
    dot: 'bg-amber-500',
    gradient: 'bg-gradient-to-r from-amber-500 to-amber-600 text-white',
  },
  red: {
    base: 'bg-red-50 text-red-700 border-red-200',
    dot: 'bg-red-500',
    gradient: 'bg-gradient-to-r from-red-500 to-red-600 text-white',
  },
  purple: {
    base: 'bg-purple-50 text-purple-700 border-purple-200',
    dot: 'bg-purple-500',
    gradient: 'bg-gradient-to-r from-purple-500 to-purple-600 text-white',
  },
  orange: {
    base: 'bg-orange-50 text-orange-700 border-orange-200',
    dot: 'bg-orange-500',
    gradient: 'bg-gradient-to-r from-orange-500 to-orange-600 text-white',
  },
  gray: {
    base: 'bg-gray-50 text-gray-700 border-gray-200',
    dot: 'bg-gray-500',
    gradient: 'bg-gradient-to-r from-gray-500 to-gray-600 text-white',
  },
  cyan: {
    base: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    dot: 'bg-cyan-500',
    gradient: 'bg-gradient-to-r from-cyan-500 to-cyan-600 text-white',
  },
  pink: {
    base: 'bg-pink-50 text-pink-700 border-pink-200',
    dot: 'bg-pink-500',
    gradient: 'bg-gradient-to-r from-pink-500 to-pink-600 text-white',
  },
  indigo: {
    base: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    dot: 'bg-indigo-500',
    gradient: 'bg-gradient-to-r from-indigo-500 to-indigo-600 text-white',
  },
};

const sizes = {
  xs: 'px-2 py-0.5 text-xs',
  sm: 'px-2.5 py-1 text-xs',
  md: 'px-3 py-1.5 text-sm',
  lg: 'px-4 py-2 text-sm',
};

export default function Badge({
  children,
  variant = 'gray',
  size = 'sm',
  showDot = false,
  pulseDot = false,
  outline = false,
  gradient = false,
  rounded = 'full',
  icon,
  className = '',
}) {
  const variantConfig = variants[variant] || variants.gray;
  const sizeClass = sizes[size] || sizes.sm;
  const roundedClass = rounded === 'full' ? 'rounded-full' : rounded === 'lg' ? 'rounded-lg' : 'rounded-md';

  let colorClass = variantConfig.base;
  if (gradient) {
    colorClass = variantConfig.gradient;
  } else if (outline) {
    colorClass = `${variantConfig.base} border`;
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium transition-all ${sizeClass} ${roundedClass} ${colorClass} ${className}`}
    >
      {showDot && (
        <span className={`w-1.5 h-1.5 rounded-full ${variantConfig.dot} ${pulseDot ? 'animate-pulse' : ''}`} />
      )}
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </span>
  );
}

// Status Badge with icons
export function StatusBadge({ status, showIcon = true, size = 'sm' }) {
  const statusConfig = {
    scheduled: {
      label: 'Terjadwal',
      variant: 'blue',
      icon: (
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
    in_progress: {
      label: 'Proses',
      variant: 'yellow',
      showDot: true,
      pulseDot: true,
      icon: (
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      ),
    },
    completed: {
      label: 'Selesai',
      variant: 'green',
      icon: (
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    cancelled: {
      label: 'Batal',
      variant: 'red',
      icon: (
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  };

  const config = statusConfig[status] || { label: status, variant: 'gray' };

  return (
    <Badge
      variant={config.variant}
      size={size}
      showDot={config.showDot}
      pulseDot={config.pulseDot}
      icon={showIcon ? config.icon : null}
    >
      {config.label}
    </Badge>
  );
}

// Type Badge with gradient option
export function TypeBadge({ type, gradient = false, size = 'sm' }) {
  const typeConfig = {
    potong: {
      label: 'Potong',
      variant: 'blue',
      icon: (
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243 4.243 3 3 0 004.243-4.243zm0-5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z" />
        </svg>
      ),
    },
    jahit: {
      label: 'Jahit',
      variant: 'green',
      icon: (
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
        </svg>
      ),
    },
    sablon: {
      label: 'Sablon',
      variant: 'purple',
      icon: (
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      ),
    },
    bordir: {
      label: 'Bordir',
      variant: 'orange',
      icon: (
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      ),
    },
  };

  const config = typeConfig[type] || { label: type, variant: 'gray' };

  return (
    <Badge variant={config.variant} size={size} gradient={gradient} icon={config.icon}>
      {config.label}
    </Badge>
  );
}

// Role Badge with styled appearance
export function RoleBadge({ role, size = 'sm' }) {
  const roleConfig = {
    admin: {
      label: 'Admin',
      variant: 'red',
      icon: (
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
    },
    manager: {
      label: 'Manager',
      variant: 'blue',
      icon: (
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
    },
    staff: {
      label: 'Staff',
      variant: 'green',
      icon: (
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
  };

  const config = roleConfig[role] || { label: role, variant: 'gray' };

  return (
    <Badge variant={config.variant} size={size} icon={config.icon}>
      {config.label}
    </Badge>
  );
}

// Count Badge (for notifications, etc.)
export function CountBadge({ count, max = 99, variant = 'red', size = 'xs' }) {
  const displayCount = count > max ? `${max}+` : count;

  return (
    <Badge variant={variant} size={size} gradient className="min-w-[1.25rem] justify-center">
      {displayCount}
    </Badge>
  );
}

// Priority Badge
export function PriorityBadge({ priority, size = 'sm' }) {
  const priorityConfig = {
    low: {
      label: 'Low',
      variant: 'gray',
      icon: (
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      ),
    },
    medium: {
      label: 'Medium',
      variant: 'yellow',
      icon: (
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
        </svg>
      ),
    },
    high: {
      label: 'High',
      variant: 'orange',
      icon: (
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
      ),
    },
    urgent: {
      label: 'Urgent',
      variant: 'red',
      showDot: true,
      pulseDot: true,
      icon: (
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
    },
  };

  const config = priorityConfig[priority] || priorityConfig.medium;

  return (
    <Badge
      variant={config.variant}
      size={size}
      showDot={config.showDot}
      pulseDot={config.pulseDot}
      icon={config.icon}
    >
      {config.label}
    </Badge>
  );
}
