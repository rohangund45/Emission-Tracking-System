import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Sparkles, Loader2, ArrowRight, TrendingUp, Lightbulb, Leaf } from 'lucide-react';

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

interface PredictionResult {
  predicted_co2: number;
  confidence: string;
  suggestions: string[];
}

export default function Predictions() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [formData, setFormData] = useState({
    energy_consumption: '',
    fuel_usage: '',
    production_volume: '',
    waste_generated: '',
    water_usage: '',
    industry_type: '',
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.energy_consumption || !formData.fuel_usage) {
      toast.error('Please enter at least energy consumption and fuel usage');
      return;
    }

    setLoading(true);
    setResult(null);

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

      setResult(data);
      toast.success('Prediction generated!');
    } catch (error) {
      console.error('Prediction error:', error);
      toast.error('Failed to generate prediction');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8 animate-fade-in">
            <h1 className="text-2xl lg:text-3xl font-display font-bold text-foreground mb-2">
              AI Emission Predictor
            </h1>
            <p className="text-muted-foreground">
              Enter your operational data to get instant CO₂ emission predictions
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Form */}
            <div className="bg-card rounded-2xl border border-border p-6 animate-slide-up">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl eco-gradient flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-lg font-semibold text-foreground">Input Parameters</h2>
              </div>

              <form onSubmit={handlePredict} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="energy">Energy Consumption (kWh) *</Label>
                  <Input
                    id="energy"
                    type="number"
                    step="0.01"
                    value={formData.energy_consumption}
                    onChange={(e) => handleChange('energy_consumption', e.target.value)}
                    placeholder="e.g., 15000"
                    className="input-eco"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fuel">Fuel Usage (Liters) *</Label>
                  <Input
                    id="fuel"
                    type="number"
                    step="0.01"
                    value={formData.fuel_usage}
                    onChange={(e) => handleChange('fuel_usage', e.target.value)}
                    placeholder="e.g., 5000"
                    className="input-eco"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="industry">Industry Type</Label>
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

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="production">Production (units)</Label>
                    <Input
                      id="production"
                      type="number"
                      step="0.01"
                      value={formData.production_volume}
                      onChange={(e) => handleChange('production_volume', e.target.value)}
                      placeholder="10000"
                      className="input-eco"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="waste">Waste (kg)</Label>
                    <Input
                      id="waste"
                      type="number"
                      step="0.01"
                      value={formData.waste_generated}
                      onChange={(e) => handleChange('waste_generated', e.target.value)}
                      placeholder="500"
                      className="input-eco"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="water">Water Usage (m³)</Label>
                  <Input
                    id="water"
                    type="number"
                    step="0.01"
                    value={formData.water_usage}
                    onChange={(e) => handleChange('water_usage', e.target.value)}
                    placeholder="200"
                    className="input-eco"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-eco h-12 mt-6"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Generate Prediction
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </Button>
              </form>
            </div>

            {/* Results */}
            <div className="space-y-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
              {result ? (
                <>
                  {/* Prediction Result */}
                  <div className="bg-card rounded-2xl border border-border p-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Sparkles className="w-5 h-5 text-primary" />
                      </div>
                      <h2 className="text-lg font-semibold text-foreground">Prediction Result</h2>
                    </div>

                    <div className="text-center py-8">
                      <div className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 mb-4">
                        <Leaf className="w-12 h-12 text-primary" />
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">Predicted CO₂ Emissions</p>
                      <p className="text-5xl font-display font-bold text-foreground mb-2">
                        {result.predicted_co2.toLocaleString()}
                      </p>
                      <p className="text-lg text-muted-foreground">tons CO₂</p>
                      <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10">
                        <span className="text-sm font-medium text-primary">
                          Confidence: {result.confidence}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Suggestions */}
                  {result.suggestions && result.suggestions.length > 0 && (
                    <div className="bg-card rounded-2xl border border-border p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-eco-leaf/10 flex items-center justify-center">
                          <Lightbulb className="w-5 h-5 text-eco-leaf" />
                        </div>
                        <h2 className="text-lg font-semibold text-foreground">
                          AI Recommendations
                        </h2>
                      </div>

                      <ul className="space-y-3">
                        {result.suggestions.map((suggestion, i) => (
                          <li
                            key={i}
                            className="flex items-start gap-3 p-3 rounded-lg bg-muted/50"
                          >
                            <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <span className="text-xs font-medium text-primary">{i + 1}</span>
                            </div>
                            <p className="text-sm text-foreground">{suggestion}</p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </>
              ) : (
                <div className="bg-card rounded-2xl border border-border p-6 flex flex-col items-center justify-center min-h-[400px] text-center">
                  <div className="w-20 h-20 rounded-2xl bg-muted flex items-center justify-center mb-4">
                    <Sparkles className="w-10 h-10 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    Ready to Predict
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-xs">
                    Enter your operational parameters on the left to get an AI-powered CO₂ emission prediction
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
