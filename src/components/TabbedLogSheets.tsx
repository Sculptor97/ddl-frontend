import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FMCSALogSheet } from './FMCSALogSheet';
import type { DailyLog } from '@/lib/types/api';
import { Calendar, FileText } from 'lucide-react';

interface TabbedLogSheetsProps {
  dailyLogs: DailyLog[];
  carrierName?: string;
  vehicleNumber?: string;
  tripData?: {
    fromLocation?: string;
    toLocation?: string;
    totalDistance?: number;
    totalDuration?: number;
    totalMilesDriving?: number;
    mainOfficeAddress?: string;
    homeTerminalAddress?: string;
  };
}

export function TabbedLogSheets({ 
  dailyLogs, 
  carrierName = '', 
  vehicleNumber = '',
  tripData
}: TabbedLogSheetsProps) {
  const [activeTab, setActiveTab] = useState(0);

  if (!dailyLogs || dailyLogs.length === 0) {
    return null;
  }

  // Single day trip - show without tabs
  if (dailyLogs.length === 1) {
  return (
    <Card className="border-brand-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm text-brand-primary">
          <FileText className="h-4 w-4" />
          Hours of Service Log
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 overflow-x-auto">
        <div className="min-w-[1424px]">
          <FMCSALogSheet 
            dailyLogs={dailyLogs}
            carrierName={carrierName}
            vehicleNumber={vehicleNumber}
            tripData={tripData}
          />
        </div>
      </CardContent>
    </Card>
  );
  }

  // Multi-day trip - show with tabs
  return (
    <Card className="border-brand-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm text-brand-primary">
          <Calendar className="h-4 w-4" />
          Hours of Service Logs ({dailyLogs.length} Days)
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200 px-6 pt-6">
          {dailyLogs.map((log, index) => {
            const date = new Date(log.date);
            const isActive = activeTab === index;
            
            return (
              <Button
                key={index}
                variant={isActive ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveTab(index)}
                className={`flex items-center gap-2 ${
                  isActive 
                    ? 'bg-brand-primary text-white border-brand-primary' 
                    : 'text-gray-600 hover:text-brand-primary'
                }`}
              >
                <Calendar className="h-3 w-3" />
                Day {index + 1}
                <span className="text-xs opacity-75">
                  {date.toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                </span>
              </Button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="min-h-[600px] overflow-x-auto">
          <div className="min-w-[1424px]">
            <FMCSALogSheet 
              dailyLogs={[dailyLogs[activeTab]]}
              carrierName={carrierName}
              vehicleNumber={vehicleNumber}
              date={dailyLogs[activeTab].date}
              tripData={tripData}
            />
          </div>
        </div>

        {/* Trip Summary */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-semibold text-gray-800 mb-2">Trip Summary</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Total Days:</span>
              <span className="ml-2 font-medium">{dailyLogs.length}</span>
            </div>
            <div>
              <span className="text-gray-600">Total Driving:</span>
              <span className="ml-2 font-medium">
                {dailyLogs.reduce((sum, log) => sum + log.totals.driving_hours, 0).toFixed(1)} hrs
              </span>
            </div>
            <div>
              <span className="text-gray-600">Total On Duty:</span>
              <span className="ml-2 font-medium">
                {dailyLogs.reduce((sum, log) => sum + log.totals.on_duty_hours, 0).toFixed(1)} hrs
              </span>
            </div>
            <div>
              <span className="text-gray-600">Total Off Duty:</span>
              <span className="ml-2 font-medium">
                {dailyLogs.reduce((sum, log) => sum + log.totals.off_duty_hours, 0).toFixed(1)} hrs
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
