import Link from 'next/link';
import { Badge } from '@/components/ui/badge';


interface Influencer {
  id:                    string;
  username:              string;
  display_name:          string;
  avatar_url:            string;
  platform:              'instagram' | 'youtube' | 'tiktok';
  niche:                 string[];
  country:               string;
  is_verified:           boolean;
  followers_count:       number;
  engagement_rate:       number;
  avg_likes:             number;
  avg_comments:          number;
  audience_quality_score:number;
}

interface Props {
  influencer: Influencer;
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000)     return (n / 1_000).toFixed(0) + 'K';
  return n.toString();
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export function InfluencerCard({ influencer: inf }: Props) {
  return (
    <Link href={`/influencer/${inf.id}`} className="block group">
      <div className="bg-card border border-border rounded-xl p-4 hover:border-foreground/20 hover:shadow-sm transition-all duration-150">

        {/* Header */}
        <div className="flex items-start gap-3 mb-3">
          {inf.avatar_url ? (
            <img
              src={inf.avatar_url}
              alt={inf.display_name}
              className="w-11 h-11 rounded-full object-cover flex-shrink-0"
            />
          ) : (
            <div className="w-11 h-11 rounded-full bg-blue-50 flex items-center justify-center text-blue-700 text-sm font-medium flex-shrink-0">
              {getInitials(inf.display_name || inf.username)}
            </div>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1 flex-wrap">
              <span className="text-sm font-medium text-foreground truncate">
                {inf.display_name || inf.username}
              </span>
              {inf.is_verified && (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="#185FA5">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              )}
            </div>
            <span className="text-xs text-muted-foreground">
              @{inf.username}
            </span>
          </div>

          <span style={{
                fontSize: 11,
                padding: '2px 8px',
                borderRadius: 20,
                fontWeight: 500,
                border: '1px solid',
                flexShrink: 0,
                ...(inf.platform === 'instagram' && {
                    background: '#FFF0F8',
                    color: '#C4006A',
                    borderColor: '#F9B8D8',
                }),
                ...(inf.platform === 'youtube' && {
                    background: '#FFF0F0',
                    color: '#CC0000',
                    borderColor: '#FFBDBD',
                }),
                ...(inf.platform === 'tiktok' && {
                    background: '#F0FAFD',
                    color: '#1A6B85',
                    borderColor: '#B3E5F2',
                }),
                }}>
                {inf.platform.charAt(0).toUpperCase() + inf.platform.slice(1)}
          </span>
        </div>

        {/* Divider */}
        <div className="border-t border-border mb-3" />

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
          <div>
            <p className="text-[11px] text-muted-foreground mb-0.5">Followers</p>
            <p className="text-sm font-medium text-foreground">
              {formatNumber(inf.followers_count)}
            </p>
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground mb-0.5">Eng. rate</p>
            <p className="text-sm font-medium text-foreground">
              {inf.engagement_rate
                ? (inf.engagement_rate * 100).toFixed(2) + '%'
                : '—'
              }
            </p>
          </div>
          <div>
            <p className="text-[11px] text-muted-foreground mb-0.5">Country</p>
            <p className="text-sm font-medium text-foreground">
              {inf.country || '—'}
            </p>
          </div>
        </div>

        {/* Niche tags */}
        {inf.niche && inf.niche.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {inf.niche.slice(0, 3).map((n) => (
              <span
                key={n}
                className="text-[11px] px-2 py-0.5 bg-secondary text-secondary-foreground rounded-full"
              >
                {n}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}