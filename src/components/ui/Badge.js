'use client';

const variants = {
  blue: 'badge-blue',
  green: 'badge-green',
  yellow: 'badge-yellow',
  red: 'badge-red',
  purple: 'badge-purple',
  orange: 'badge-orange',
  gray: 'badge-gray',
};

export default function Badge({ children, variant = 'gray', className = '' }) {
  return (
    <span className={`badge ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}

export function StatusBadge({ status }) {
  const statusConfig = {
    scheduled: { label: 'Terjadwal', variant: 'blue' },
    in_progress: { label: 'Proses', variant: 'yellow' },
    completed: { label: 'Selesai', variant: 'green' },
    cancelled: { label: 'Batal', variant: 'red' },
  };

  const config = statusConfig[status] || { label: status, variant: 'gray' };

  return <Badge variant={config.variant}>{config.label}</Badge>;
}

export function TypeBadge({ type }) {
  const typeConfig = {
    potong: { label: 'Potong', variant: 'blue' },
    jahit: { label: 'Jahit', variant: 'green' },
    sablon: { label: 'Sablon', variant: 'purple' },
    bordir: { label: 'Bordir', variant: 'orange' },
  };

  const config = typeConfig[type] || { label: type, variant: 'gray' };

  return <Badge variant={config.variant}>{config.label}</Badge>;
}

export function RoleBadge({ role }) {
  const roleConfig = {
    admin: { label: 'Admin', variant: 'red' },
    manager: { label: 'Manager', variant: 'blue' },
    staff: { label: 'Staff', variant: 'green' },
  };

  const config = roleConfig[role] || { label: role, variant: 'gray' };

  return <Badge variant={config.variant}>{config.label}</Badge>;
}
