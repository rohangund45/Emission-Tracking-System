import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Upload, FileSpreadsheet, CheckCircle2, AlertCircle, Loader2, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CSVUploadProps {
  onSuccess?: () => void;
}

interface ParsedRow {
  company_name: string;
  industry_type?: string;
  energy_consumption: number;
  fuel_usage: number;
  production_volume?: number;
  waste_generated?: number;
  water_usage?: number;
  record_date?: string;
}

export function CSVUpload({ onSuccess }: CSVUploadProps) {
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedRow[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const parseCSV = (content: string): { data: ParsedRow[]; errors: string[] } => {
    const lines = content.trim().split('\n');
    const headers = lines[0].toLowerCase().split(',').map((h) => h.trim().replace(/['"]/g, ''));
    
    const data: ParsedRow[] = [];
    const errors: string[] = [];

    // Required columns
    const requiredCols = ['company_name', 'energy_consumption', 'fuel_usage'];
    const missingCols = requiredCols.filter((col) => !headers.includes(col));
    
    if (missingCols.length > 0) {
      return { data: [], errors: [`Missing required columns: ${missingCols.join(', ')}`] };
    }

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map((v) => v.trim().replace(/['"]/g, ''));
      
      if (values.length < headers.length) {
        errors.push(`Row ${i + 1}: Incomplete data`);
        continue;
      }

      const row: Record<string, any> = {};
      headers.forEach((header, index) => {
        row[header] = values[index];
      });

      // Validate required fields
      if (!row.company_name || !row.energy_consumption || !row.fuel_usage) {
        errors.push(`Row ${i + 1}: Missing required values`);
        continue;
      }

      const energyConsumption = parseFloat(row.energy_consumption);
      const fuelUsage = parseFloat(row.fuel_usage);

      if (isNaN(energyConsumption) || isNaN(fuelUsage)) {
        errors.push(`Row ${i + 1}: Invalid numeric values`);
        continue;
      }

      data.push({
        company_name: row.company_name,
        industry_type: row.industry_type || undefined,
        energy_consumption: energyConsumption,
        fuel_usage: fuelUsage,
        production_volume: row.production_volume ? parseFloat(row.production_volume) : undefined,
        waste_generated: row.waste_generated ? parseFloat(row.waste_generated) : undefined,
        water_usage: row.water_usage ? parseFloat(row.water_usage) : undefined,
        record_date: row.record_date || new Date().toISOString().split('T')[0],
      });
    }

    return { data, errors };
  };

  const handleFileSelect = useCallback((selectedFile: File) => {
    if (!selectedFile.name.endsWith('.csv')) {
      toast.error('Please upload a CSV file');
      return;
    }

    setFile(selectedFile);
    setErrors([]);

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const { data, errors } = parseCSV(content);
      setParsedData(data);
      setErrors(errors);

      if (data.length > 0) {
        toast.success(`Parsed ${data.length} valid records`);
      }
      if (errors.length > 0) {
        toast.warning(`${errors.length} rows had issues`);
      }
    };
    reader.readAsText(selectedFile);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    if (e.dataTransfer.files?.[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  }, [handleFileSelect]);

  const handleUpload = async () => {
    if (!user || parsedData.length === 0) return;

    setUploading(true);
    try {
      // Create batch upload record
      const { data: batch, error: batchError } = await supabase
        .from('batch_uploads')
        .insert({
          user_id: user.id,
          filename: file?.name || 'upload.csv',
          records_count: parsedData.length,
          status: 'processing',
        })
        .select()
        .single();

      if (batchError) throw batchError;

      // Get predictions and insert data
      let successCount = 0;
      for (const row of parsedData) {
        try {
          // Get AI prediction
          const { data: predData } = await supabase.functions.invoke('predict-emissions', {
            body: {
              energy_consumption: row.energy_consumption,
              fuel_usage: row.fuel_usage,
              production_volume: row.production_volume,
              waste_generated: row.waste_generated,
              water_usage: row.water_usage,
              industry_type: row.industry_type,
            },
          });

          // Insert emission record
          const { error: insertError } = await supabase.from('emissions_data').insert({
            user_id: user.id,
            company_name: row.company_name,
            industry_type: row.industry_type,
            energy_consumption: row.energy_consumption,
            fuel_usage: row.fuel_usage,
            production_volume: row.production_volume,
            waste_generated: row.waste_generated,
            water_usage: row.water_usage,
            predicted_co2: predData?.predicted_co2 || null,
            record_date: row.record_date,
            data_source: 'csv',
          });

          if (!insertError) successCount++;
        } catch (err) {
          console.error('Row insert error:', err);
        }
      }

      // Update batch status
      await supabase
        .from('batch_uploads')
        .update({
          status: 'completed',
          records_count: successCount,
        })
        .eq('id', batch.id);

      toast.success(`Successfully uploaded ${successCount} records with AI predictions!`);
      setFile(null);
      setParsedData([]);
      setErrors([]);
      onSuccess?.();
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to upload data');
    } finally {
      setUploading(false);
    }
  };

  const clearFile = () => {
    setFile(null);
    setParsedData([]);
    setErrors([]);
  };

  return (
    <div className="space-y-6">
      {/* Drop Zone */}
      <div
        className={cn(
          'relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200',
          dragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50',
          file && 'border-primary bg-primary/5'
        )}
        onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
      >
        {!file ? (
          <>
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
              <Upload className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-medium text-foreground mb-2">
              Drop your CSV file here
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              or click to browse
            </p>
            <input
              type="file"
              accept=".csv"
              onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <Button variant="outline" className="pointer-events-none">
              Select CSV File
            </Button>
          </>
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <FileSpreadsheet className="w-6 h-6 text-primary" />
              </div>
              <div className="text-left">
                <p className="font-medium text-foreground">{file.name}</p>
                <p className="text-sm text-muted-foreground">
                  {parsedData.length} valid records • {(file.size / 1024).toFixed(1)} KB
                </p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={clearFile}>
              <X className="w-5 h-5" />
            </Button>
          </div>
        )}
      </div>

      {/* Validation Results */}
      {parsedData.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle2 className="w-4 h-4 text-eco-leaf" />
            <span className="text-foreground">
              {parsedData.length} records ready for upload with AI predictions
            </span>
          </div>

          {/* Preview Table */}
          <div className="border rounded-lg overflow-hidden">
            <div className="max-h-48 overflow-y-auto">
              <table className="table-eco text-xs">
                <thead>
                  <tr>
                    <th>Company</th>
                    <th>Energy (kWh)</th>
                    <th>Fuel (L)</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {parsedData.slice(0, 5).map((row, i) => (
                    <tr key={i}>
                      <td>{row.company_name}</td>
                      <td>{row.energy_consumption.toLocaleString()}</td>
                      <td>{row.fuel_usage.toLocaleString()}</td>
                      <td>{row.record_date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {parsedData.length > 5 && (
              <div className="p-2 text-center text-xs text-muted-foreground bg-muted/50">
                +{parsedData.length - 5} more records
              </div>
            )}
          </div>
        </div>
      )}

      {/* Errors */}
      {errors.length > 0 && (
        <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
          <div className="flex items-center gap-2 text-sm font-medium text-destructive mb-2">
            <AlertCircle className="w-4 h-4" />
            {errors.length} validation issues
          </div>
          <ul className="text-sm text-destructive/80 space-y-1">
            {errors.slice(0, 3).map((error, i) => (
              <li key={i}>{error}</li>
            ))}
            {errors.length > 3 && (
              <li>+{errors.length - 3} more...</li>
            )}
          </ul>
        </div>
      )}

      {/* Expected Format */}
      <div className="p-4 rounded-lg bg-muted/50 border border-border">
        <h4 className="text-sm font-medium text-foreground mb-2">Expected CSV Format:</h4>
        <code className="text-xs text-muted-foreground block overflow-x-auto">
          company_name,energy_consumption,fuel_usage,industry_type,production_volume,waste_generated,water_usage,record_date
        </code>
      </div>

      {/* Upload Button */}
      {parsedData.length > 0 && (
        <Button
          onClick={handleUpload}
          disabled={uploading}
          className="w-full btn-eco h-12"
        >
          {uploading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Uploading & Processing...
            </>
          ) : (
            <>
              <Upload className="w-5 h-5" />
              Upload {parsedData.length} Records
            </>
          )}
        </Button>
      )}
    </div>
  );
}
