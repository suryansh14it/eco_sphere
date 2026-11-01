import { PROJECT_STATUSES } from '@/models/Project';

export const PROJECT_CATEGORY_LABELS: Record<string, string> = {
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

export const PROJECT_CATEGORY_OPTIONS = [
  { value: '', label: 'All categories' },
  ...Object.entries(PROJECT_CATEGORY_LABELS).map(([value, label]) => ({ value, label })),
];

export const PROJECT_STATUS_META: Record<
  string,
  { label: string; className: string; dot: string }
> = {
  open: {
    label: 'Recruiting',
    className: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    dot: 'bg-emerald-500',
  },
  closed: {
    label: 'Closed',
    className: 'bg-stone-200 text-stone-700 border-stone-300',
    dot: 'bg-stone-500',
  },
  completed: {
    label: 'Completed',
    className: 'bg-green-600 text-white border-green-700',
    dot: 'bg-green-700',
  },
};

export const PROJECT_STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  ...PROJECT_STATUSES.map((value) => ({
    value,
    label: PROJECT_STATUS_META[value].label,
  })),
];

export function projectStatusMeta(status?: string) {
  return PROJECT_STATUS_META[status || 'open'] || PROJECT_STATUS_META.open;
}

export function projectCategoryLabel(category?: string) {
  return PROJECT_CATEGORY_LABELS[category || 'other'] || 'Other';
}

export function roleBadge(filled: number, slots: number) {
  if (filled >= slots) return { label: 'Filled', className: 'text-stone-500' };
  return { label: `${slots - filled} open`, className: 'text-emerald-700 font-medium' };
}

export function locationLabel(location?: {
  address?: string;
  district?: string;
  state?: string;
} | null) {
  if (!location) return '';
  return [location.address, location.district, location.state].filter(Boolean).join(', ');
}

export function dateLabel(start?: string | Date | null, end?: string | Date | null) {
  const fmt = (value?: string | Date | null) => {
    if (!value) return null;
    const date = typeof value === 'string' ? new Date(value) : value;
    if (Number.isNaN(date.getTime())) return null;
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };
  const parts = [fmt(start), fmt(end)].filter(Boolean) as string[];
  return parts.join(' – ');
}
