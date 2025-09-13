import { Input } from '@/components/ui/input';
import { ChevronDown, ChevronRight } from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

interface HoursSummaryFormProps {
  isOpen: boolean;
  onToggle: (open: boolean) => void;
  timelineTotals: {
    off_duty: number;
    sleeper_berth: number;
    driving: number;
    on_duty: number;
  };
}

export function HoursSummaryForm({ isOpen, onToggle, timelineTotals }: HoursSummaryFormProps) {
  const totalOnDutyHours = (timelineTotals.driving || 0) + (timelineTotals.on_duty || 0);

  return (
    <Collapsible open={isOpen} onOpenChange={onToggle}>
      <CollapsibleTrigger className="flex items-center gap-2 w-full p-3 bg-gray-50 hover:bg-gray-100 rounded-lg mb-4 transition-colors">
        <span className="font-semibold text-gray-800">Driver Hours Summary</span>
        {isOpen ? (
          <ChevronDown className="h-4 w-4 text-gray-600" />
        ) : (
          <ChevronRight className="h-4 w-4 text-gray-600" />
        )}
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="border border-gray-300">
          <div className="form-grid-4 p-4">
            <div className="form-group text-center">
              <h4 className="font-semibold mb-2">On duty hours today, Total lines 3 & 4</h4>
              <Input 
                className="text-center" 
                readOnly
                value={totalOnDutyHours.toFixed(1)}
              />
            </div>
            
            <div className="form-group text-center">
              <h4 className="font-semibold mb-2">Column A</h4>
              <p className="text-sm text-gray-600 mb-2">Total hours on duty last 7 days including today</p>
              <Input className="text-center" />
            </div>
            
            <div className="form-group text-center">
              <h4 className="font-semibold mb-2">Column B</h4>
              <p className="text-sm text-gray-600 mb-2">Total hours available tomorrow 70 hr. minus A*</p>
              <Input className="text-center" />
            </div>
            
            <div className="form-group text-center">
              <h4 className="font-semibold mb-2">Column C</h4>
              <p className="text-sm text-gray-600 mb-2">Total hours on duty last 5 days including today</p>
              <Input className="text-center" />
            </div>
          </div>
          
          <div className="bg-gray-50 p-3 border-t border-gray-300">
            <p className="text-sm text-gray-600">
              *If you took 34 consecutive hours off duty you have 60/70 hours available
            </p>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
