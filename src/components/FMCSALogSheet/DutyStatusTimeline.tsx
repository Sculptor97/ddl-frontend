import { useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { generateTimeSlots, calculateTimelineTotals, createContinuousTimeline } from '@/lib/utils/fmcsaUtils';
import type { DailyLog } from '@/lib/types/api';
import { DutyStatusCanvas } from './DutyStatusCanvas';

interface DutyStatusTimelineProps {
  dailyLogs: DailyLog[];
}

export function DutyStatusTimeline({ dailyLogs }: DutyStatusTimelineProps) {
  const timeSlots = useMemo(() => generateTimeSlots(), []);

  // Calculate timeline totals for display
  const timelineTotals = useMemo(() => {
    if (dailyLogs.length === 0) {
      return { off_duty: 0, sleeper_berth: 0, driving: 0, on_duty: 0 };
    }
    
    const timeline = createContinuousTimeline(dailyLogs[0].entries);
    return calculateTimelineTotals(timeline);
  }, [dailyLogs]);

  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold mb-4">Duty Status Time Log</h3>
      
      {/* Time Header */}
      <div className="time-header">
        <div className="time-header-label">
          Duty Status
        </div>
        <div className="time-header-slots">
          {timeSlots.map((slot, index) => (
            <div 
              key={index} 
              className={`time-header-slot ${
                slot.quarter === 0 ? 'bg-gray-50' : 'bg-white'
              }`}
            >
              {slot.quarter === 0 ? slot.displayHour : ''}
            </div>
          ))}
        </div>
        <div className="time-header-total">
          Total Hours
        </div>
      </div>

      {/* Duty Status Rows */}
      <div className="relative">
        {/* Canvas for dynamic drawing */}
        <DutyStatusCanvas dailyLogs={dailyLogs} />

        {/* Duty Status Rows */}
        {[
          { key: 'off_duty', label: '1. Off Duty', index: 0 },
          { key: 'sleeper_berth', label: '2. Sleeper Berth', index: 1 },
          { key: 'driving', label: '3. Driving', index: 2 },
          { key: 'on_duty', label: '4. On Duty (not driving)', index: 3 }
        ].map(({ key, label }) => (
          <div key={key} className="duty-status-row flex relative">
            {/* Duty Status Label */}
            <div className="duty-status-label flex items-center z-20">
              <span className="text-sm font-medium">{label}</span>
            </div>
            
            {/* Time Slots Grid */}
            <div className="time-slots-container relative">
              {timeSlots.map((slot, slotIndex) => (
                <div
                  key={slotIndex}
                  className={`time-slot ${
                    slotIndex % 4 === 3 ? 'hour-mark' : ''
                  }`}
                  title={slot.time}
                />
              ))}
            </div>
            
            {/* Total Hours */}
            <div className="total-hours flex items-center justify-center z-20">
              <input 
                className="total-input" 
                readOnly
                value={
                  key === 'driving' ? (timelineTotals.driving || 0).toFixed(1) :
                  key === 'on_duty' ? (timelineTotals.on_duty || 0).toFixed(1) :
                  key === 'off_duty' ? (timelineTotals.off_duty || 0).toFixed(1) :
                  key === 'sleeper_berth' ? (timelineTotals.sleeper_berth || 0).toFixed(1) :
                  '0.0'
                }
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
