export const CATEGORY_LABELS: Record<string, string> = {
  pollution: 'Water / Air Pollution',
  waste: 'Illegal Dumping',
  deforestation: 'Deforestation',
  industrial: 'Industrial Damage',
  water: 'Water Bodies',
  air: 'Air Quality',
  wildlife: 'Wildlife',
  encroachment: 'Encroachment',
  other: 'Other',
};

export const STATUS_META: Record<
  string,
  { label: string; className: string; dot: string }
> = {
  reported: {
    label: 'Reported',
    className: 'bg-amber-100 text-amber-800 border-amber-200',
    dot: 'bg-amber-500',
  },
  verified: {
    label: 'Verified',
    className: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    dot: 'bg-emerald-500',
  },
  triaged: {
    label: 'With Government',
    className: 'bg-blue-100 text-blue-800 border-blue-200',
    dot: 'bg-blue-500',
  },
  assigned: {
    label: 'NGO Assigned',
    className: 'bg-purple-100 text-purple-800 border-purple-200',
    dot: 'bg-purple-500',
  },
  in_progress: {
    label: 'In Progress',
    className: 'bg-cyan-100 text-cyan-800 border-cyan-200',
    dot: 'bg-cyan-500',
  },
  resolved: {
    label: 'Resolved',
    className: 'bg-green-600 text-white border-green-700',
    dot: 'bg-green-700',
  },
  rejected: {
    label: 'Rejected',
    className: 'bg-stone-200 text-stone-700 border-stone-300',
    dot: 'bg-stone-500',
  },
  duplicate: {
    label: 'Duplicate',
    className: 'bg-stone-100 text-stone-500 border-stone-200',
    dot: 'bg-stone-400',
  },
};

export const STATUS_OPTIONS = [
  { value: '', label: 'All open issues' },
  { value: 'reported', label: 'Reported' },
  { value: 'verified', label: 'Verified' },
  { value: 'triaged', label: 'With Government' },
  { value: 'assigned', label: 'NGO Assigned' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'rejected', label: 'Rejected' },
];

export const CATEGORY_OPTIONS = [
  { value: '', label: 'All categories' },
  ...Object.entries(CATEGORY_LABELS).map(([value, label]) => ({ value, label })),
];

export function statusMeta(status?: string) {
  return STATUS_META[status || 'reported'] || STATUS_META.reported;
}

export function categoryLabel(category?: string) {
  return CATEGORY_LABELS[category || 'other'] || 'Other';
}

export function timeAgo(input?: string | Date) {
  if (!input) return '';
  const date = typeof input === 'string' ? new Date(input) : input;
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  if (Number.isNaN(seconds)) return '';
  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;

  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function severityLabel(severity?: number) {
  const value = severity || 5;
  if (value >= 8) return { label: 'Critical', className: 'text-red-600' };
  if (value >= 6) return { label: 'High', className: 'text-orange-600' };
  if (value >= 4) return { label: 'Moderate', className: 'text-amber-600' };
  return { label: 'Low', className: 'text-emerald-600' };
}
