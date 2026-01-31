import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { EmissionForm } from '@/components/forms/EmissionForm';
import { CSVUpload } from '@/components/forms/CSVUpload';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileSpreadsheet, PenLine, Sparkles } from 'lucide-react';

export default function Upload() {
  const [key, setKey] = useState(0);

  const handleSuccess = () => {
    setKey((k) => k + 1);
  };

  return (
    <DashboardLayout>
      <div className="p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8 animate-fade-in">
            <h1 className="text-2xl lg:text-3xl font-display font-bold text-foreground mb-2">
              Upload Emission Data
            </h1>
            <p className="text-muted-foreground">
              Add your emission data manually or upload a CSV file for batch processing
            </p>
          </div>

          {/* AI Feature Banner */}
          <div className="mb-8 p-4 rounded-xl bg-gradient-to-r from-primary/10 via-accent/10 to-primary/5 border border-primary/20 animate-slide-up">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl eco-gradient flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">
                  AI-Powered Predictions
                </h3>
                <p className="text-sm text-muted-foreground">
                  Our machine learning model automatically predicts CO₂ emissions based on your energy consumption, fuel usage, and other metrics. Get instant, accurate predictions for your data.
                </p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="manual" className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <TabsList className="w-full grid grid-cols-2 h-14 p-1 bg-secondary/50 rounded-xl">
              <TabsTrigger
                value="manual"
                className="flex items-center gap-2 rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm h-full"
              >
                <PenLine className="w-4 h-4" />
                Manual Entry
              </TabsTrigger>
              <TabsTrigger
                value="csv"
                className="flex items-center gap-2 rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm h-full"
              >
                <FileSpreadsheet className="w-4 h-4" />
                CSV Upload
              </TabsTrigger>
            </TabsList>

            <div className="mt-6 p-6 bg-card rounded-xl border border-border">
              <TabsContent value="manual" className="mt-0">
                <EmissionForm key={`manual-${key}`} onSuccess={handleSuccess} />
              </TabsContent>

              <TabsContent value="csv" className="mt-0">
                <CSVUpload key={`csv-${key}`} onSuccess={handleSuccess} />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>
    </DashboardLayout>
  );
}
