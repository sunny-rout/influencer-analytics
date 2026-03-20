interface Props {
  title:    string;
  subtitle?: string;
  children: React.ReactNode;
  period?:  string;
  onPeriodChange?: (p: string) => void;
}

export function ChartCard({
  title,
  subtitle,
  children,
  period,
  onPeriodChange,
}: Props) {
  const periods = ['7d', '30d', '90d'];

  return (
    <div style={{
      background:   'var(--card)',
      border:       '1px solid var(--border)',
      borderRadius: 16,
      padding:      24,
    }}>
      <div style={{
        display:        'flex',
        justifyContent: 'space-between',
        alignItems:     'flex-start',
        marginBottom:   20,
      }}>
        <div>
          <h3 style={{
            fontSize:   14,
            fontWeight: 600,
            color:      'var(--foreground)',
            margin:     '0 0 2px',
          }}>
            {title}
          </h3>
          {subtitle && (
            <p style={{
              fontSize: 12,
              color:    'var(--muted-foreground)',
              margin:   0,
            }}>
              {subtitle}
            </p>
          )}
        </div>

        {/* Period selector */}
        {period && onPeriodChange && (
          <div style={{
            display:      'flex',
            gap:          4,
            background:   'var(--muted)',
            borderRadius: 8,
            padding:      3,
          }}>
            {periods.map((p) => (
              <button
                key={p}
                onClick={() => onPeriodChange(p)}
                style={{
                  fontSize:     11,
                  fontWeight:   500,
                  padding:      '3px 10px',
                  borderRadius: 6,
                  border:       'none',
                  cursor:       'pointer',
                  background:   period === p
                    ? 'var(--card)'
                    : 'transparent',
                  color: period === p
                    ? 'var(--brand-primary)'
                    : 'var(--muted-foreground)',
                  boxShadow: period === p
                    ? '0 1px 3px rgba(0,0,0,0.1)'
                    : 'none',
                }}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </div>

      {children}
    </div>
  );
}