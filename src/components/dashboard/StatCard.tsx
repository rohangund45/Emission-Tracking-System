import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  trend?: {
    value: number;
    label: string;
  };
  variant?: 'default' | 'success' | 'warning' | 'danger';
}

export function StatCard({ title, value, subtitle, icon, trend, variant = 'default' }: StatCardProps) {
  const variantStyles = {
    default: 'from-primary/5 to-transparent',
    success: 'from-eco-leaf/10 to-transparent',
    warning: 'from-amber-500/10 to-transparent',
    danger: 'from-destructive/10 to-transparent',
  };

  const iconStyles = {
    default: 'bg-primary/10 text-primary',
    success: 'bg-eco-leaf/10 text-eco-leaf',
    warning: 'bg-amber-500/10 text-amber-600',
    danger: 'bg-destructive/10 text-destructive',
  };

  const getTrendIcon = () => {
    if (!trend) return null;
    if (trend.value > 0) return <TrendingUp className="w-4 h-4" />;
    if (trend.value < 0) return <TrendingDown className="w-4 h-4" />;
    return <Minus className="w-4 h-4" />;
  };

  const getTrendColor = () => {
    if (!trend) return '';
    // For emissions, down is good (green), up is bad (red)
    if (trend.value < 0) return 'text-eco-leaf';
    if (trend.value > 0) return 'text-destructive';
    return 'text-muted-foreground';
  };

  return (
    <div className="stat-card group">
      <div className={cn('absolute inset-0 bg-gradient-to-br opacity-50', variantStyles[variant])} />
      
      <div className="relative">
        <div className="flex items-start justify-between mb-4">
          <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', iconStyles[variant])}>
            {icon}
          </div>
          {trend && (
            <div className={cn('flex items-center gap-1 text-sm font-medium', getTrendColor())}>
              {getTrendIcon()}
              <span>{Math.abs(trend.value)}%</span>
            </div>
          )}
        </div>
        
        <p className="text-sm font-medium text-muted-foreground mb-1">{title}</p>
        <p className="text-3xl font-display font-bold text-foreground mb-1">{value}</p>
        
        {(subtitle || trend?.label) && (
          <p className="text-sm text-muted-foreground">
            {subtitle || trend?.label}
          </p>
        )}
      </div>
    </div>
  );
}
