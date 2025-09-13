import { render, screen, fireEvent } from '@testing-library/react';
import { FMCSALogSheet } from '../FMCSALogSheet';
import type { DailyLog } from '@/lib/types/api';

// Mock the sub-components to focus on main component logic
jest.mock('../FMCSALogSheet/', () => ({
  TripInformationForm: ({ isOpen, onToggle, fromLocation, toLocation }: any) => (
    <div data-testid="trip-info-form">
      <button onClick={() => onToggle(!isOpen)}>Toggle Trip Info</button>
      <div>From: {fromLocation}</div>
      <div>To: {toLocation}</div>
    </div>
  ),
  VehicleCarrierForm: ({ isOpen, onToggle, carrierName, vehicleNumber }: any) => (
    <div data-testid="vehicle-carrier-form">
      <button onClick={() => onToggle(!isOpen)}>Toggle Vehicle Info</button>
      <div>Carrier: {carrierName}</div>
      <div>Vehicle: {vehicleNumber}</div>
    </div>
  ),
  DutyStatusTimeline: ({ dailyLogs }: any) => (
    <div data-testid="duty-status-timeline">
      <div>Timeline for {dailyLogs.length} days</div>
    </div>
  ),
  RemarksForm: ({ isOpen, onToggle, tripData }: any) => (
    <div data-testid="remarks-form">
      <button onClick={() => onToggle(!isOpen)}>Toggle Remarks</button>
      <div>Trip Data: {tripData ? 'Present' : 'None'}</div>
    </div>
  ),
  RecapForm: ({ isOpen, onToggle, dailyLogs }: any) => (
    <div data-testid="recap-form">
      <button onClick={() => onToggle(!isOpen)}>Toggle Recap</button>
      <div>Daily Logs: {dailyLogs.length}</div>
    </div>
  ),
  HoursSummaryForm: ({ isOpen, onToggle, timelineTotals }: any) => (
    <div data-testid="hours-summary-form">
      <button onClick={() => onToggle(!isOpen)}>Toggle Summary</button>
      <div>Driving Hours: {timelineTotals.driving}</div>
    </div>
  ),
  PDFDownloadButton: ({ date, collapsibleStates, onStateChange }: any) => (
    <div data-testid="pdf-download-button">
      <button onClick={() => onStateChange({ ...collapsibleStates, isTripInfoOpen: true })}>
        Download PDF
      </button>
      <div>Date: {date}</div>
    </div>
  ),
}));

