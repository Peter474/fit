import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

interface WorkoutFrequencyChartProps {
  completed: number
  skipped: number
  notLogged: number
}

export function WorkoutFrequencyChart({ completed, skipped, notLogged }: WorkoutFrequencyChartProps) {
  const data = [
    { label: 'Completed', value: completed, color: 'var(--color-success)' },
    { label: 'Skipped', value: skipped, color: 'var(--color-danger)' },
    { label: 'Not logged', value: notLogged, color: 'var(--color-surface-3)' },
  ]

  return (
    <ResponsiveContainer width="100%" height={160}>
      <BarChart data={data} layout="vertical" margin={{ top: 4, right: 16, left: 4, bottom: 0 }}>
        <CartesianGrid stroke="var(--color-border-soft)" horizontal={false} />
        <XAxis type="number" hide allowDecimals={false} />
        <YAxis
          type="category"
          dataKey="label"
          tick={{ fill: 'var(--color-text-secondary)', fontSize: 12 }}
          axisLine={false}
          tickLine={false}
          width={80}
        />
        <Tooltip
          cursor={{ fill: 'var(--color-surface-3)', opacity: 0.4 }}
          contentStyle={{
            background: 'var(--color-surface-2)',
            border: '1px solid var(--color-border-soft)',
            borderRadius: 12,
            fontSize: 12,
            color: 'var(--color-text-primary)',
          }}
          formatter={(value) => [`${value} day${value === 1 ? '' : 's'}`, undefined]}
          labelFormatter={() => ''}
        />
        <Bar dataKey="value" radius={[0, 6, 6, 0]} maxBarSize={22}>
          {data.map((d) => (
            <Cell key={d.label} fill={d.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
