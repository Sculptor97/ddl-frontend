import { Textarea } from '@/components/ui/textarea';
import { ChevronDown, ChevronRight } from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import type { DailyLog } from '@/lib/types/api';

interface RecapFormProps {
  isOpen: boolean;
  onToggle: (open: boolean) => void;
  dailyLogs: DailyLog[];
}

export function RecapForm({ isOpen, onToggle, dailyLogs }: RecapFormProps) {
  const recapDefaultValue = dailyLogs.length > 0 ? 
    dailyLogs.map((log, dayIndex) => {
      const date = new Date(log.date).toLocaleDateString();
      const entries = log.entries.map(entry => 
        `${entry.start_time} - ${entry.end_time}: ${entry.status.replace('_', ' ').toUpperCase()} at ${entry.location}`
      ).join('\n');
      return `Day ${dayIndex + 1} (${date}):\n${entries}`;
    }).join('\n\n') :
    '';

  return (
    <Collapsible open={isOpen} onOpenChange={onToggle}>
      <CollapsibleTrigger className="flex items-center gap-2 w-full p-3 bg-gray-50 hover:bg-gray-100 rounded-lg mb-4 transition-colors">
        <span className="font-semibold text-gray-800">Recap: Complete at end of day</span>
        {isOpen ? (
          <ChevronDown className="h-4 w-4 text-gray-600" />
        ) : (
          <ChevronRight className="h-4 w-4 text-gray-600" />
        )}
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="mb-6">
          <p className="text-sm text-gray-600 mb-4">
            Enter name of place you reported and where released from work and when and where each change of duty occurred. Use time standard of home terminal.
          </p>
          <div className="form-group">
            <Textarea 
              className="h-24" 
              placeholder="Enter recap information..."
              defaultValue={recapDefaultValue}
            />
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
