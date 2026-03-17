'use client';
import type { Filters } from '@/app/search/page';

interface Props {
  filters:          Filters;
  onUpdate:         <K extends keyof Filters>(key: K, value: Filters[K]) => void;
  onClear:          () => void;
  hasActiveFilters: boolean;
}

const PLATFORMS = [
  { value: '',          label: 'All platforms' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'youtube',   label: 'YouTube' },
  { value: 'tiktok',    label: 'TikTok' },
];

const NICHES = [
  { value: '',           label: 'All niches' },
  { value: 'fashion',    label: 'Fashion' },
  { value: 'beauty',     label: 'Beauty' },
  { value: 'fitness',    label: 'Fitness' },
  { value: 'food',       label: 'Food' },
  { value: 'travel',     label: 'Travel' },
  { value: 'tech',       label: 'Tech' },
  { value: 'gaming',     label: 'Gaming' },
  { value: 'lifestyle',  label: 'Lifestyle' },
  { value: 'business',   label: 'Business' },
  { value: 'education',  label: 'Education' },
];

const COUNTRIES = [
  { value: '',   label: 'All countries' },
  { value: 'US', label: 'United States' },
  { value: 'GB', label: 'United Kingdom' },
  { value: 'IN', label: 'India' },
  { value: 'AU', label: 'Australia' },
  { value: 'CA', label: 'Canada' },
  { value: 'FR', label: 'France' },
  { value: 'DE', label: 'Germany' },
  { value: 'IT', label: 'Italy' },
  { value: 'BR', label: 'Brazil' },
];

const selectClass = "text-xs border rounded-md px-2 py-1.5 bg-background text-foreground h-8";

export function FilterPanel({ filters, onUpdate, onClear, hasActiveFilters }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-2 py-3 border-b border-border mb-4">

      {/* Platform */}
      <select
        value={filters.platform || ''}
        onChange={(e) =>
          onUpdate('platform', e.target.value as Filters['platform'] || undefined)
        }
        className={selectClass}
      >
        {PLATFORMS.map((p) => (
          <option key={p.value} value={p.value}>{p.label}</option>
        ))}
      </select>

      {/* Niche */}
      <select
        value={filters.niche || ''}
        onChange={(e) =>
          onUpdate('niche', e.target.value as Filters['niche'] || undefined)
        }
        className={selectClass}
      >
        {NICHES.map((n) => (
          <option key={n.value} value={n.value}>{n.label}</option>
        ))}
      </select>

      {/* Country */}
      <select
        value={filters.country || ''}
        onChange={(e) =>
          onUpdate('country', e.target.value || undefined)
        }
        className={selectClass}
      >
        {COUNTRIES.map((c) => (
          <option key={c.value} value={c.value}>{c.label}</option>
        ))}
      </select>

      {/* Followers min */}
      <div className="flex items-center gap-1">
        <span className="text-xs text-muted-foreground">Followers:</span>
        <input
          type="number"
          value={filters.followersMin || ''}
          onChange={(e) =>
            onUpdate('followersMin', e.target.value ? Number(e.target.value) : undefined)
          }
          placeholder="Min"
          className="text-xs border rounded-md px-2 py-1.5 bg-background w-20 h-8"
        />
        <span className="text-xs text-muted-foreground">–</span>
        <input
          type="number"
          value={filters.followersMax || ''}
          onChange={(e) =>
            onUpdate('followersMax', e.target.value ? Number(e.target.value) : undefined)
          }
          placeholder="Max"
          className="text-xs border rounded-md px-2 py-1.5 bg-background w-20 h-8"
        />
      </div>

      {/* Engagement min */}
      <div className="flex items-center gap-1">
        <span className="text-xs text-muted-foreground">Eng. rate:</span>
        <input
          type="number"
          value={filters.engagementMin || ''}
          onChange={(e) =>
            onUpdate('engagementMin', e.target.value ? Number(e.target.value) : undefined)
          }
          placeholder="Min %"
          className="text-xs border rounded-md px-2 py-1.5 bg-background w-20 h-8"
          step="0.1"
        />
      </div>

      {/* Clear filters */}
      {hasActiveFilters && (
        <button
          onClick={onClear}
          className="text-xs text-blue-600 hover:underline ml-2"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}