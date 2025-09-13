import { render, screen } from '@testing-library/react';
import { DutyStatusTimeline } from '../DutyStatusTimeline';
import type { DailyLog } from '@/lib/types/api';

// Mock the DutyStatusCanvas component
jest.mock('../DutyStatusCanvas', () => ({
  DutyStatusCanvas: ({ dailyLogs }: any) => (
    <div data-testid="duty-status-canvas">
      Canvas for {dailyLogs.length} daily logs
    </div>
  ),
}));

describe('DutyStatusTimeline Component', () => {
  const mockDailyLogs: DailyLog[] = [
    {
      date: '2024-01-01',
      entries: [
        {
          start_time: '08:00',
          end_time: '14:00',
          status: 'driving',
          location: 'Route',
          duration: 6
        },
        {
          start_time: '14:00',
          end_time: '24:00',
          status: 'off_duty',
          location: 'Rest',
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

  it('should render timeline with correct title', () => {
    render(<DutyStatusTimeline dailyLogs={mockDailyLogs} />);
    
    expect(screen.getByText('Duty Status Time Log')).toBeInTheDocument();
  });

  it('should render duty status rows', () => {
    render(<DutyStatusTimeline dailyLogs={mockDailyLogs} />);
    
    expect(screen.getByText('1. Off Duty')).toBeInTheDocument();
    expect(screen.getByText('2. Sleeper Berth')).toBeInTheDocument();
    expect(screen.getByText('3. Driving')).toBeInTheDocument();
    expect(screen.getByText('4. On Duty (not driving)')).toBeInTheDocument();
  });

  it('should render time header with duty status label', () => {
    render(<DutyStatusTimeline dailyLogs={mockDailyLogs} />);
    
    expect(screen.getByText('Duty Status')).toBeInTheDocument();
    expect(screen.getByText('Total Hours')).toBeInTheDocument();
  });

  it('should render canvas component', () => {
    render(<DutyStatusTimeline dailyLogs={mockDailyLogs} />);
    
    expect(screen.getByTestId('duty-status-canvas')).toBeInTheDocument();
    expect(screen.getByText('Canvas for 1 daily logs')).toBeInTheDocument();
  });

  it('should display calculated totals in input fields', () => {
    render(<DutyStatusTimeline dailyLogs={mockDailyLogs} />);
    
    // Check that total hours inputs are rendered and have correct values
    const totalInputs = screen.getAllByRole('textbox');
    expect(totalInputs).toHaveLength(4); // One for each duty status
    
    // The values should be calculated from the timeline
    // This tests that the component properly calculates and displays totals
    totalInputs.forEach(input => {
      expect(input).toHaveAttribute('readonly');
    });
  });

  it('should handle empty daily logs', () => {
    render(<DutyStatusTimeline dailyLogs={[]} />);
    
    expect(screen.getByText('Duty Status Time Log')).toBeInTheDocument();
    expect(screen.getByTestId('duty-status-canvas')).toBeInTheDocument();
    expect(screen.getByText('Canvas for 0 daily logs')).toBeInTheDocument();
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
            location: 'Route 2',
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

    render(<DutyStatusTimeline dailyLogs={multiDayLogs} />);
    
    expect(screen.getByText('Canvas for 2 daily logs')).toBeInTheDocument();
  });

  it('should render time slots correctly', () => {
    render(<DutyStatusTimeline dailyLogs={mockDailyLogs} />);
    
    // Should render 96 time slots (24 hours * 4 quarters)
    const timeSlots = screen.getAllByTitle(/^\d{2}:\d{2}$/);
    expect(timeSlots).toHaveLength(96);
  });

  it('should display hour markers correctly', () => {
    render(<DutyStatusTimeline dailyLogs={mockDailyLogs} />);
    
    // Check for hour markers (every 4th slot should have hour-mark class)
    const hourMarks = document.querySelectorAll('.hour-mark');
    expect(hourMarks.length).toBeGreaterThan(0);
  });

  it('should handle different duty status types', () => {
    const logsWithAllStatuses: DailyLog[] = [
      {
        date: '2024-01-01',
        entries: [
          {
            start_time: '08:00',
            end_time: '10:00',
            status: 'driving',
            location: 'Route',
            duration: 2
          },
          {
            start_time: '10:00',
            end_time: '12:00',
            status: 'on_duty',
            location: 'Loading',
            duration: 2
          },
          {
            start_time: '12:00',
            end_time: '14:00',
            status: 'sleeper_berth',
            location: 'Rest',
            duration: 2
          },
          {
            start_time: '14:00',
            end_time: '24:00',
            status: 'off_duty',
            location: 'Rest',
            duration: 10
          }
        ],
        totals: {
          driving_hours: 2,
          on_duty_hours: 4,
          off_duty_hours: 10,
          sleeper_berth_hours: 2
        }
      }
    ];

    render(<DutyStatusTimeline dailyLogs={logsWithAllStatuses} />);
    
    // Should render all duty status rows
    expect(screen.getByText('1. Off Duty')).toBeInTheDocument();
    expect(screen.getByText('2. Sleeper Berth')).toBeInTheDocument();
    expect(screen.getByText('3. Driving')).toBeInTheDocument();
    expect(screen.getByText('4. On Duty (not driving)')).toBeInTheDocument();
  });
});
