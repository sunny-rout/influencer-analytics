'use client';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';

interface Props {
  data: { date: string; followers: number }[];
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000)     return (n / 1_000).toFixed(0)     + 'K';
  return n.toString();
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'var(--card)',
      border:     '1px solid var(--border)',
      borderRadius: 8,
      padding:    '10px 14px',
      fontSize:   13,
    }}>
      <p style={{ color: 'var(--muted-foreground)', margin: '0 0 4px' }}>
        {label}
      </p>
      <p style={{ color: 'var(--brand-primary)', fontWeight: 600, margin: 0 }}>
        {formatNumber(payload[0].value)} followers
      </p>
    </div>
  );
};

export function FollowersChart({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data}
        margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="var(--border)"
          vertical={false}
        />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
          tickLine={false}
          axisLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
          tickLine={false}
          axisLine={false}
          tickFormatter={formatNumber}
          width={45}
        />
        <Tooltip content={<CustomTooltip />} />
        <Line
          type="monotone"
          dataKey="followers"
          stroke="#5E3088"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, fill: '#5E3088' }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}