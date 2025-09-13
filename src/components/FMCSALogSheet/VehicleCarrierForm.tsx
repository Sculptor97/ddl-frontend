import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ChevronDown, ChevronRight } from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

interface VehicleCarrierFormProps {
  isOpen: boolean;
  onToggle: (open: boolean) => void;
  carrierName?: string;
  vehicleNumber?: string;
  totalMilesDriving?: number;
  totalDistance?: number;
  mainOfficeAddress?: string;
  homeTerminalAddress?: string;
}

export function VehicleCarrierForm({ 
  isOpen, 
  onToggle, 
  carrierName = '', 
  vehicleNumber = '',
  totalMilesDriving,
  totalDistance,
  mainOfficeAddress = '',
  homeTerminalAddress = ''
}: VehicleCarrierFormProps) {
  return (
    <Collapsible open={isOpen} onOpenChange={onToggle}>
      <CollapsibleTrigger className="flex items-center gap-2 w-full p-3 bg-gray-50 hover:bg-gray-100 rounded-lg mb-4 transition-colors">
        <span className="font-semibold text-gray-800">Vehicle and Carrier Information</span>
        {isOpen ? (
          <ChevronDown className="h-4 w-4 text-gray-600" />
        ) : (
          <ChevronRight className="h-4 w-4 text-gray-600" />
        )}
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <div className="form-grid-2 mb-4">
              <div className="form-group">
                <Label htmlFor="totalMilesDriving">Total Miles Driving Today:</Label>
                <Input 
                  id="totalMilesDriving" 
                  type="number" 
                  defaultValue={totalMilesDriving?.toFixed(1) || ''}
                  placeholder="0.0"
                />
              </div>
              <div className="form-group">
                <Label htmlFor="totalMileage">Total Mileage Today:</Label>
                <Input 
                  id="totalMileage" 
                  type="number" 
                  defaultValue={totalDistance?.toFixed(1) || ''}
                  placeholder="0.0"
                />
              </div>
            </div>
            
            <div className="form-group">
              <Label htmlFor="carrierName">Name of Carrier or Carriers:</Label>
              <Input id="carrierName" defaultValue={carrierName} />
            </div>
            
            <div className="form-group">
              <Label htmlFor="mainOffice">Main Office Address:</Label>
              <Input 
                id="mainOffice" 
                defaultValue={mainOfficeAddress}
                placeholder="Enter main office address"
              />
            </div>
            
            <div className="form-group">
              <Label htmlFor="homeTerminal">Home Terminal Address:</Label>
              <Input 
                id="homeTerminal" 
                defaultValue={homeTerminalAddress}
                placeholder="Enter home terminal address"
              />
            </div>
          </div>
          
          <div className="form-group">
            <Label htmlFor="vehicleNumber">Truck/Tractor and Trailer Numbers or License Plate[s]/State:</Label>
            <Input id="vehicleNumber" defaultValue={vehicleNumber} />
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
