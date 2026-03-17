import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-[calc(100vh-56px)] flex flex-col items-center justify-center px-6 text-center">

      {/* Badge */}
      <div style={{
        background: 'rgba(94,48,136,0.08)',
        border: '1px solid rgba(94,48,136,0.2)',
        borderRadius: 20,
        padding: '4px 14px',
        fontSize: 12,
        fontWeight: 500,
        color: 'var(--brand-primary)',
        marginBottom: 24,
        display: 'inline-block',
      }}>
        Influencer Discovery Platform
      </div>

      {/* Headline */}
      <h1 style={{
        fontSize: 'clamp(32px, 5vw, 52px)',
        fontWeight: 700,
        lineHeight: 1.15,
        letterSpacing: '-0.02em',
        color: 'var(--foreground)',
        maxWidth: 700,
        marginBottom: 20,
      }}>
        Find the right influencers{' '}
        <span style={{ color: 'var(--brand-primary)' }}>
          for your brand
        </span>
      </h1>

      {/* Subheadline */}
      <p style={{
        fontSize: 17,
        color: 'var(--muted-foreground)',
        maxWidth: 500,
        lineHeight: 1.7,
        marginBottom: 36,
      }}>
        Search, filter and analyse influencers across Instagram,
        YouTube and TikTok — all in one place.
      </p>

      {/* CTAs */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
        <Link href="/search" style={{
          background: 'var(--brand-primary)',
          color: '#fff',
          padding: '11px 28px',
          borderRadius: 10,
          fontSize: 14,
          fontWeight: 600,
          textDecoration: 'none',
          display: 'inline-block',
        }}>
          Start discovering
        </Link>
        <Link href="/test-sync" style={{
          background: 'transparent',
          color: 'var(--brand-primary)',
          padding: '11px 28px',
          borderRadius: 10,
          fontSize: 14,
          fontWeight: 600,
          textDecoration: 'none',
          border: '1px solid var(--brand-primary)',
          display: 'inline-block',
        }}>
          Sync an account
        </Link>
      </div>

      {/* Stats row */}
      <div style={{
        display: 'flex',
        gap: 48,
        marginTop: 64,
        flexWrap: 'wrap',
        justifyContent: 'center',
      }}>
        {[
          { value: '12+',   label: 'Influencers indexed' },
          { value: '3',     label: 'Platforms supported' },
          { value: '100%',  label: 'Real engagement data' },
        ].map((stat) => (
          <div key={stat.label} style={{ textAlign: 'center' }}>
            <div style={{
              fontSize: 28,
              fontWeight: 700,
              color: 'var(--brand-primary)',
              letterSpacing: '-0.02em',
            }}>
              {stat.value}
            </div>
            <div style={{
              fontSize: 13,
              color: 'var(--muted-foreground)',
              marginTop: 4,
            }}>
              {stat.label}
            </div>
          </div>
        ))}
      </div>

    </main>
  );
}
