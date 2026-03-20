'use client';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts';

interface Props {
  data: { date: string; engagementRate: number }[];
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
      <p style={{ color: 'var(--muted-foreground)', margin: '0 0 4px' }}>
        {label}
      </p>
      <p style={{ color: '#EF338D', fontWeight: 600, margin: 0 }}>
        {payload[0].value.toFixed(2)}% engagement
      </p>
    </div>
  );
};

export function EngagementChart({ data }: Props) {
  const avg = data.length
    ? data.reduce((s, d) => s + d.engagementRate, 0) / data.length
    : 0;

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
          tickFormatter={(v) => v.toFixed(1) + '%'}
          width={45}
        />
        <Tooltip content={<CustomTooltip />} />
        {/* Average line */}
        <ReferenceLine
          y={avg}
          stroke="#F1C81D"
          strokeDasharray="4 4"
          strokeWidth={1.5}
          label={{
            value: `Avg ${avg.toFixed(1)}%`,
            fill:  '#E09E2E',
            fontSize: 11,
            position: 'insideTopRight',
          }}
        />
        <Line
          type="monotone"
          dataKey="engagementRate"
          stroke="#EF338D"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, fill: '#EF338D' }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}