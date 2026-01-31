import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Loader2, Send, Sparkles } from 'lucide-react';

interface EmissionFormProps {
  onSuccess?: () => void;
}

const industryTypes = [
  'Manufacturing',
  'Energy & Utilities',
  'Transportation',
  'Construction',
  'Agriculture',
  'Mining',
  'Chemical Processing',
  'Food & Beverage',
  'Textile',
  'Other',
];

export function EmissionForm({ onSuccess }: EmissionFormProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [predicting, setPredicting] = useState(false);
  const [formData, setFormData] = useState({
    company_name: '',
    industry_type: '',
    energy_consumption: '',
    fuel_usage: '',
    production_volume: '',
    waste_generated: '',
    water_usage: '',
    record_date: new Date().toISOString().split('T')[0],
  });
  const [prediction, setPrediction] = useState<number | null>(null);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setPrediction(null);
  };

  const getPrediction = async () => {
    if (!formData.energy_consumption || !formData.fuel_usage) {
      toast.error('Please enter energy consumption and fuel usage first');
      return;
    }

    setPredicting(true);
    try {
      const { data, error } = await supabase.functions.invoke('predict-emissions', {
        body: {
          energy_consumption: parseFloat(formData.energy_consumption),
          fuel_usage: parseFloat(formData.fuel_usage),
          production_volume: formData.production_volume ? parseFloat(formData.production_volume) : null,
          waste_generated: formData.waste_generated ? parseFloat(formData.waste_generated) : null,
          water_usage: formData.water_usage ? parseFloat(formData.water_usage) : null,
          industry_type: formData.industry_type,
        },
      });

      if (error) throw error;
      
      setPrediction(data.predicted_co2);
      toast.success('Prediction generated successfully!');
    } catch (error) {
      console.error('Prediction error:', error);
      toast.error('Failed to generate prediction');
    } finally {
      setPredicting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('You must be logged in');
      return;
    }

    setLoading(true);
    try {
      // Get prediction if not already done
      let finalPrediction = prediction;
      if (!finalPrediction) {
        const { data, error } = await supabase.functions.invoke('predict-emissions', {
          body: {
            energy_consumption: parseFloat(formData.energy_consumption),
            fuel_usage: parseFloat(formData.fuel_usage),
            production_volume: formData.production_volume ? parseFloat(formData.production_volume) : null,
            waste_generated: formData.waste_generated ? parseFloat(formData.waste_generated) : null,
            water_usage: formData.water_usage ? parseFloat(formData.water_usage) : null,
            industry_type: formData.industry_type,
          },
        });
        if (!error && data) {
          finalPrediction = data.predicted_co2;
        }
      }

      const { error } = await supabase.from('emissions_data').insert({
        user_id: user.id,
        company_name: formData.company_name,
        industry_type: formData.industry_type,
        energy_consumption: parseFloat(formData.energy_consumption),
        fuel_usage: parseFloat(formData.fuel_usage),
        production_volume: formData.production_volume ? parseFloat(formData.production_volume) : null,
        waste_generated: formData.waste_generated ? parseFloat(formData.waste_generated) : null,
        water_usage: formData.water_usage ? parseFloat(formData.water_usage) : null,
        predicted_co2: finalPrediction,
        record_date: formData.record_date,
        data_source: 'manual',
      });

      if (error) throw error;

      toast.success('Emission data saved successfully!');
      setFormData({
        company_name: '',
        industry_type: '',
        energy_consumption: '',
        fuel_usage: '',
        production_volume: '',
        waste_generated: '',
        water_usage: '',
        record_date: new Date().toISOString().split('T')[0],
      });
      setPrediction(null);
      onSuccess?.();
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save emission data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="company_name">Company Name *</Label>
          <Input
            id="company_name"
            value={formData.company_name}
            onChange={(e) => handleChange('company_name', e.target.value)}
            placeholder="Enter company name"
            required
            className="input-eco"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="industry_type">Industry Type</Label>
          <Select
            value={formData.industry_type}
            onValueChange={(value) => handleChange('industry_type', value)}
          >
            <SelectTrigger className="input-eco">
              <SelectValue placeholder="Select industry" />
            </SelectTrigger>
            <SelectContent>
              {industryTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="energy_consumption">Energy Consumption (kWh) *</Label>
          <Input
            id="energy_consumption"
            type="number"
            step="0.01"
            value={formData.energy_consumption}
            onChange={(e) => handleChange('energy_consumption', e.target.value)}
            placeholder="e.g., 15000"
            required
            className="input-eco"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="fuel_usage">Fuel Usage (Liters) *</Label>
          <Input
            id="fuel_usage"
            type="number"
            step="0.01"
            value={formData.fuel_usage}
            onChange={(e) => handleChange('fuel_usage', e.target.value)}
            placeholder="e.g., 5000"
            required
            className="input-eco"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="production_volume">Production Volume (units)</Label>
          <Input
            id="production_volume"
            type="number"
            step="0.01"
            value={formData.production_volume}
            onChange={(e) => handleChange('production_volume', e.target.value)}
            placeholder="e.g., 10000"
            className="input-eco"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="waste_generated">Waste Generated (kg)</Label>
          <Input
            id="waste_generated"
            type="number"
            step="0.01"
            value={formData.waste_generated}
            onChange={(e) => handleChange('waste_generated', e.target.value)}
            placeholder="e.g., 500"
            className="input-eco"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="water_usage">Water Usage (m³)</Label>
          <Input
            id="water_usage"
            type="number"
            step="0.01"
            value={formData.water_usage}
            onChange={(e) => handleChange('water_usage', e.target.value)}
            placeholder="e.g., 200"
            className="input-eco"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="record_date">Record Date *</Label>
          <Input
            id="record_date"
            type="date"
            value={formData.record_date}
            onChange={(e) => handleChange('record_date', e.target.value)}
            required
            className="input-eco"
          />
        </div>
      </div>

      {/* Prediction Result */}
      {prediction !== null && (
        <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg eco-gradient flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">AI Predicted CO₂ Emissions</p>
              <p className="text-2xl font-display font-bold text-primary">
                {prediction.toLocaleString()} <span className="text-base font-normal">tons</span>
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          type="button"
          onClick={getPrediction}
          disabled={predicting || !formData.energy_consumption || !formData.fuel_usage}
          className="btn-eco-outline flex-1"
        >
          {predicting ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Get AI Prediction
            </>
          )}
        </Button>

        <Button
          type="submit"
          disabled={loading}
          className="btn-eco flex-1"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <Send className="w-5 h-5" />
              Save Emission Data
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
