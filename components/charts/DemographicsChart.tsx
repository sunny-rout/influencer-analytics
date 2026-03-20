'use client';
import {
  PieChart, Pie, Cell, Tooltip,
  BarChart, Bar, XAxis, YAxis,
  CartesianGrid, ResponsiveContainer,
} from 'recharts';

interface Props {
  genderMale:   number;
  genderFemale: number;
  age1317:      number;
  age1824:      number;
  age2534:      number;
  age3544:      number;
  age45Plus:    number;
}

const GENDER_COLORS = ['#5E3088', '#EF338D'];

const AGE_DATA_KEYS = [
  { key: 'age1317', label: '13–17' },
  { key: 'age1824', label: '18–24' },
  { key: 'age2534', label: '25–34' },
  { key: 'age3544', label: '35–44' },
  { key: 'age45Plus', label: '45+' },
];

export function DemographicsChart({
  genderMale,
  genderFemale,
  age1317,
  age1824,
  age2534,
  age3544,
  age45Plus,
}: Props) {
  const genderData = [
    { name: 'Male',   value: genderMale   || 45 },
    { name: 'Female', value: genderFemale || 55 },
  ];

  const ageData = [
    { label: '13–17', value: age1317   || 8  },
    { label: '18–24', value: age1824   || 32 },
    { label: '25–34', value: age2534   || 35 },
    { label: '35–44', value: age3544   || 15 },
    { label: '45+',   value: age45Plus || 10 },
  ];

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: 24,
    }}>

      {/* Gender donut */}
      <div>
        <p style={{
          fontSize: 12,
          fontWeight: 500,
          color: 'var(--muted-foreground)',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          margin: '0 0 12px',
        }}>
          Gender split
        </p>
        <div style={{ position: 'relative' }}>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie
                data={genderData}
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={70}
                paddingAngle={3}
                dataKey="value"
              >
                {genderData.map((_, i) => (
                  <Cell
                    key={i}
                    fill={GENDER_COLORS[i]}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(v: any) => v.toFixed(1) + '%'}
                contentStyle={{
                  background:   'var(--card)',
                  border:       '1px solid var(--border)',
                  borderRadius: 8,
                  fontSize:     13,
                }}
              />
            </PieChart>
          </ResponsiveContainer>

          {/* Legend */}
          <div style={{
            display:        'flex',
            justifyContent: 'center',
            gap:            16,
            marginTop:      8,
          }}>
            {genderData.map((item, i) => (
              <div key={item.name} style={{
                display:    'flex',
                alignItems: 'center',
                gap:        6,
                fontSize:   12,
                color:      'var(--foreground)',
              }}>
                <div style={{
                  width:        10,
                  height:       10,
                  borderRadius: '50%',
                  background:   GENDER_COLORS[i],
                }} />
                {item.name} {item.value.toFixed(0)}%
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Age bar chart */}
      <div>
        <p style={{
          fontSize:      12,
          fontWeight:    500,
          color:         'var(--muted-foreground)',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          margin:        '0 0 12px',
        }}>
          Age groups
        </p>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart
            data={ageData}
            layout="vertical"
            margin={{ top: 0, right: 10, left: 0, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--border)"
              horizontal={false}
            />
            <XAxis
              type="number"
              tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => v + '%'}
            />
            <YAxis
              type="category"
              dataKey="label"
              tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
              tickLine={false}
              axisLine={false}
              width={36}
            />
            <Tooltip
              formatter={(v: any) => v.toFixed(1) + '%'}
              contentStyle={{
                background:   'var(--card)',
                border:       '1px solid var(--border)',
                borderRadius: 8,
                fontSize:     13,
              }}
            />
            <Bar
              dataKey="value"
              fill="#33B0D4"
              radius={[0, 4, 4, 0]}
              maxBarSize={14}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}