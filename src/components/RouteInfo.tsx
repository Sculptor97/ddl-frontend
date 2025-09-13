import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, MapPin, Truck, AlertTriangle } from 'lucide-react';
import type { RouteData, DailyLog } from '@/lib/types/api';
import { calculateRouteStatistics, validateHOSCompliance } from '@/lib/utils/spatialAnalysis';

interface RouteInfoProps {
  route: RouteData;
  dailyLogs?: DailyLog[];
}

export function RouteInfo({ route, dailyLogs = [] }: RouteInfoProps) {
  const stats = calculateRouteStatistics(route);
  const hosValidation = dailyLogs.length > 0 ? validateHOSCompliance(dailyLogs) : null;

  const formatDistance = (miles: number): string => {
    if (miles < 1) {
      return `${(miles * 5280).toFixed(0)} ft`;
    }
    return `${miles.toFixed(1)} mi`;
  };

  const formatDuration = (hours: number): string => {
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);
    return `${wholeHours}h ${minutes}m`;
  };

  const formatSpeed = (mph: number): string => {
    return `${mph.toFixed(1)} mph`;
  };

  const formatCurrency = (amount: number): string => {
    return `$${amount.toFixed(2)}`;
  };

  return (
    <div className="space-y-4">
      {/* Route Statistics */}
      <Card className="border-brand-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm text-brand-primary">
            <MapPin className="h-4 w-4" />
            Route Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Distance</span>
                <span className="font-semibold">{formatDistance(stats.totalDistance)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Duration</span>
                <span className="font-semibold">{formatDuration(stats.totalDuration)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Avg Speed</span>
                <span className="font-semibold">{formatSpeed(stats.averageSpeed)}</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Fuel Cost</span>
                <span className="font-semibold">{formatCurrency(stats.estimatedFuelCost)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Tolls</span>
                <span className="font-semibold">{formatCurrency(stats.estimatedTolls)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Cost</span>
                <span className="font-semibold text-brand-primary">
                  {formatCurrency(stats.estimatedFuelCost + stats.estimatedTolls)}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* HOS Compliance Status */}
      {hosValidation && (
        <Card className={`border ${hosValidation.isCompliant ? 'border-green-200' : 'border-red-200'}`}>
          <CardHeader className="pb-3">
            <CardTitle className={`flex items-center gap-2 text-sm ${hosValidation.isCompliant ? 'text-green-700' : 'text-red-700'}`}>
              <Truck className="h-4 w-4" />
              HOS Compliance Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge variant={hosValidation.isCompliant ? 'default' : 'destructive'}>
                  {hosValidation.isCompliant ? 'Compliant' : 'Non-Compliant'}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {dailyLogs.length} day{dailyLogs.length !== 1 ? 's' : ''} analyzed
                </span>
              </div>

              {hosValidation.violations.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-red-700 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    Violations
                  </h4>
                  <ul className="space-y-1">
                    {hosValidation.violations.map((violation, index) => (
                      <li key={index} className="text-xs text-red-600 bg-red-50 p-2 rounded">
                        {violation}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {hosValidation.warnings.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-yellow-700 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    Warnings
                  </h4>
                  <ul className="space-y-1">
                    {hosValidation.warnings.map((warning, index) => (
                      <li key={index} className="text-xs text-yellow-600 bg-yellow-50 p-2 rounded">
                        {warning}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Daily Summary */}
      {dailyLogs.length > 0 && (
        <Card className="border-brand-secondary/20">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm text-brand-secondary">
              <Clock className="h-4 w-4" />
              Daily Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {dailyLogs.map((log, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                  <div>
                    <span className="text-sm font-medium">
                      Day {index + 1} - {new Date(log.date).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="outline" className="text-xs">
                      {log.totals.driving_hours.toFixed(1)}h driving
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {log.totals.on_duty_hours.toFixed(1)}h on duty
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {log.totals.off_duty_hours.toFixed(1)}h off duty
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {log.totals.sleeper_berth_hours.toFixed(1)}h sleeper berth
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}