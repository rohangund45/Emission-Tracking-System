import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  Leaf,
  ArrowRight,
  BarChart3,
  Upload,
  FileText,
  Sparkles,
  Shield,
  Zap,
  Globe,
  ChevronRight,
} from 'lucide-react';

export default function Index() {
  const { user } = useAuth();

  const features = [
    {
      icon: Sparkles,
      title: 'AI-Powered Predictions',
      description: 'Advanced machine learning models predict CO₂ emissions from your operational data with high accuracy.',
    },
    {
      icon: Upload,
      title: 'Batch CSV Upload',
      description: 'Upload thousands of records at once with automatic validation, normalization, and processing.',
    },
    {
      icon: BarChart3,
      title: 'Interactive Dashboards',
      description: 'Real-time visualizations and trend analysis to monitor your environmental impact.',
    },
    {
      icon: FileText,
      title: 'Detailed Reports',
      description: 'Generate comprehensive PDF and CSV reports for compliance and stakeholder reporting.',
    },
    {
      icon: Shield,
      title: 'Role-Based Access',
      description: 'Separate dashboards for industry users and administrators with appropriate permissions.',
    },
    {
      icon: Globe,
      title: 'Multi-Industry Support',
      description: 'Tailored predictions for manufacturing, energy, transportation, agriculture, and more.',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl eco-gradient flex items-center justify-center">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-display font-bold text-foreground">Next Gen</span>
              <span className="text-xs text-muted-foreground block -mt-1">Emission Control</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <Button asChild className="btn-eco">
                <Link to="/dashboard">
                  Go to Dashboard
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </Button>
            ) : (
              <>
                <Button asChild variant="ghost" className="hidden sm:flex">
                  <Link to="/auth">Sign In</Link>
                </Button>
                <Button asChild className="btn-eco">
                  <Link to="/auth">
                    Get Started
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-accent/5 blur-3xl" />
        </div>

        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8">
              <Zap className="w-4 h-4" />
              AI-Powered Carbon Tracking
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-foreground mb-6 leading-tight">
              Next Generation
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
                Emission Control System
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
              Monitor, predict, and reduce your organization's carbon footprint with advanced AI. 
              Make data-driven decisions for a sustainable future.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button asChild size="lg" className="btn-eco h-14 px-8 text-lg">
                <Link to="/auth">
                  Start Tracking Now
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="h-14 px-8 text-lg">
                <Link to="/auth">
                  View Demo Dashboard
                  <ChevronRight className="w-5 h-5" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20 max-w-4xl mx-auto animate-slide-up" style={{ animationDelay: '0.2s' }}>
            {[
              { value: '99%', label: 'Prediction Accuracy' },
              { value: '50+', label: 'Industries Supported' },
              { value: '1M+', label: 'Records Processed' },
              { value: '24/7', label: 'Real-time Monitoring' },
            ].map((stat, i) => (
              <div key={i} className="text-center p-4">
                <p className="text-3xl lg:text-4xl font-display font-bold text-primary mb-1">
                  {stat.value}
                </p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 lg:py-32 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-3xl lg:text-4xl font-display font-bold text-foreground mb-4">
              Comprehensive Emission Management
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Everything you need to track, analyze, and reduce your carbon footprint in one platform.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {features.map((feature, i) => (
              <div
                key={i}
                className="bg-card rounded-2xl border border-border p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 animate-slide-up"
                style={{ animationDelay: `${0.1 * i}s` }}
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="p-8 lg:p-12 rounded-3xl hero-gradient text-white animate-fade-in">
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-6">
                <Leaf className="w-8 h-8" />
              </div>
              <h2 className="text-3xl lg:text-4xl font-display font-bold mb-4">
                Ready to Go Carbon Neutral?
              </h2>
              <p className="text-lg text-white/80 mb-8 max-w-xl mx-auto">
                Join leading industries using AI-powered emission tracking to meet sustainability goals and comply with regulations.
              </p>
              <Button asChild size="lg" className="bg-white text-primary hover:bg-white/90 h-14 px-8 text-lg">
                <Link to="/auth">
                  Create Free Account
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg eco-gradient flex items-center justify-center">
                <Leaf className="w-4 h-4 text-white" />
              </div>
              <span className="font-display font-semibold text-foreground">
                Next Gen Emission Control
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} NGECS. Built for a sustainable future.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
