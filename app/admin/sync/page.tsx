'use client';
import { useState } from 'react';
import { trpc }     from '@/lib/trpc/client';

type SyncResult = {
  username: string;
  status:   'success' | 'error' | 'pending';
  data?: {
    influencerId:   string;
    username:       string;
    displayName?:   string;
    followersCount: number;
    engagementRate: string;
    country:        string | null;
  };
  error?: string;
};

function formatNumber(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000)     return (n / 1_000).toFixed(0)     + 'K';
  return n.toString();
}

export default function AdminSyncPage() {
  const [input,           setInput]           = useState('');
  const [country,         setCountry]         = useState('');
  const [results,         setResults]         = useState<SyncResult[]>([]);
  const [syncingUsername, setSyncingUsername] = useState('');
  const [summary,         setSummary]         = useState<{
    total: number; succeeded: number; failed: number;
  } | null>(null);

  const singleSync = trpc.influencer.syncFromInstagram.useMutation({
    onSuccess: (data) => {
      setResults((prev) => [{
        username: data.username,
        status:   'success',
        data: {
          influencerId:   data.influencerId,
          username:       data.username,
          followersCount: data.followersCount,
          engagementRate: data.engagementRate,
          country:        data.country ?? null,
        },
      }, ...prev.filter((r) => r.username !== data.username)]);

      setSummary({ total: 1, succeeded: 1, failed: 0 });
    },
    onError: (err) => {
      setResults((prev) => [{
        username: syncingUsername,
        status:   'error',
        error:    err.message,
      }, ...prev.filter((r) => r.username !== syncingUsername)]);

      setSummary({ total: 1, succeeded: 0, failed: 1 });
    },
  });

  const bulkSync = trpc.influencer.bulkSyncFromInstagram.useMutation({
    onSuccess: (data) => {
      setSummary({
        total:     data.total,
        succeeded: data.succeeded,
        failed:    data.failed,
      });

      // Replace pending results with actual results
      setResults(data.results.map((r) => ({
        username: r.username,
        status:   r.status,
        data:     r.data,
        error:    r.error,
      })));

      setInput('');
    },
    onError: (err) => {
      // Mark all pending as error
      setResults((prev) =>
        prev.map((r) =>
          r.status === 'pending'
            ? { ...r, status: 'error' as const, error: err.message }
            : r
        )
      );
    },
  });

  const isLoading = singleSync.isPending || bulkSync.isPending;

  const handleSync = () => {
    const raw = input.trim();
    if (!raw || isLoading) return;

    setSummary(null);

    // Parse usernames — split by newline or comma, strip @
    const usernames = raw
      .split(/[\n,]+/)
      .map((u) => u.trim().replace(/@/g, ''))
      .filter(Boolean);

    if (usernames.length === 0) return;

    if (usernames.length === 1) {
      setSyncingUsername(usernames[0]);
      // Show immediate pending state
      setResults([{ username: usernames[0], status: 'pending' }]);
      singleSync.mutate({
        userId:               usernames[0],
        country:              country || undefined,
        useBusinessDiscovery: true,
      });
    } else {
      // Show all as pending immediately
      setResults(usernames.map((u) => ({
        username: u,
        status:   'pending' as const,
      })));
      bulkSync.mutate({
        usernames,
        country: country || undefined,
      });
    }
  };

  const clearResults = () => {
    setResults([]);
    setSummary(null);
    setInput('');
  };

  const usernameCount = input.trim()
    ? input.trim()
        .split(/[\n,]+/)
        .filter((u) => u.trim()).length
    : 0;

  return (
    <div className="min-h-screen bg-background">
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '32px 24px' }}>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{
            fontSize:   22,
            fontWeight: 700,
            color:      'var(--foreground)',
            margin:     '0 0 6px',
          }}>
            Instagram Creator Sync
          </h1>
          <p style={{
            fontSize: 14,
            color:    'var(--muted-foreground)',
            margin:   0,
          }}>
            Fetch and save Instagram creator profiles
            via Business Discovery API
          </p>
        </div>

        {/* Info banner */}
        <div style={{
          background:   'rgba(51,176,212,0.08)',
          border:       '1px solid rgba(51,176,212,0.25)',
          borderRadius: 10,
          padding:      '12px 16px',
          marginBottom: 24,
          fontSize:     13,
          color:        '#1A6B85',
          lineHeight:   1.6,
        }}>
          <strong>Requirements:</strong> Target accounts must be
          Instagram Business or Creator accounts.
          Personal accounts cannot be fetched via Business Discovery API.
        </div>

        {/* Input card */}
        <div style={{
          background:   'var(--card)',
          border:       '1px solid var(--border)',
          borderRadius: 16,
          padding:      24,
          marginBottom: 20,
        }}>
          <label style={{
            display:      'block',
            fontSize:     13,
            fontWeight:   500,
            color:        'var(--foreground)',
            marginBottom: 8,
          }}>
            Instagram username(s)
          </label>

          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              'Enter one or multiple usernames:\n' +
              'cristiano\nneymarjr\nleomessi\n\n' +
              'Or comma separated: cristiano, neymarjr'
            }
            rows={5}
            style={{
              width:        '100%',
              padding:      '10px 12px',
              borderRadius: 8,
              border:       '1px solid var(--border)',
              background:   'var(--input)',
              color:        'var(--foreground)',
              fontSize:     13,
              resize:       'vertical',
              fontFamily:   'inherit',
              lineHeight:   1.6,
              boxSizing:    'border-box',
              outline:      'none',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = 'var(--brand-primary)';
              e.target.style.boxShadow   =
                '0 0 0 3px rgba(94,48,136,0.12)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'var(--border)';
              e.target.style.boxShadow   = 'none';
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.metaKey) handleSync();
            }}
          />

          {/* Options row */}
          <div style={{
            display:    'flex',
            alignItems: 'center',
            gap:        12,
            marginTop:  12,
            flexWrap:   'wrap',
          }}>
            <div style={{
              display:    'flex',
              alignItems: 'center',
              gap:        8,
            }}>
              <label style={{
                fontSize:   13,
                color:      'var(--muted-foreground)',
                flexShrink: 0,
              }}>
                Country (optional):
              </label>
              <input
                value={country}
                onChange={(e) =>
                  setCountry(e.target.value.toUpperCase())
                }
                placeholder="IN"
                maxLength={2}
                style={{
                  width:        60,
                  padding:      '6px 10px',
                  borderRadius: 8,
                  border:       '1px solid var(--border)',
                  background:   'var(--input)',
                  color:        'var(--foreground)',
                  fontSize:     13,
                  textAlign:    'center',
                  outline:      'none',
                }}
              />
            </div>

            <div style={{
              marginLeft: 'auto',
              display:    'flex',
              gap:        8,
            }}>
              {results.length > 0 && (
                <button
                  onClick={clearResults}
                  style={{
                    padding:      '8px 16px',
                    borderRadius: 8,
                    border:       '1px solid var(--border)',
                    background:   'transparent',
                    color:        'var(--muted-foreground)',
                    fontSize:     13,
                    cursor:       'pointer',
                  }}
                >
                  Clear
                </button>
              )}
              <button
                onClick={handleSync}
                disabled={isLoading || !input.trim()}
                style={{
                  padding:      '8px 24px',
                  borderRadius: 8,
                  border:       'none',
                  background:   isLoading || !input.trim()
                    ? 'var(--muted)'
                    : 'var(--brand-primary)',
                  color:        isLoading || !input.trim()
                    ? 'var(--muted-foreground)'
                    : '#fff',
                  fontSize:     13,
                  fontWeight:   600,
                  cursor:       isLoading || !input.trim()
                    ? 'not-allowed'
                    : 'pointer',
                  display:      'flex',
                  alignItems:   'center',
                  gap:          8,
                }}
              >
                {isLoading ? (
                  <>
                    <div style={{
                      width:        14,
                      height:       14,
                      border:       '2px solid rgba(255,255,255,0.3)',
                      borderTop:    '2px solid #fff',
                      borderRadius: '50%',
                      animation:    'spin 0.8s linear infinite',
                    }} />
                    Syncing...
                  </>
                ) : (
                  `Sync ${usernameCount > 1
                    ? `${usernameCount} creators`
                    : 'creator'
                  }`
                )}
              </button>
            </div>
          </div>

          {/* Username count hint */}
          {usernameCount > 0 && (
            <p style={{
              fontSize: 12,
              color:    'var(--muted-foreground)',
              margin:   '8px 0 0',
            }}>
              {usernameCount} username{usernameCount > 1 ? 's' : ''} detected
              {usernameCount > 1 && ' — will run as bulk sync'}
              {' · '}
              <span style={{ opacity: 0.7 }}>
                Cmd+Enter to sync
              </span>
            </p>
          )}
        </div>

        {/* Summary bar */}
        {summary && (
          <div style={{
            display:      'flex',
            gap:          12,
            marginBottom: 16,
            flexWrap:     'wrap',
          }}>
            {[
              {
                label: 'Total',
                value: summary.total,
                color: 'var(--foreground)',
                bg:    'var(--card)',
              },
              {
                label: 'Succeeded',
                value: summary.succeeded,
                color: '#0F6E56',
                bg:    '#E1F5EE',
              },
              {
                label: 'Failed',
                value: summary.failed,
                color: '#993C1D',
                bg:    '#FAECE7',
              },
            ].map((s) => (
              <div key={s.label} style={{
                background:   s.bg,
                border:       '1px solid var(--border)',
                borderRadius: 10,
                padding:      '10px 20px',
                display:      'flex',
                alignItems:   'center',
                gap:          10,
              }}>
                <span style={{
                  fontSize:   22,
                  fontWeight: 700,
                  color:      s.color,
                }}>
                  {s.value}
                </span>
                <span style={{
                  fontSize: 13,
                  color:    'var(--muted-foreground)',
                }}>
                  {s.label}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Results list */}
        {results.length > 0 && (
          <div style={{
            display:       'flex',
            flexDirection: 'column',
            gap:           8,
          }}>
            <h2 style={{
              fontSize:   14,
              fontWeight: 600,
              color:      'var(--foreground)',
              margin:     '0 0 8px',
            }}>
              Results ({results.length})
            </h2>

            {results.map((r, i) => (
              <div key={i} style={{
                background:   'var(--card)',
                border:       `1px solid ${
                  r.status === 'success' ? 'rgba(15,110,86,0.2)'  :
                  r.status === 'error'   ? 'rgba(153,60,29,0.2)'  :
                                           'rgba(94,48,136,0.15)'
                }`,
                borderLeft:   `3px solid ${
                  r.status === 'success' ? '#1D9E75'               :
                  r.status === 'error'   ? '#D85A30'               :
                                           'var(--brand-primary)'
                }`,
                borderRadius: 10,
                padding:      '14px 16px',
                display:      'flex',
                alignItems:   'center',
                gap:          16,
                flexWrap:     'wrap',
              }}>

                {/* Status icon */}
                <div style={{
                  width:          28,
                  height:         28,
                  borderRadius:   '50%',
                  background:
                    r.status === 'success' ? 'rgba(15,110,86,0.1)'  :
                    r.status === 'error'   ? 'rgba(153,60,29,0.1)'  :
                                             'rgba(94,48,136,0.1)',
                  display:        'flex',
                  alignItems:     'center',
                  justifyContent: 'center',
                  flexShrink:     0,
                }}>
                  {r.status === 'success' ? (
                    <svg width="14" height="14" viewBox="0 0 24 24"
                      fill="none" stroke="#1D9E75" strokeWidth="2.5">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : r.status === 'error' ? (
                    <svg width="14" height="14" viewBox="0 0 24 24"
                      fill="none" stroke="#D85A30" strokeWidth="2.5">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6"  y1="6" x2="18" y2="18" />
                    </svg>
                  ) : (
                    <div style={{
                      width:        12,
                      height:       12,
                      border:       '2px solid rgba(94,48,136,0.2)',
                      borderTop:    '2px solid var(--brand-primary)',
                      borderRadius: '50%',
                      animation:    'spin 0.8s linear infinite',
                    }} />
                  )}
                </div>

                {/* Username + error message */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{
                    fontSize:   14,
                    fontWeight: 600,
                    color:      'var(--foreground)',
                    margin:     '0 0 2px',
                  }}>
                    @{r.username}
                  </p>
                  {r.status === 'error' && (
                    <p style={{
                      fontSize: 12,
                      color:    '#D85A30',
                      margin:   0,
                    }}>
                      {r.error}
                    </p>
                  )}
                  {r.status === 'pending' && (
                    <p style={{
                      fontSize: 12,
                      color:    'var(--muted-foreground)',
                      margin:   0,
                    }}>
                      Fetching from Instagram...
                    </p>
                  )}
                </div>

                {/* Stats — success only */}
                {r.status === 'success' && r.data && (
                  <div style={{
                    display:    'flex',
                    gap:        20,
                    flexShrink: 0,
                    flexWrap:   'wrap',
                    alignItems: 'center',
                  }}>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{
                        fontSize: 11,
                        color:    'var(--muted-foreground)',
                        margin:   '0 0 2px',
                      }}>
                        Followers
                      </p>
                      <p style={{
                        fontSize:   14,
                        fontWeight: 600,
                        color:      'var(--brand-primary)',
                        margin:     0,
                      }}>
                        {formatNumber(r.data.followersCount)}
                      </p>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <p style={{
                        fontSize: 11,
                        color:    'var(--muted-foreground)',
                        margin:   '0 0 2px',
                      }}>
                        Engagement
                      </p>
                      <p style={{
                        fontSize:   14,
                        fontWeight: 600,
                        color:      '#EF338D',
                        margin:     0,
                      }}>
                        {r.data.engagementRate}
                      </p>
                    </div>

                    {r.data.country && (
                      <div style={{ textAlign: 'right' }}>
                        <p style={{
                          fontSize: 11,
                          color:    'var(--muted-foreground)',
                          margin:   '0 0 2px',
                        }}>
                          Country
                        </p>
                        <p style={{
                          fontSize:   14,
                          fontWeight: 600,
                          color:      'var(--foreground)',
                          margin:     0,
                        }}>
                          {r.data.country}
                        </p>
                      </div>
                    )}

                    
                      <a href={`/influencer/${r.data.influencerId}`}
                      style={{
                        fontSize:       12,
                        color:          'var(--brand-primary)',
                        textDecoration: 'none',
                        fontWeight:     500,
                        padding:        '4px 10px',
                        border:         '1px solid rgba(94,48,136,0.3)',
                        borderRadius:   6,
                        whiteSpace:     'nowrap',
                      }}
											>
                      View -&gt;
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {results.length === 0 && !isLoading && (
          <div style={{
            textAlign: 'center',
            padding:   '48px 24px',
            color:     'var(--muted-foreground)',
            fontSize:  14,
          }}>
            <div style={{
              width:          48,
              height:         48,
              borderRadius:   '50%',
              background:     'var(--muted)',
              display:        'flex',
              alignItems:     'center',
              justifyContent: 'center',
              margin:         '0 auto 16px',
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            Enter Instagram usernames above to sync creator profiles
          </div>
        )}

      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}