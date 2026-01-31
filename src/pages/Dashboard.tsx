import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { EmissionsChart } from '@/components/dashboard/EmissionsChart';
import { RecentData } from '@/components/dashboard/RecentData';
import { Activity, Zap, Fuel, CloudSun, TrendingDown, Building2 } from 'lucide-react';

interface EmissionRecord {
  id: string;
  company_name: string;
  energy_consumption: number;
  fuel_usage: number;
  predicted_co2: number | null;
  actual_co2: number | null;
  record_date: string;
  data_source: string;
}

export default function Dashboard() {
  const { user, role } = useAuth();
  const [emissions, setEmissions] = useState<EmissionRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from('emissions_data')
        .select('*')
        .order('record_date', { ascending: false })
        .limit(50);

      if (!error && data) {
        setEmissions(data as EmissionRecord[]);
      }
      setLoading(false);
    };

    fetchData();
  }, [user]);

  // Calculate stats
  const totalEmissions = emissions.reduce((sum, e) => sum + (e.predicted_co2 || 0), 0);
  const totalEnergy = emissions.reduce((sum, e) => sum + e.energy_consumption, 0);
  const totalFuel = emissions.reduce((sum, e) => sum + e.fuel_usage, 0);
  const avgEmission = emissions.length > 0 ? totalEmissions / emissions.length : 0;
  const uniqueCompanies = new Set(emissions.map((e) => e.company_name)).size;

  // Chart data - group by month
  const chartData = emissions
    .slice(0, 12)
    .reverse()
    .map((e) => ({
      name: new Date(e.record_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      predicted: e.predicted_co2 || 0,
      actual: e.actual_co2 || undefined,
    }));

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8 space-y-8">
        {/* Header */}
        <div className="animate-fade-in">
          <h1 className="text-2xl lg:text-3xl font-display font-bold text-foreground mb-2">
            {role === 'admin' ? 'Admin Overview' : 'Emissions Dashboard'}
          </h1>
          <p className="text-muted-foreground">
            {role === 'admin'
              ? 'Monitor emissions across all registered industries'
              : 'Track and manage your carbon emissions data'}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <StatCard
            title="Total CO₂ Predicted"
            value={`${totalEmissions.toLocaleString()}t`}
            subtitle="Across all records"
            icon={<CloudSun className="w-6 h-6" />}
            variant="default"
            trend={{ value: -12, label: 'vs last month' }}
          />
          <StatCard
            title="Energy Consumed"
            value={`${(totalEnergy / 1000).toFixed(1)}k kWh`}
            subtitle="Total consumption"
            icon={<Zap className="w-6 h-6" />}
            variant="warning"
          />
          <StatCard
            title="Fuel Usage"
            value={`${(totalFuel / 1000).toFixed(1)}k L`}
            subtitle="Total usage"
            icon={<Fuel className="w-6 h-6" />}
            variant="danger"
          />
          {role === 'admin' ? (
            <StatCard
              title="Industries"
              value={uniqueCompanies}
              subtitle="Reporting companies"
              icon={<Building2 className="w-6 h-6" />}
              variant="success"
            />
          ) : (
            <StatCard
              title="Avg Emission"
              value={`${avgEmission.toFixed(1)}t`}
              subtitle="Per record"
              icon={<Activity className="w-6 h-6" />}
              variant="success"
            />
          )}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <EmissionsChart
            data={chartData}
            type="area"
            title="Emission Trends"
          />
          <EmissionsChart
            data={chartData.slice(-6)}
            type="bar"
            title="Recent Predictions"
          />
        </div>

        {/* Recent Data Table */}
        <div className="animate-slide-up" style={{ animationDelay: '0.3s' }}>
          <RecentData
            data={emissions.slice(0, 10)}
            showCompany={role === 'admin'}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
