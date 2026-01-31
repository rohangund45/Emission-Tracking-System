import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { format } from 'date-fns';
import { toast } from 'sonner';
import {
  FileText,
  Download,
  Search,
  Calendar,
  Filter,
  Loader2,
  FileDown,
  Building2,
} from 'lucide-react';

interface EmissionRecord {
  id: string;
  company_name: string;
  industry_type: string | null;
  energy_consumption: number;
  fuel_usage: number;
  predicted_co2: number | null;
  actual_co2: number | null;
  record_date: string;
  data_source: string;
  created_at: string;
}

export default function Reports() {
  const { user, role } = useAuth();
  const [emissions, setEmissions] = useState<EmissionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from('emissions_data')
        .select('*')
        .order('record_date', { ascending: false });

      if (!error && data) {
        setEmissions(data as EmissionRecord[]);
      }
      setLoading(false);
    };

    fetchData();
  }, [user]);

  const filteredEmissions = emissions.filter((e) => {
    const matchesSearch =
      e.company_name.toLowerCase().includes(search.toLowerCase()) ||
      e.industry_type?.toLowerCase().includes(search.toLowerCase());
    const matchesDate = !dateFilter || e.record_date.startsWith(dateFilter);
    return matchesSearch && matchesDate;
  });

  const generateCSV = () => {
    const headers = [
      'Date',
      'Company',
      'Industry',
      'Energy (kWh)',
      'Fuel (L)',
      'Predicted CO2 (tons)',
      'Source',
    ];

    const rows = filteredEmissions.map((e) => [
      e.record_date,
      e.company_name,
      e.industry_type || '',
      e.energy_consumption,
      e.fuel_usage,
      e.predicted_co2 || '',
      e.data_source,
    ]);

    const csvContent = [headers, ...rows].map((row) => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `emissions-report-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();

    toast.success('Report downloaded successfully!');
  };

  const generatePDFReport = async () => {
    setGenerating(true);
    try {
      // Create a printable report
      const totalEmissions = filteredEmissions.reduce(
        (sum, e) => sum + (e.predicted_co2 || 0),
        0
      );
      const totalEnergy = filteredEmissions.reduce(
        (sum, e) => sum + e.energy_consumption,
        0
      );
      const totalFuel = filteredEmissions.reduce((sum, e) => sum + e.fuel_usage, 0);

      const reportHTML = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Emissions Report - ${format(new Date(), 'MMMM yyyy')}</title>
          <style>
            body { font-family: 'Segoe UI', Tahoma, sans-serif; padding: 40px; color: #1a1a1a; }
            h1 { color: #166534; margin-bottom: 8px; }
            .subtitle { color: #666; margin-bottom: 32px; }
            .summary { display: flex; gap: 24px; margin-bottom: 32px; }
            .stat { background: #f0fdf4; padding: 16px 24px; border-radius: 8px; }
            .stat-label { font-size: 12px; color: #666; }
            .stat-value { font-size: 24px; font-weight: bold; color: #166534; }
            table { width: 100%; border-collapse: collapse; margin-top: 24px; }
            th { background: #f0fdf4; padding: 12px; text-align: left; font-weight: 600; }
            td { padding: 12px; border-bottom: 1px solid #e5e7eb; }
            .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #e5e7eb; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <h1>🌿 Next Gen Emission Control System</h1>
          <p class="subtitle">Emissions Report - Generated ${format(new Date(), 'MMMM dd, yyyy')}</p>
          
          <div class="summary">
            <div class="stat">
              <div class="stat-label">Total CO₂ Emissions</div>
              <div class="stat-value">${totalEmissions.toLocaleString()} tons</div>
            </div>
            <div class="stat">
              <div class="stat-label">Energy Consumed</div>
              <div class="stat-value">${totalEnergy.toLocaleString()} kWh</div>
            </div>
            <div class="stat">
              <div class="stat-label">Fuel Used</div>
              <div class="stat-value">${totalFuel.toLocaleString()} L</div>
            </div>
            <div class="stat">
              <div class="stat-label">Records</div>
              <div class="stat-value">${filteredEmissions.length}</div>
            </div>
          </div>

          <h2>Emission Records</h2>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Company</th>
                <th>Energy (kWh)</th>
                <th>Fuel (L)</th>
                <th>Predicted CO₂ (tons)</th>
              </tr>
            </thead>
            <tbody>
              ${filteredEmissions
                .slice(0, 50)
                .map(
                  (e) => `
                <tr>
                  <td>${format(new Date(e.record_date), 'MMM dd, yyyy')}</td>
                  <td>${e.company_name}</td>
                  <td>${e.energy_consumption.toLocaleString()}</td>
                  <td>${e.fuel_usage.toLocaleString()}</td>
                  <td>${e.predicted_co2?.toLocaleString() || 'N/A'}</td>
                </tr>
              `
                )
                .join('')}
            </tbody>
          </table>

          <div class="footer">
            <p>This report was generated by Next Gen Emission Control System using AI-powered predictions.</p>
            <p>For questions or support, contact your system administrator.</p>
          </div>
        </body>
        </html>
      `;

      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(reportHTML);
        printWindow.document.close();
        printWindow.print();
      }

      toast.success('Report generated! Use your browser to save as PDF.');
    } catch (error) {
      console.error('Report generation error:', error);
      toast.error('Failed to generate report');
    } finally {
      setGenerating(false);
    }
  };

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
      <div className="p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in">
          <div>
            <h1 className="text-2xl lg:text-3xl font-display font-bold text-foreground mb-2">
              Reports
            </h1>
            <p className="text-muted-foreground">
              View and export your emission records and analysis
            </p>
          </div>

          <div className="flex gap-3">
            <Button onClick={generateCSV} className="btn-eco-outline">
              <Download className="w-4 h-4" />
              Export CSV
            </Button>
            <Button onClick={generatePDFReport} disabled={generating} className="btn-eco">
              {generating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <FileDown className="w-4 h-4" />
              )}
              Generate PDF
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 animate-slide-up">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by company or industry..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 input-eco"
            />
          </div>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="month"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="pl-10 input-eco w-full sm:w-48"
            />
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="stat-card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Records</p>
                <p className="text-2xl font-bold text-foreground">
                  {filteredEmissions.length}
                </p>
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-eco-leaf/10 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-eco-leaf" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Companies</p>
                <p className="text-2xl font-bold text-foreground">
                  {new Set(filteredEmissions.map((e) => e.company_name)).size}
                </p>
              </div>
            </div>
          </div>

          <div className="stat-card">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                <Filter className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total CO₂</p>
                <p className="text-2xl font-bold text-foreground">
                  {filteredEmissions
                    .reduce((sum, e) => sum + (e.predicted_co2 || 0), 0)
                    .toLocaleString()}t
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <div className="dashboard-section overflow-hidden animate-slide-up" style={{ animationDelay: '0.2s' }}>
          <div className="overflow-x-auto">
            <table className="table-eco">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Company</th>
                  <th>Industry</th>
                  <th>Energy (kWh)</th>
                  <th>Fuel (L)</th>
                  <th>Predicted CO₂</th>
                  <th>Source</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmissions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12">
                      <div className="flex flex-col items-center">
                        <FileText className="w-12 h-12 text-muted-foreground mb-4" />
                        <p className="font-medium text-foreground mb-1">No records found</p>
                        <p className="text-sm text-muted-foreground">
                          {search || dateFilter
                            ? 'Try adjusting your filters'
                            : 'Start by uploading emission data'}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredEmissions.map((record) => (
                    <tr key={record.id}>
                      <td className="font-medium">
                        {format(new Date(record.record_date), 'MMM dd, yyyy')}
                      </td>
                      <td className="font-medium">{record.company_name}</td>
                      <td className="text-muted-foreground">
                        {record.industry_type || '—'}
                      </td>
                      <td>{record.energy_consumption.toLocaleString()}</td>
                      <td>{record.fuel_usage.toLocaleString()}</td>
                      <td>
                        {record.predicted_co2 !== null ? (
                          <span className="font-medium text-primary">
                            {record.predicted_co2.toLocaleString()} tons
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td>
                        <span
                          className={
                            record.data_source === 'csv'
                              ? 'badge-success'
                              : 'badge-warning'
                          }
                        >
                          {record.data_source === 'csv' ? 'CSV' : 'Manual'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
