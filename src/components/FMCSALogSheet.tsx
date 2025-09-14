import { useRef, useState, useMemo } from 'react';
import type { DailyLog } from '@/lib/types/api';
import { 
  createContinuousTimeline, 
  calculateTimelineTotals,
  validateEntries
} from '@/lib/utils/fmcsaUtils';
import './FMCSALogSheet.css';
import './FMCSALogSheet-pdf.css';

// Import the new components
import {
  TripInformationForm,
  VehicleCarrierForm,
  DutyStatusTimeline,
  RemarksForm,
  RecapForm,
  HoursSummaryForm,
  PDFDownloadButton
} from './FMCSALogSheet/index';

interface FMCSALogSheetProps {
  dailyLogs: DailyLog[];
  carrierName?: string;
  vehicleNumber?: string;
  date?: string;
  // Additional trip data for form population
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

export function FMCSALogSheet({ 
  dailyLogs, 
  carrierName = '', 
  vehicleNumber = '',
  date = new Date().toLocaleDateString(),
  tripData
}: FMCSALogSheetProps) {
  const logSheetRef = useRef<HTMLDivElement>(null);
  
  // Collapsible state for form sections
  const [isTripInfoOpen, setIsTripInfoOpen] = useState(false);
  const [isVehicleInfoOpen, setIsVehicleInfoOpen] = useState(false);
  const [isRemarksOpen, setIsRemarksOpen] = useState(false);
  const [isRecapOpen, setIsRecapOpen] = useState(false);
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  
  
  // Extract location information from daily logs
  const extractLocationInfo = useMemo(() => {
    if (dailyLogs.length === 0) return { startLocation: '', endLocation: '' };
    
    const firstLog = dailyLogs[0];
    const lastLog = dailyLogs[dailyLogs.length - 1];
    
    const startLocation = firstLog.entries.length > 0 ? firstLog.entries[0].location : '';
    const endLocation = lastLog.entries.length > 0 ? lastLog.entries[lastLog.entries.length - 1].location : '';
    
    return { startLocation, endLocation };
  }, [dailyLogs]);

  // Calculate timeline totals for the hours summary
  const timelineTotals = useMemo(() => {
    if (dailyLogs.length === 0) {
      return { off_duty: 0, sleeper_berth: 0, driving: 0, on_duty: 0 };
    }
    
    const timeline = createContinuousTimeline(dailyLogs[0].entries);
    return calculateTimelineTotals(timeline);
  }, [dailyLogs]);

  // Validate entries for debugging
  if (dailyLogs.length > 0) {
    const validationIssues = validateEntries(dailyLogs[0].entries);
    if (validationIssues.length > 0) {
      console.warn('Entry validation issues:', validationIssues);
    }
  }

  // Collapsible states object for PDF download
  const collapsibleStates = {
    isTripInfoOpen,
    isVehicleInfoOpen,
    isRemarksOpen,
    isRecapOpen,
    isSummaryOpen
  };

  const handleStateChange = (states: typeof collapsibleStates) => {
    setIsTripInfoOpen(states.isTripInfoOpen);
    setIsVehicleInfoOpen(states.isVehicleInfoOpen);
    setIsRemarksOpen(states.isRemarksOpen);
    setIsRecapOpen(states.isRecapOpen);
    setIsSummaryOpen(states.isSummaryOpen);
  };

  return (
    <div className="space-y-4">
      {/* PDF Download Button */}
      <PDFDownloadButton 
        date={date}
        logSheetRef={logSheetRef}
        collapsibleStates={collapsibleStates}
        onStateChange={handleStateChange}
      />

      {/* Log Sheet Content */}
      <div ref={logSheetRef} className="fmcsa-log-sheet w-full p-4 bg-white">
        <div className="log-sheet-container">
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold mb-2">Drivers Daily Log (24 hours)</h1>
            <div className="flex justify-center gap-4 text-sm">
              <span>Date: {dailyLogs.length > 0 ? dailyLogs[0].date : date}</span>
            </div>
            <div className="text-xs mt-2">
              <p>Original - File at home terminal.</p>
              <p>Duplicate - Driver retains in his/her possession for 8 days.</p>
            </div>
          </div>

          {/* Trip Information */}
          <TripInformationForm
            isOpen={isTripInfoOpen}
            onToggle={setIsTripInfoOpen}
            fromLocation={tripData?.fromLocation || extractLocationInfo.startLocation}
            toLocation={tripData?.toLocation || extractLocationInfo.endLocation}
          />

          {/* Vehicle and Carrier Information */}
          <VehicleCarrierForm
            isOpen={isVehicleInfoOpen}
            onToggle={setIsVehicleInfoOpen}
            carrierName={carrierName}
            vehicleNumber={vehicleNumber}
            totalMilesDriving={tripData?.totalMilesDriving}
            totalDistance={tripData?.totalDistance}
            mainOfficeAddress={tripData?.mainOfficeAddress}
            homeTerminalAddress={tripData?.homeTerminalAddress}
          />

          {/* 24-Hour Duty Status Grid */}
          <DutyStatusTimeline dailyLogs={dailyLogs} />

          {/* Remarks and Shipping Documents */}
          <RemarksForm
            isOpen={isRemarksOpen}
            onToggle={setIsRemarksOpen}
            tripData={tripData}
          />

          {/* Recap Section */}
          <RecapForm
            isOpen={isRecapOpen}
            onToggle={setIsRecapOpen}
            dailyLogs={dailyLogs}
          />

          {/* Hours Summary Table */}
          <HoursSummaryForm
            isOpen={isSummaryOpen}
            onToggle={setIsSummaryOpen}
            timelineTotals={timelineTotals}
          />
        </div>
      </div>
    </div>
  );
}