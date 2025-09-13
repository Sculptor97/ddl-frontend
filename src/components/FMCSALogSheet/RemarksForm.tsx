import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ChevronDown, ChevronRight } from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

interface RemarksFormProps {
  isOpen: boolean;
  onToggle: (open: boolean) => void;
  tripData?: {
    fromLocation?: string;
    toLocation?: string;
    totalDistance?: number;
    totalDuration?: number;
  };
}

export function RemarksForm({ isOpen, onToggle, tripData }: RemarksFormProps) {
  const remarksDefaultValue = tripData ? 
    `Trip Details:\n` +
    `From: ${tripData.fromLocation || 'N/A'}\n` +
    `To: ${tripData.toLocation || 'N/A'}\n` +
    `Total Distance: ${tripData.totalDistance?.toFixed(1) || 'N/A'} miles\n` +
    `Total Duration: ${tripData.totalDuration?.toFixed(1) || 'N/A'} hours\n` +
    `\nAdditional Notes:\n` : 
    '';

  return (
    <Collapsible open={isOpen} onOpenChange={onToggle}>
      <CollapsibleTrigger className="flex items-center gap-2 w-full p-3 bg-gray-50 hover:bg-gray-100 rounded-lg mb-4 transition-colors">
        <span className="font-semibold text-gray-800">Remarks and Shipping Documents</span>
        {isOpen ? (
          <ChevronDown className="h-4 w-4 text-gray-600" />
        ) : (
          <ChevronRight className="h-4 w-4 text-gray-600" />
        )}
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="form-group">
            <Label htmlFor="remarks">Remarks:</Label>
            <Textarea 
              id="remarks" 
              className="h-32" 
              placeholder="Enter any additional notes or comments..."
              defaultValue={remarksDefaultValue}
            />
          </div>
          
          <div>
            <div className="form-group">
              <Label htmlFor="dvlNumber">DVL or Manifest No.:</Label>
              <Input id="dvlNumber" />
            </div>
            <div className="text-center text-sm text-gray-500 mb-4">or</div>
            <div className="form-group">
              <Label htmlFor="shipperCommodity">Shipper & Commodity:</Label>
              <Input id="shipperCommodity" />
            </div>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
