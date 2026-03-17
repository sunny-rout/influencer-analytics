'use client';
import { useState, useCallback } from 'react';
import { trpc } from '@/lib/trpc/client';
import { useDebounce } from '@/hooks/useDebounce';
import { SearchBar } from '@/components/search/SearchBar';
import { FilterPanel } from '@/components/search/FilterPanel';
import { InfluencerCard } from '@/components/search/InfluencerCard';
import { InfluencerCardSkeleton } from '@/components/search/InfluencerCardSkeleton';

export type Filters = {
  query?:        string;
  platform?:     'instagram' | 'youtube' | 'tiktok';
  followersMin?: number;
  followersMax?: number;
  engagementMin?:number;
  country?:      string;
  niche?:        'fashion' | 'beauty' | 'fitness' | 'food' | 'travel' |
                 'tech' | 'gaming' | 'lifestyle' | 'business' | 'education';
  sortBy:        'followers' | 'engagement' | 'relevance';
  page:          number;
  limit:         number;
};

const DEFAULT_FILTERS: Filters = {
  sortBy: 'followers',
  page:   1,
  limit:  20,
};

export default function SearchPage() {
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const debouncedQuery = useDebounce(filters.query, 400);

  const { data, isLoading, isFetching } = trpc.influencer.search.useQuery(
    { ...filters, query: debouncedQuery },
    { placeholderData: (prev) => prev }
  );

  const updateFilter = useCallback(
    <K extends keyof Filters>(key: K, value: Filters[K]) => {
      setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
    },
    []
  );

  const clearFilters = () => setFilters(DEFAULT_FILTERS);

  const hasActiveFilters =
    filters.platform     ||
    filters.followersMin ||
    filters.followersMax ||
    filters.engagementMin||
    filters.country      ||
    filters.niche;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-foreground mb-1">
            Influencer Discovery
          </h1>
          <p className="text-sm text-muted-foreground">
            Search and filter influencers across platforms
          </p>
        </div>

        {/* Search Bar */}
        <SearchBar
          value={filters.query || ''}
          onChange={(q) => updateFilter('query', q)}
          isLoading={isLoading || isFetching}
        />

        {/* Filter Panel */}
        <FilterPanel
          filters={filters}
          onUpdate={updateFilter}
          onClear={clearFilters}
          hasActiveFilters={!!hasActiveFilters}
        />

        {/* Results Header */}
        <div className="flex items-center justify-between mb-4 mt-6">
          <p className="text-sm text-muted-foreground">
            {isLoading
              ? 'Searching...'
              : `${(data?.total || 0).toLocaleString()} influencers found`
            }
          </p>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Sort by:</span>
            <select
              value={filters.sortBy}
              onChange={(e) =>
                updateFilter('sortBy', e.target.value as Filters['sortBy'])
              }
              className="text-xs border rounded-md px-2 py-1 bg-background"
            >
              <option value="followers">Followers</option>
              <option value="engagement">Engagement</option>
              <option value="relevance">Relevance</option>
            </select>
          </div>
        </div>

        {/* Results Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {isLoading
            ? Array(6).fill(0).map((_, i) => (
                <InfluencerCardSkeleton key={i} />
              ))
            : data?.influencers.map((inf) => (
                <InfluencerCard key={inf.id} influencer={inf} />
              ))
          }
        </div>

        {/* Empty state */}
        {!isLoading && data?.influencers.length === 0 && (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-sm">
              No influencers found. Try adjusting your filters.
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="mt-3 text-sm text-blue-600 hover:underline"
              >
                Clear all filters
              </button>
            )}
          </div>
        )}

        {/* Pagination */}
        {data && data.totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-8">
            <button
              onClick={() =>
                setFilters((f) => ({ ...f, page: f.page - 1 }))
              }
              disabled={filters.page === 1}
              className="px-4 py-2 text-sm border rounded-md disabled:opacity-40"
            >
              Previous
            </button>
            <span className="text-sm text-muted-foreground">
              Page {filters.page} of {data.totalPages}
            </span>
            <button
              onClick={() =>
                setFilters((f) => ({ ...f, page: f.page + 1 }))
              }
              disabled={filters.page === data.totalPages}
              className="px-4 py-2 text-sm border rounded-md disabled:opacity-40"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}