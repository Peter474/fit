import { Bar, BarChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { formatShortDate } from '@/lib/date'

interface TrendPoint {
  date: string
  value: number
}

interface TrendBarChartProps {
  data: TrendPoint[]
  color: string
  unit: string
  goal?: number
}

export function TrendBarChart({ data, color, unit, goal }: TrendBarChartProps) {
  const chartData = data.map((d) => ({ ...d, label: formatShortDate(d.date) }))

  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
        <CartesianGrid stroke="var(--color-border-soft)" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fill: 'var(--color-text-tertiary)', fontSize: 11 }}
          axisLine={{ stroke: 'var(--color-border-soft)' }}
          tickLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          tick={{ fill: 'var(--color-text-tertiary)', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          width={36}
        />
        <Tooltip
          cursor={{ fill: 'var(--color-surface-3)', opacity: 0.5 }}
          contentStyle={{
            background: 'var(--color-surface-2)',
            border: '1px solid var(--color-border-soft)',
            borderRadius: 12,
            fontSize: 12,
            color: 'var(--color-text-primary)',
          }}
          formatter={(value) => [`${Number(value).toLocaleString()} ${unit}`, undefined]}
          labelFormatter={() => ''}
        />
        {goal != null && (
          <ReferenceLine y={goal} stroke="var(--color-text-tertiary)" strokeDasharray="4 4" strokeWidth={1.5} />
        )}
        <Bar dataKey="value" fill={color} radius={[4, 4, 0, 0]} maxBarSize={28} />
      </BarChart>
    </ResponsiveContainer>
  )
}
