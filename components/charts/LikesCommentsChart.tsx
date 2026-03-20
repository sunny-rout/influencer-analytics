'use client';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

interface Props {
  data: { date: string; avgLikes: number; avgComments: number }[];
}

function formatNumber(n: number): string {
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return n.toString();
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background:   'var(--card)',
      border:       '1px solid var(--border)',
      borderRadius: 8,
      padding:      '10px 14px',
      fontSize:     13,
    }}>
      <p style={{ color: 'var(--muted-foreground)', margin: '0 0 6px' }}>
        {label}
      </p>
      {payload.map((p: any) => (
        <p key={p.name} style={{
          color:      p.fill,
          fontWeight: 600,
          margin:     '2px 0',
        }}>
          {formatNumber(p.value)} {p.name}
        </p>
      ))}
    </div>
  );
};

export function LikesCommentsChart({ data }: Props) {
  // Show last 14 data points to avoid overcrowding
  const sliced = data.slice(-14);

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={sliced}
        margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
        barGap={2}>
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
        <Legend
          wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
          formatter={(value) =>
            value.charAt(0).toUpperCase() + value.slice(1)
          }
        />
        <Bar
          dataKey="avgLikes"
          name="likes"
          fill="#5E3088"
          radius={[4, 4, 0, 0]}
          maxBarSize={24}
        />
        <Bar
          dataKey="avgComments"
          name="comments"
          fill="#33B0D4"
          radius={[4, 4, 0, 0]}
          maxBarSize={24}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}