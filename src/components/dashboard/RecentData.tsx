import { format } from 'date-fns';
import { FileSpreadsheet, ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface DataRow {
  id: string;
  company_name: string;
  energy_consumption: number;
  fuel_usage: number;
  predicted_co2: number | null;
  record_date: string;
  data_source: string;
}

interface RecentDataProps {
  data: DataRow[];
  showCompany?: boolean;
}

export function RecentData({ data, showCompany = false }: RecentDataProps) {
  if (data.length === 0) {
    return (
      <div className="dashboard-section">
        <h3 className="text-lg font-semibold text-foreground mb-4">Recent Emissions Data</h3>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
            <FileSpreadsheet className="w-8 h-8 text-muted-foreground" />
          </div>
          <h4 className="font-medium text-foreground mb-2">No data yet</h4>
          <p className="text-sm text-muted-foreground mb-4">
            Start by uploading your emission data or entering it manually
          </p>
          <Button asChild className="btn-eco">
            <Link to="/upload">
              Upload Data
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-section">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground">Recent Emissions Data</h3>
        <Button variant="ghost" size="sm" asChild>
          <Link to="/reports" className="text-primary">
            View All
            <ArrowUpRight className="w-4 h-4 ml-1" />
          </Link>
        </Button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="table-eco">
          <thead>
            <tr>
              <th>Date</th>
              {showCompany && <th>Company</th>}
              <th>Energy (kWh)</th>
              <th>Fuel (L)</th>
              <th>Predicted CO₂ (tons)</th>
              <th>Source</th>
            </tr>
          </thead>
          <tbody>
            {data.slice(0, 5).map((row) => (
              <tr key={row.id}>
                <td className="font-medium">
                  {format(new Date(row.record_date), 'MMM dd, yyyy')}
                </td>
                {showCompany && (
                  <td className="font-medium">{row.company_name}</td>
                )}
                <td>{row.energy_consumption.toLocaleString()}</td>
                <td>{row.fuel_usage.toLocaleString()}</td>
                <td>
                  {row.predicted_co2 !== null ? (
                    <span className="font-medium text-primary">
                      {row.predicted_co2.toLocaleString()}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">Pending</span>
                  )}
                </td>
                <td>
                  <span className={row.data_source === 'csv' ? 'badge-success' : 'badge-warning'}>
                    {row.data_source === 'csv' ? 'CSV Upload' : 'Manual'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
