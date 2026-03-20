'use client';
import { useParams, useRouter } from 'next/navigation';
import { useState }           from 'react';
import { trpc } from '@/lib/trpc/client';
import { ChartCard }          from '@/components/charts/ChartCard';
import { FollowersChart }     from '@/components/charts/FollowersChart';
import { EngagementChart }    from '@/components/charts/EngagementChart';
import { LikesCommentsChart } from '@/components/charts/LikesCommentsChart';
import { DemographicsChart }  from '@/components/charts/DemographicsChart';
import { PostingHeatmap }     from '@/components/charts/PostingHeatmap';


function formatNumber(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000)     return (n / 1_000).toFixed(0) + 'K';
  return n?.toString() ?? '0';
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

const PLATFORM_BADGE: Record<string, { bg: string; color: string; border: string }> = {
  instagram: { bg: '#FFF0F8', color: '#C4006A', border: '#F9B8D8' },
  youtube:   { bg: '#FFF0F0', color: '#CC0000', border: '#FFBDBD' },
  tiktok:    { bg: '#F0FAFD', color: '#1A6B85', border: '#B3E5F2' },
};

export default function InfluencerProfilePage() {
  
  const { id } = useParams<{ id: string }>();
  const router  = useRouter();

  const { data: influencer, isLoading, error } =
    trpc.influencer.getById.useQuery({ id });

  const [period, setPeriod] = useState('30d');

  const periodDays: Record<string, number> = {
    '7d':  7,
    '30d': 30,
    '90d': 90,
  };

  const { data: history, isLoading: historyLoading } =
    trpc.influencer.getMetricsHistory.useQuery({
      id:   id as string,
      days: periodDays[period],
    });

  if (isLoading) return <ProfileSkeleton />;

  if (error || !influencer) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-muted-foreground text-sm">Influencer not found.</p>
        <button
          onClick={() => router.push('/search')}
          style={{
            background: 'var(--brand-primary)',
            color: '#fff',
            border: 'none',
            borderRadius: 8,
            padding: '8px 20px',
            fontSize: 13,
            cursor: 'pointer',
          }}
        >
          Back to search
        </button>
      </div>
    );
  }

  const inf     = influencer;
  const badge   = PLATFORM_BADGE[inf.platform] ?? PLATFORM_BADGE.instagram;
  const engPct  = inf.engagement_rate
    ? (inf.engagement_rate * 100).toFixed(2) + '%'
    : '—';

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-6 py-8">

        {/* Back button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back to results
        </button>

        {/* Profile Header Card */}
        <div style={{
          background: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: 16,
          padding: 28,
          marginBottom: 20,
        }}>
          <div className="flex items-start gap-5 flex-wrap">

            {/* Avatar */}
            {inf.avatar_url ? (
              <img
                src={inf.avatar_url}
                alt={inf.display_name}
                style={{
                  width: 80, height: 80,
                  borderRadius: '50%',
                  objectFit: 'cover',
                  flexShrink: 0,
                  border: '3px solid var(--brand-primary)',
                }}
              />
            ) : (
              <div style={{
                width: 80, height: 80,
                borderRadius: '50%',
                background: 'rgba(94,48,136,0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 24,
                fontWeight: 600,
                color: 'var(--brand-primary)',
                flexShrink: 0,
                border: '3px solid var(--brand-primary)',
              }}>
                {getInitials(inf.display_name || inf.username)}
              </div>
            )}

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h1 style={{
                  fontSize: 22,
                  fontWeight: 700,
                  color: 'var(--foreground)',
                  margin: 0,
                }}>
                  {inf.display_name || inf.username}
                </h1>

                {/* Verified badge */}
                {inf.is_verified && (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="#185FA5">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                )}

                {/* Platform badge */}
                <span style={{
                  fontSize: 11,
                  padding: '3px 10px',
                  borderRadius: 20,
                  fontWeight: 500,
                  border: `1px solid ${badge.border}`,
                  background: badge.bg,
                  color: badge.color,
                }}>
                  {inf.platform.charAt(0).toUpperCase() + inf.platform.slice(1)}
                </span>
              </div>

              <p style={{
                fontSize: 14,
                color: 'var(--muted-foreground)',
                margin: '0 0 8px',
              }}>
                @{inf.username}
              </p>

              {inf.bio && (
                <p style={{
                  fontSize: 14,
                  color: 'var(--foreground)',
                  lineHeight: 1.6,
                  margin: '0 0 12px',
                  maxWidth: 500,
                }}>
                  {inf.bio}
                </p>
              )}

              {/* Tags row */}
              <div className="flex items-center gap-2 flex-wrap">
                {inf.country && (
                  <span style={{
                    fontSize: 12,
                    padding: '3px 10px',
                    borderRadius: 20,
                    background: 'var(--secondary)',
                    color: 'var(--secondary-foreground)',
                    border: '1px solid var(--border)',
                  }}>
                    {inf.country}
                  </span>
                )}
                {inf.niche?.map((n: string) => (
                  <span key={n} style={{
                    fontSize: 12,
                    padding: '3px 10px',
                    borderRadius: 20,
                    background: 'rgba(94,48,136,0.08)',
                    color: 'var(--brand-primary)',
                    border: '1px solid rgba(94,48,136,0.2)',
                  }}>
                    {n}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: 12,
          marginBottom: 20,
        }}>
          {[
            {
              label: 'Followers',
              value: formatNumber(inf.followers_count),
              icon: '👥',
            },
            {
              label: 'Following',
              value: formatNumber(inf.following_count ?? 0),
              icon: '➕',
            },
            {
              label: 'Posts',
              value: formatNumber(inf.posts_count ?? 0),
              icon: '📸',
            },
            {
              label: 'Engagement rate',
              value: engPct,
              icon: '📈',
              highlight: true,
            },
            {
              label: 'Avg. likes',
              value: formatNumber(Math.round(inf.avg_likes ?? 0)),
              icon: '❤️',
            },
            {
              label: 'Avg. comments',
              value: formatNumber(Math.round(inf.avg_comments ?? 0)),
              icon: '💬',
            },
          ].map((stat) => (
            <div key={stat.label} style={{
              background: stat.highlight
                ? 'rgba(94,48,136,0.06)'
                : 'var(--card)',
              border: stat.highlight
                ? '1px solid rgba(94,48,136,0.2)'
                : '1px solid var(--border)',
              borderRadius: 12,
              padding: '16px 20px',
            }}>
              <div style={{
                fontSize: 11,
                color: 'var(--muted-foreground)',
                marginBottom: 6,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                fontWeight: 500,
              }}>
                {stat.label}
              </div>
              <div style={{
                fontSize: 24,
                fontWeight: 700,
                color: stat.highlight
                  ? 'var(--brand-primary)'
                  : 'var(--foreground)',
                letterSpacing: '-0.02em',
              }}>
                {stat.value}
              </div>
            </div>
          ))}
        </div>

        {/* Account Details Card */}
        <div style={{
          background: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: 16,
          padding: 24,
          marginBottom: 20,
        }}>
          <h2 style={{
            fontSize: 15,
            fontWeight: 600,
            color: 'var(--foreground)',
            marginBottom: 16,
          }}>
            Account details
          </h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px 32px',
          }}>
            {[
              { label: 'Platform',      value: inf.platform },
              { label: 'Country',       value: inf.country       || '—' },
              { label: 'Verified',      value: inf.is_verified ? 'Yes' : 'No' },
              { label: 'Account type',  value: inf.platform === 'youtube' ? 'YouTube Channel' : 'Instagram' },
              { label: 'Last synced',   value: inf.snapshotted_at
                  ? new Date(inf.snapshotted_at).toLocaleDateString('en-US', {
                      day: 'numeric', month: 'short', year: 'numeric',
                    })
                  : '—'
              },
              { label: 'Quality score', value: inf.audience_quality_score
                  ? inf.audience_quality_score + ' / 100'
                  : '—'
              },
            ].map((row) => (
              <div key={row.label} style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                paddingBottom: 12,
                borderBottom: '1px solid var(--border)',
              }}>
                <span style={{
                  fontSize: 11,
                  color: 'var(--muted-foreground)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  fontWeight: 500,
                }}>
                  {row.label}
                </span>
                <span style={{
                  fontSize: 14,
                  color: 'var(--foreground)',
                  fontWeight: 500,
                  textTransform: 'capitalize',
                }}>
                  {row.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Niche Tags Card */}
        {inf.niche && inf.niche.length > 0 && (
          <div style={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
            borderRadius: 16,
            padding: 24,
          }}>
            <h2 style={{
              fontSize: 15,
              fontWeight: 600,
              color: 'var(--foreground)',
              marginBottom: 16,
            }}>
              Content niches
            </h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {inf.niche.map((n: string) => (
                <span key={n} style={{
                  fontSize: 13,
                  padding: '6px 16px',
                  borderRadius: 20,
                  background: 'rgba(94,48,136,0.08)',
                  color: 'var(--brand-primary)',
                  border: '1px solid rgba(94,48,136,0.2)',
                  fontWeight: 500,
                  textTransform: 'capitalize',
                }}>
                  {n}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Analytics Section */}
        <div style={{ marginTop: 20 }}>

          {/* Section header */}
          <h2 style={{
            fontSize:   16,
            fontWeight: 600,
            color:      'var(--foreground)',
            margin:     '0 0 16px',
          }}>
            Analytics
          </h2>

          {historyLoading ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 16,
            }}>
              {[0,1,2,3].map((i) => (
                <div key={i} style={{
                  background:   'var(--card)',
                  border:       '1px solid var(--border)',
                  borderRadius: 16,
                  padding:      24,
                  height:       280,
                  animation:    'pulse 2s infinite',
                }} />
              ))}
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
              gap: 16,
            }}>

              {/* Followers Growth */}
              <ChartCard
                title="Followers growth"
                subtitle="Total followers over time"
                period={period}
                onPeriodChange={setPeriod}
              >
                <FollowersChart data={history || []} />
              </ChartCard>

              {/* Engagement Rate */}
              <ChartCard
                title="Engagement rate"
                subtitle="Avg engagement per post"
                period={period}
                onPeriodChange={setPeriod}
              >
                <EngagementChart data={history || []} />
              </ChartCard>

              {/* Likes & Comments */}
              <ChartCard
                title="Avg likes & comments"
                subtitle="Per post averages"
                period={period}
                onPeriodChange={setPeriod}
              >
                <LikesCommentsChart data={history || []} />
              </ChartCard>

              {/* Audience Demographics */}
              <ChartCard
                title="Audience demographics"
                subtitle="Gender and age breakdown"
              >
                <DemographicsChart
                  genderMale={inf.gender_male}
                  genderFemale={inf.gender_female}
                  age1317={inf.age_13_17}
                  age1824={inf.age_18_24}
                  age2534={inf.age_25_34}
                  age3544={inf.age_35_44}
                  age45Plus={inf.age_45_plus}
                />
              </ChartCard>

              {/* Posting Heatmap — full width */}
              <div style={{ gridColumn: '1 / -1' }}>
                <ChartCard
                  title="Best posting times"
                  subtitle="Engagement activity by day and hour"
                >
                  <PostingHeatmap />
                </ChartCard>
              </div>

            </div>
          )}
          </div>
      </div>
    </div>
  );
}

function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-6 py-8 animate-pulse">
        <div className="h-4 w-24 bg-muted rounded mb-6" />
        <div style={{
          background: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: 16,
          padding: 28,
          marginBottom: 20,
        }}>
          <div className="flex items-start gap-5">
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--muted)', flexShrink: 0 }} />
            <div className="flex-1">
              <div className="h-6 w-48 bg-muted rounded mb-2" />
              <div className="h-4 w-32 bg-muted rounded mb-3" />
              <div className="h-4 w-64 bg-muted rounded" />
            </div>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {[0,1,2,3,4,5].map((i) => (
            <div key={i} style={{
              background: 'var(--card)',
              border: '1px solid var(--border)',
              borderRadius: 12,
              padding: 20,
            }}>
              <div className="h-3 w-20 bg-muted rounded mb-3" />
              <div className="h-7 w-16 bg-muted rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}