import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { formatShortDate } from '@/lib/date'

interface WeightPoint {
  date: string
  weightKg: number
}

export function WeightLineChart({ data, unit }: { data: WeightPoint[]; unit: string }) {
  const chartData = data.map((d) => ({ ...d, label: formatShortDate(d.date) }))
  const values = data.map((d) => d.weightKg)
  const min = Math.floor(Math.min(...values) - 1)
  const max = Math.ceil(Math.max(...values) + 1)

  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={chartData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
        <CartesianGrid stroke="var(--color-border-soft)" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fill: 'var(--color-text-tertiary)', fontSize: 11 }}
          axisLine={{ stroke: 'var(--color-border-soft)' }}
          tickLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          domain={[min, max]}
          tick={{ fill: 'var(--color-text-tertiary)', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          width={36}
        />
        <Tooltip
          contentStyle={{
            background: 'var(--color-surface-2)',
            border: '1px solid var(--color-border-soft)',
            borderRadius: 12,
            fontSize: 12,
            color: 'var(--color-text-primary)',
          }}
          formatter={(value) => [`${value} ${unit}`, undefined]}
          labelFormatter={() => ''}
        />
        <Line
          type="monotone"
          dataKey="weightKg"
          stroke="var(--color-protein)"
          strokeWidth={2.5}
          dot={{ r: 3, fill: 'var(--color-protein)', strokeWidth: 0 }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
