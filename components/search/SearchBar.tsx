'use client';
import { Input } from '@/components/ui/input';

interface Props {
  value:     string;
  onChange:  (value: string) => void;
  isLoading: boolean;
}

export function SearchBar({ value, onChange, isLoading }: Props) {
  return (
    <div className="relative mb-4">
      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
        {isLoading ? (
          <div className="w-4 h-4 border-2 border-muted border-t-foreground rounded-full animate-spin" />
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
        )}
      </div>
      <Input
			value={value}
			onChange={(e) => onChange(e.target.value)}
			placeholder="Search influencers by name or username..."
			className="pl-10 h-11 text-sm"
			style={{
				borderColor: 'var(--border)',
				outline: 'none',
			}}
			onFocus={(e) => {
				e.target.style.borderColor = 'var(--brand-primary)';
				e.target.style.boxShadow = '0 0 0 3px rgba(94,48,136,0.12)';
			}}
			onBlur={(e) => {
				e.target.style.borderColor = 'var(--border)';
				e.target.style.boxShadow = 'none';
			}}
		/>
    </div>
  );
}