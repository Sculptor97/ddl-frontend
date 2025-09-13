import { TripPlanner } from '../components/TripPlanner';
import { Truck, Route, Clock, Shield } from 'lucide-react';

export function TripPlannerPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-light/30 via-brand-accent/20 to-brand-secondary/10 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 left-10 w-32 h-32 bg-brand-primary rounded-full blur-3xl"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-brand-secondary rounded-full blur-2xl"></div>
        <div className="absolute bottom-20 left-1/3 w-40 h-40 bg-brand-accent rounded-full blur-3xl"></div>
        <div className="absolute bottom-40 right-1/3 w-28 h-28 bg-brand-primary rounded-full blur-2xl"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 bg-white/80 backdrop-blur-sm border-b border-brand-primary/10 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-xl flex items-center justify-center shadow-lg">
                  <Truck className="h-7 w-7 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-brand-accent rounded-full border-2 border-white"></div>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-brand-primary to-brand-secondary bg-clip-text text-transparent">
                  HOS Trip Planner
                </h1>
                <p className="text-xs text-muted-foreground font-medium">
                  FMCSA Compliant
                </p>
              </div>
            </div>

            {/* Feature Icons */}
            <div className="hidden md:flex items-center gap-6">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Route className="h-4 w-4 text-brand-primary" />
                <span>Route Planning</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4 text-brand-secondary" />
                <span>HOS Compliance</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Shield className="h-4 w-4 text-brand-accent" />
                <span>FMCSA Approved</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-brand-primary/10 text-brand-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
            <Shield className="h-4 w-4" />
            FMCSA Compliant Trip Planning
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Plan Your Route with
            <span className="bg-gradient-to-r from-brand-primary to-brand-secondary bg-clip-text text-transparent"> Confidence</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Optimize your trucking routes while maintaining full compliance with Hours of Service regulations. 
            Get real-time route planning with automatic HOS scheduling.
          </p>
        </div>
        
        <TripPlanner />
      </div>

      {/* Footer */}
      <footer className="relative z-10 mt-16 bg-white/60 backdrop-blur-sm border-t border-brand-primary/10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Truck className="h-4 w-4" />
              <span>Built for Professional Drivers</span>
            </div>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span>© 2024 HOS Trip Planner</span>
              <span>•</span>
              <span>FMCSA Compliant</span>
              <span>•</span>
              <span>Real-time Planning</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
