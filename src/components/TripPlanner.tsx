import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { TripForm } from './TripForm';
import { MapView } from './MapView';
import { TabbedLogSheets } from './TabbedLogSheets';
import { RouteInfo } from './RouteInfo';
import type { TripPlanResponse } from '@/lib/types/api';
import { MapPin, Route, FileText, Truck } from 'lucide-react';

export function TripPlanner() {
  const [tripData, setTripData] = useState<TripPlanResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formCoordinates, setFormCoordinates] = useState<{
    current: [number, number] | null;
    pickup: [number, number] | null;
    dropoff: [number, number] | null;
  }>({
    current: null,
    pickup: null,
    dropoff: null
  });
  const [formAddresses, setFormAddresses] = useState<{
    current: string;
    pickup: string;
    dropoff: string;
  }>({
    current: '',
    pickup: '',
    dropoff: ''
  });

  const handleTripPlanned = (data: TripPlanResponse) => {
    if (!data) {
      setError('No data received from server');
      return;
    }
    
    
    setTripData(data);
    setError(null);
  };

  const handleFormCoordinates = (coordinates: {
    current: [number, number] | null;
    pickup: [number, number] | null;
    dropoff: [number, number] | null;
  }) => {
    setFormCoordinates(coordinates);
  };

  const handleFormAddresses = (addresses: {
    current: string;
    pickup: string;
    dropoff: string;
  }) => {
    setFormAddresses(addresses);
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
    setTripData(null);
  };

  const handleLoading = (isLoading: boolean) => {
    setLoading(isLoading);
  };

  // Create trip data object for form population
  const createTripData = () => {
    if (!tripData) return undefined;

    return {
      fromLocation: formAddresses.pickup || 'Pickup Location',
      toLocation: formAddresses.dropoff || 'Dropoff Location',
      totalDistance: tripData.total_distance,
      totalDuration: tripData.total_duration / 3600, // Convert seconds to hours
      totalMilesDriving: tripData.total_distance, // Same as total distance for now
      mainOfficeAddress: 'Main Office Address', // Could be made configurable
      homeTerminalAddress: 'Home Terminal Address', // Could be made configurable
    };
  };

  return (
    <div className="space-y-6">
      {/* Main Content - Form and Map Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trip Form - Left Side */}
        <div className="space-y-4">
          <Card className="border-brand-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-brand-primary">
                <MapPin className="h-5 w-5" />
                Trip Details
              </CardTitle>
              <CardDescription>
                Enter your trip information to plan with HOS compliance
              </CardDescription>
            </CardHeader>
            <CardContent>
        <TripForm 
          onTripPlanned={handleTripPlanned}
          onError={handleError}
          onLoading={handleLoading}
          onCoordinatesChange={handleFormCoordinates}
          onAddressesChange={handleFormAddresses}
        />
            </CardContent>
          </Card>

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Enhanced Loading State */}
          {loading && (
            <Card className="border-brand-accent/20 shadow-lg">
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center space-y-4">
                  <div className="relative">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-brand-primary/20 border-t-brand-primary mx-auto"></div>
                    <div className="absolute inset-0 animate-pulse rounded-full h-12 w-12 border-2 border-brand-secondary/30 mx-auto"></div>
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-semibold text-brand-primary">Planning Your Route</h3>
                    <p className="text-sm text-muted-foreground">Calculating optimal path with HOS compliance...</p>
                    <div className="flex justify-center space-x-1 mt-3">
                      <div className="w-2 h-2 bg-brand-primary rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-brand-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-brand-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Map and Route Info - Right Side */}
        <div className="space-y-4">
          {/* Map View */}
          <Card className="border-brand-accent/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-brand-accent">
                <MapPin className="h-5 w-5" />
                Route Map
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="h-96 rounded-b-lg overflow-hidden">
                {tripData && formCoordinates.current && formCoordinates.pickup && formCoordinates.dropoff ? (
                  <MapView 
                    route={tripData.route}
                    currentLocation={formCoordinates.current}
                    pickup={formCoordinates.pickup}
                    dropoff={formCoordinates.dropoff}
                    dailyLogs={tripData.daily_logs}
                  />
                ) : (
                  <div className="h-full flex items-center justify-center bg-gradient-to-br from-muted/20 to-muted/40">
                    <div className="text-center space-y-4 p-8">
                      <div className="relative">
                        <div className="w-16 h-16 bg-brand-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                          <MapPin className="h-8 w-8 text-brand-primary" />
                        </div>
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-brand-secondary rounded-full animate-pulse"></div>
                      </div>
                      <div className="space-y-2">
                        <h3 className="font-semibold text-gray-800">Ready to Plan Your Route</h3>
                        <p className="text-sm text-muted-foreground max-w-xs">
                          Enter your trip details in the form to see your optimized route with HOS compliance
                        </p>
                      </div>
                      <div className="flex justify-center space-x-2 mt-4">
                        <div className="w-2 h-2 bg-brand-primary/40 rounded-full animate-pulse"></div>
                        <div className="w-2 h-2 bg-brand-primary/60 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-2 h-2 bg-brand-primary/80 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Route Information */}
          {tripData && (
            <Card className="border-brand-secondary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-brand-secondary">
                  <Route className="h-5 w-5" />
                  Route Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RouteInfo route={tripData.route} />
              </CardContent>
            </Card>
          )}

          {/* Enhanced Truck Image Section */}
          <Card className="border-brand-primary/20 overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="relative h-full bg-gradient-to-br from-brand-primary/15 via-brand-secondary/10 to-brand-primary/15">
              <img
                src="https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80"
                alt="Professional truck driver on the road"
                className="w-full h-full object-cover opacity-25 transition-opacity duration-300 hover:opacity-35"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-primary/40 via-transparent to-transparent"></div>
              
              {/* Floating elements for visual interest */}
              <div className="absolute top-4 right-4 w-3 h-3 bg-brand-secondary/60 rounded-full animate-pulse"></div>
              <div className="absolute top-8 right-8 w-2 h-2 bg-brand-primary/40 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
              <div className="absolute top-12 right-12 w-1 h-1 bg-brand-secondary/80 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
              
              <div className="absolute bottom-4 left-4 right-4">
                <div className="bg-white/95 backdrop-blur-md rounded-xl p-5 border border-brand-primary/20 shadow-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-brand-primary to-brand-secondary rounded-xl flex items-center justify-center shadow-md">
                      <Truck className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-brand-primary text-base">Professional Trucking</h4>
                      <p className="text-sm text-muted-foreground">FMCSA compliant route planning & HOS management</p>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-xs text-green-600 font-medium">Compliance Ready</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card> 
        </div>
      </div>

      {/* HOS Log Sheet - Full Width Below */}
      {tripData && (
        <Card className="border-brand-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-brand-primary">
              <FileText className="h-5 w-5" />
              Hours of Service Log Sheet
            </CardTitle>
            <CardDescription>
              FMCSA compliant duty status tracking
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TabbedLogSheets 
              key={`logsheet-${tripData.total_distance}-${tripData.total_duration}`}
              dailyLogs={tripData.daily_logs}
              carrierName="ABC Trucking"
              vehicleNumber="TRK-001"
              tripData={createTripData()}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
