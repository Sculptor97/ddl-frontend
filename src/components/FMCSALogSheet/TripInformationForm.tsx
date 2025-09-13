import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ChevronDown, ChevronRight } from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

interface TripInformationFormProps {
  isOpen: boolean;
  onToggle: (open: boolean) => void;
  fromLocation?: string;
  toLocation?: string;
}

export function TripInformationForm({ 
  isOpen, 
  onToggle, 
  fromLocation = '', 
  toLocation = '' 
}: TripInformationFormProps) {
  return (
    <Collapsible open={isOpen} onOpenChange={onToggle}>
      <CollapsibleTrigger className="flex items-center gap-2 w-full p-3 bg-gray-50 hover:bg-gray-100 rounded-lg mb-4 transition-colors">
        <span className="font-semibold text-gray-800">Trip Information</span>
        {isOpen ? (
          <ChevronDown className="h-4 w-4 text-gray-600" />
        ) : (
          <ChevronRight className="h-4 w-4 text-gray-600" />
        )}
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="form-grid-2 mb-6">
          <div className="form-group">
            <Label htmlFor="from">From:</Label>
            <Input 
              id="from" 
              placeholder="Origin location" 
              defaultValue={fromLocation}
            />
          </div>
          <div className="form-group">
            <Label htmlFor="to">To:</Label>
            <Input 
              id="to" 
              placeholder="Destination location" 
              defaultValue={toLocation}
            />
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
