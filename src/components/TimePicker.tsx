import { useState, useRef, useEffect } from 'react';
import { Clock, ChevronUp, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

// Hide scrollbar styles
const scrollbarHideStyle = {
  scrollbarWidth: 'none' as const,
  msOverflowStyle: 'none' as const,
};

// Add CSS for webkit browsers
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    .time-picker-scroll::-webkit-scrollbar {
      display: none;
    }
  `;
  document.head.appendChild(style);
}

interface TimePickerProps {
  value: string;
  onChange: (time: string) => void;
  className?: string;
  placeholder?: string;
}

export function TimePicker({ value, onChange, className, placeholder = "Select time..." }: TimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hours, setHours] = useState(8);
  const [minutes, setMinutes] = useState(0);
  const timePickerRef = useRef<HTMLDivElement>(null);

  // Parse initial value
  useEffect(() => {
    if (value) {
      const [h, m] = value.split(':').map(Number);
      setHours(h || 8);
      setMinutes(m || 0);
    }
  }, [value]);

  // Close picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (timePickerRef.current && !timePickerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleTimeChange = (newHours: number, newMinutes: number) => {
    setHours(newHours);
    setMinutes(newMinutes);
    const timeString = `${newHours.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')}`;
    onChange(timeString);
  };

  const formatDisplayTime = () => {
    if (!value) return placeholder;
    const [h, m] = value.split(':');
    const hour = parseInt(h);
    const minute = parseInt(m);
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`;
  };

  const generateTimeOptions = (type: 'hours' | 'minutes') => {
    if (type === 'hours') {
      return Array.from({ length: 24 }, (_, i) => i);
    } else {
      return Array.from({ length: 60 }, (_, i) => i);
    }
  };

  const scrollToValue = (container: HTMLDivElement, value: number) => {
    const itemHeight = 40;
    const scrollTop = value * itemHeight;
    container.scrollTop = scrollTop;
  };

  return (
    <div className={cn("relative", className)} ref={timePickerRef}>
      <div
        className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm ring-offset-background cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 flex items-center justify-between"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={cn(
          "text-sm",
          !value && "text-muted-foreground"
        )}>
          {formatDisplayTime()}
        </span>
        <Clock className="h-4 w-4 text-muted-foreground" />
      </div>

      {isOpen && (
        <div className="absolute z-50 mt-1 bg-white border border-gray-200 rounded-md shadow-lg p-3">
          <div className="flex items-center gap-4">
            {/* Hours */}
            <div className="flex flex-col items-center">
              <label className="text-xs font-medium text-gray-600 mb-2">Hour</label>
              <div className="relative">
                <div className="w-16 h-32 overflow-y-auto border border-gray-200 rounded-md bg-white time-picker-scroll" style={scrollbarHideStyle}>
                  {generateTimeOptions('hours').map((hour) => (
                    <div
                      key={hour}
                      className={cn(
                        "h-10 flex items-center justify-center cursor-pointer text-sm hover:bg-gray-100",
                        hour === hours && "bg-blue-100 text-blue-600 font-medium"
                      )}
                      onClick={() => handleTimeChange(hour, minutes)}
                    >
                      {hour.toString().padStart(2, '0')}
                    </div>
                  ))}
                </div>
                <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-white to-transparent pointer-events-none" />
                <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white to-transparent pointer-events-none" />
              </div>
            </div>

            {/* Separator */}
            <div className="flex items-center h-32">
              <span className="text-lg font-bold text-gray-400">:</span>
            </div>

            {/* Minutes */}
            <div className="flex flex-col items-center">
              <label className="text-xs font-medium text-gray-600 mb-2">Min</label>
              <div className="relative">
                <div className="w-16 h-32 overflow-y-auto border border-gray-200 rounded-md bg-white time-picker-scroll" style={scrollbarHideStyle}>
                  {generateTimeOptions('minutes').map((minute) => (
                    <div
                      key={minute}
                      className={cn(
                        "h-10 flex items-center justify-center cursor-pointer text-sm hover:bg-gray-100",
                        minute === minutes && "bg-blue-100 text-blue-600 font-medium"
                      )}
                      onClick={() => handleTimeChange(hours, minute)}
                    >
                      {minute.toString().padStart(2, '0')}
                    </div>
                  ))}
                </div>
                <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-white to-transparent pointer-events-none" />
                <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white to-transparent pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Quick time buttons */}
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: '6 AM', time: '06:00' },
                { label: '8 AM', time: '08:00' },
                { label: '12 PM', time: '12:00' },
                { label: '2 PM', time: '14:00' },
                { label: '6 PM', time: '18:00' },
                { label: '8 PM', time: '20:00' }
              ].map(({ label, time }) => (
                <button
                  key={time}
                  type="button"
                  className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded text-gray-700"
                  onClick={() => {
                    const [h, m] = time.split(':').map(Number);
                    handleTimeChange(h, m);
                    setIsOpen(false);
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}