describe('FMCSALogSheet Component', () => {
  const mockDailyLogs: DailyLog[] = [
    {
      date: '2024-01-01',
      entries: [
        {
          start_time: '08:00',
          end_time: '14:00',
          status: 'driving',
          location: 'Route Segment 1',
          duration: 6
        },
        {
          start_time: '14:00',
          end_time: '24:00',
          status: 'off_duty',
          location: 'Rest Area',
          duration: 10
        }
      ],
      totals: {
        driving_hours: 6,
        on_duty_hours: 6,
        off_duty_hours: 10,
        sleeper_berth_hours: 0
      }
    }
  ];

  const mockTripData = {
    fromLocation: 'New York, NY',
    toLocation: 'Los Angeles, CA',
    totalDistance: 2800,
    totalDuration: 45.5,
    totalMilesDriving: 2800,
    mainOfficeAddress: '123 Main St',
    homeTerminalAddress: '456 Terminal Ave'
  };

  it('should render with basic props', () => {
    render(
      <FMCSALogSheet
        dailyLogs={mockDailyLogs}
        carrierName="ABC Trucking"
        vehicleNumber="TRK-001"
        date="2024-01-01"
      />
    );

    expect(screen.getByText('Drivers Daily Log (24 hours)')).toBeInTheDocument();
    expect(screen.getByText('Date: 2024-01-01')).toBeInTheDocument();
    expect(screen.getByTestId('trip-info-form')).toBeInTheDocument();
    expect(screen.getByTestId('vehicle-carrier-form')).toBeInTheDocument();
    expect(screen.getByTestId('duty-status-timeline')).toBeInTheDocument();
  });

  it('should pass trip data to form components', () => {
    render(
      <FMCSALogSheet
        dailyLogs={mockDailyLogs}
        tripData={mockTripData}
      />
    );

    expect(screen.getByText('From: New York, NY')).toBeInTheDocument();
    expect(screen.getByText('To: Los Angeles, CA')).toBeInTheDocument();
    expect(screen.getByText('Carrier: ')).toBeInTheDocument(); // Default empty
    expect(screen.getByText('Vehicle: ')).toBeInTheDocument(); // Default empty
  });

  it('should pass carrier and vehicle information', () => {
    render(
      <FMCSALogSheet
        dailyLogs={mockDailyLogs}
        carrierName="XYZ Transport"
        vehicleNumber="TRK-999"
      />
    );

    expect(screen.getByText('Carrier: XYZ Transport')).toBeInTheDocument();
    expect(screen.getByText('Vehicle: TRK-999')).toBeInTheDocument();
  });

  it('should handle empty daily logs', () => {
    render(
      <FMCSALogSheet
        dailyLogs={[]}
        tripData={mockTripData}
      />
    );

    expect(screen.getByText('Date: 1/13/2025')).toBeInTheDocument(); // Default date
    expect(screen.getByTestId('duty-status-timeline')).toBeInTheDocument();
  });

  it('should extract location information from daily logs', () => {
    render(
      <FMCSALogSheet
        dailyLogs={mockDailyLogs}
      />
    );

    // Should use extracted location info as fallback
    expect(screen.getByText('From: Route Segment 1')).toBeInTheDocument();
    expect(screen.getByText('To: Rest Area')).toBeInTheDocument();
  });

  it('should pass daily logs to recap form', () => {
    render(
      <FMCSALogSheet
        dailyLogs={mockDailyLogs}
      />
    );

    expect(screen.getByText('Daily Logs: 1')).toBeInTheDocument();
  });

  it('should calculate and pass timeline totals to hours summary', () => {
    render(
      <FMCSALogSheet
        dailyLogs={mockDailyLogs}
      />
    );

    // The timeline totals should be calculated and passed to HoursSummaryForm
    expect(screen.getByTestId('hours-summary-form')).toBeInTheDocument();
  });

  it('should handle PDF download state changes', () => {
    render(
      <FMCSALogSheet
        dailyLogs={mockDailyLogs}
        date="2024-01-01"
      />
    );

    const downloadButton = screen.getByText('Download PDF');
    fireEvent.click(downloadButton);

    // Should trigger state change (mocked in the component)
    expect(screen.getByText('Date: 2024-01-01')).toBeInTheDocument();
  });

  it('should handle multiple daily logs', () => {
    const multiDayLogs: DailyLog[] = [
      ...mockDailyLogs,
      {
        date: '2024-01-02',
        entries: [
          {
            start_time: '08:00',
            end_time: '12:00',
            status: 'driving',
            location: 'Route Segment 2',
            duration: 4
          }
        ],
        totals: {
          driving_hours: 4,
          on_duty_hours: 4,
          off_duty_hours: 20,
          sleeper_berth_hours: 0
        }
      }
    ];

    render(
      <FMCSALogSheet
        dailyLogs={multiDayLogs}
      />
    );

    expect(screen.getByText('Daily Logs: 2')).toBeInTheDocument();
  });

  it('should handle missing trip data gracefully', () => {
    render(
      <FMCSALogSheet
        dailyLogs={mockDailyLogs}
        tripData={undefined}
      />
    );

    expect(screen.getByText('Trip Data: None')).toBeInTheDocument();
    expect(screen.getByText('From: Route Segment 1')).toBeInTheDocument(); // Fallback to extracted location
  });

  it('should display proper header information', () => {
    render(
      <FMCSALogSheet
        dailyLogs={mockDailyLogs}
        date="2024-01-01"
      />
    );

    expect(screen.getByText('Drivers Daily Log (24 hours)')).toBeInTheDocument();
    expect(screen.getByText('Date: 2024-01-01')).toBeInTheDocument();
    expect(screen.getByText('Original - File at home terminal.')).toBeInTheDocument();
    expect(screen.getByText('Duplicate - Driver retains in his/her possession for 8 days.')).toBeInTheDocument();
  });

  it('should handle collapsible state management', () => {
    render(
      <FMCSALogSheet
        dailyLogs={mockDailyLogs}
      />
    );

    // Test that collapsible components can be toggled
    const tripInfoToggle = screen.getByText('Toggle Trip Info');
    fireEvent.click(tripInfoToggle);

    const vehicleToggle = screen.getByText('Toggle Vehicle Info');
    fireEvent.click(vehicleToggle);

    // Components should still be rendered
    expect(screen.getByTestId('trip-info-form')).toBeInTheDocument();
    expect(screen.getByTestId('vehicle-carrier-form')).toBeInTheDocument();
  });
});
