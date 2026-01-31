import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from 'recharts';

interface EmissionsChartProps {
  data: Array<{
    name: string;
    predicted: number;
    actual?: number;
  }>;
  type?: 'area' | 'bar';
  title?: string;
}

export function EmissionsChart({ data, type = 'area', title }: EmissionsChartProps) {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium text-foreground mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-muted-foreground capitalize">{entry.dataKey}:</span>
              <span className="font-medium text-foreground">
                {entry.value.toLocaleString()} tons CO₂
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="chart-container">
      {title && (
        <h3 className="text-lg font-semibold text-foreground mb-4">{title}</h3>
      )}
      <ResponsiveContainer width="100%" height={300}>
        {type === 'area' ? (
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="predictedGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(155, 60%, 32%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(155, 60%, 32%)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="actualGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(172, 66%, 50%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(172, 66%, 50%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(150, 20%, 90%)" />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'hsl(150, 10%, 45%)', fontSize: 12 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'hsl(150, 10%, 45%)', fontSize: 12 }}
              tickFormatter={(value) => `${value}t`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Area
              type="monotone"
              dataKey="predicted"
              stroke="hsl(155, 60%, 32%)"
              strokeWidth={2}
              fill="url(#predictedGradient)"
              name="Predicted CO₂"
            />
            {data[0]?.actual !== undefined && (
              <Area
                type="monotone"
                dataKey="actual"
                stroke="hsl(172, 66%, 50%)"
                strokeWidth={2}
                fill="url(#actualGradient)"
                name="Actual CO₂"
              />
            )}
          </AreaChart>
        ) : (
          <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(150, 20%, 90%)" />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'hsl(150, 10%, 45%)', fontSize: 12 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'hsl(150, 10%, 45%)', fontSize: 12 }}
              tickFormatter={(value) => `${value}t`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey="predicted" fill="hsl(155, 60%, 32%)" radius={[4, 4, 0, 0]} name="Predicted CO₂" />
            {data[0]?.actual !== undefined && (
              <Bar dataKey="actual" fill="hsl(172, 66%, 50%)" radius={[4, 4, 0, 0]} name="Actual CO₂" />
            )}
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}
