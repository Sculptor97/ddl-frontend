import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AddressInput } from './AddressInput';
import { TimePicker } from './TimePicker';
import { tripPlannerApi } from '@/lib/api/tripPlanner';
import type { TripPlanRequest, TripPlanResponse } from '@/lib/types/api';
import { MapPin, Navigation, Truck, Clock, Calendar, Route } from 'lucide-react';
import toast from 'react-hot-toast';
import { AxiosError } from 'axios';
import { DayPicker } from 'react-day-picker';
import { format } from 'date-fns';
import 'react-day-picker/dist/style.css';
import './DatePicker.css';

const tripFormSchema = z.object({
  current_address: z.string().min(1, 'Current address is required'),
  pickup_address: z.string().min(1, 'Pickup address is required'),
  dropoff_address: z.string().min(1, 'Dropoff address is required'),
  driver_id: z.string().optional(),
  current_cycle_used_hours: z.string().optional(),
  start_date: z.date().optional(),
  start_time: z.string().optional(),
});

type TripFormData = z.infer<typeof tripFormSchema>;

interface TripFormProps {
  onTripPlanned: (data: TripPlanResponse) => void;
  onError: (error: string) => void;
  onLoading: (loading: boolean) => void;
  onCoordinatesChange: (coordinates: {
    current: [number, number] | null;
    pickup: [number, number] | null;
    dropoff: [number, number] | null;
  }) => void;
  onAddressesChange?: (addresses: {
    current: string;
    pickup: string;
    dropoff: string;
  }) => void;
}

interface AddressData {
  address: string;
  coordinates?: [number, number];
}

export function TripForm({ onTripPlanned, onError, onLoading, onCoordinatesChange, onAddressesChange }: TripFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [startDate, setStartDate] = useState<Date | null>(new Date());
  const [startTime, setStartTime] = useState<string>('08:00');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const datePickerRef = useRef<HTMLDivElement>(null);
  
  // Address data with coordinates
  const [addressData, setAddressData] = useState<{
    current: AddressData;
    pickup: AddressData;
    dropoff: AddressData;
  }>({
    current: { address: '' },
    pickup: { address: '' },
    dropoff: { address: '' }
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    clearErrors,
  } = useForm<TripFormData>({
    resolver: zodResolver(tripFormSchema),
  });

  // Close date picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setShowDatePicker(false);
      }
    };

    if (showDatePicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDatePicker]);

  const handleAddressChange = (
    type: 'current' | 'pickup' | 'dropoff',
    address: string,
    coordinates?: [number, number]
  ) => {
    console.log('Address change:', { type, address, coordinates });
    setAddressData(prev => ({
      ...prev,
      [type]: { address, coordinates }
    }));

    // Update form values
    setValue(`${type}_address` as keyof TripFormData, address);
    
    // Clear any existing errors for this field
    clearErrors(`${type}_address` as keyof TripFormData);

    // Notify parent component of coordinate changes
    const newCoordinates = {
      current: type === 'current' ? coordinates || null : addressData.current.coordinates || null,
      pickup: type === 'pickup' ? coordinates || null : addressData.pickup.coordinates || null,
      dropoff: type === 'dropoff' ? coordinates || null : addressData.dropoff.coordinates || null,
    };
    onCoordinatesChange(newCoordinates);

    // Notify parent component of address changes
    if (onAddressesChange) {
      const newAddresses = {
        current: type === 'current' ? address : addressData.current.address,
        pickup: type === 'pickup' ? address : addressData.pickup.address,
        dropoff: type === 'dropoff' ? address : addressData.dropoff.address,
      };
      onAddressesChange(newAddresses);
    }
  };

  const onSubmit = async (data: TripFormData) => {
    setIsSubmitting(true);
    onLoading(true);

    try {
      // Validate that all addresses have coordinates
      const missingCoordinates = [];
      if (!addressData.current.coordinates) missingCoordinates.push('Current location');
      if (!addressData.pickup.coordinates) missingCoordinates.push('Pickup location');
      if (!addressData.dropoff.coordinates) missingCoordinates.push('Dropoff location');

      if (missingCoordinates.length > 0) {
        throw new Error(`Please select valid addresses for: ${missingCoordinates.join(', ')}`);
      }

      const requestData: TripPlanRequest = {
        current_location: addressData.current.coordinates!,
        pickup: addressData.pickup.coordinates!,
        dropoff: addressData.dropoff.coordinates!,
      };

      // Add optional fields if provided
      if (data.driver_id) {
        requestData.driver_id = parseInt(data.driver_id);
      }
      if (data.current_cycle_used_hours) {
        requestData.current_cycle_used_hours = parseFloat(data.current_cycle_used_hours);
      }
      if (startDate) {
        requestData.start_date = startDate.toISOString();
      }
      if (startTime) {
        requestData.start_time = startTime;
      }

      const response = await tripPlannerApi.planTrip(requestData);
      
      if (!response) {
        throw new Error('No response received from server');
      }
      
      console.log('TripForm received API response:', response);
      console.log('Response daily_logs:', response.daily_logs);
      
      onTripPlanned(response);
      toast.success('Trip planned successfully!');
    } catch (error: any) {
      console.error('TripForm error:', error);
      
      let errorMessage = 'Failed to plan trip';
      
      // Handle different error types
      if (error?.error) {
        // Error from our API client (has error property)
        errorMessage = error.error;
      } else if (error instanceof AxiosError && error.response?.data?.error) {
        // Direct Axios error with backend error message
        errorMessage = error.response.data.error;
      } else if (error instanceof AxiosError && error.response?.data?.message) {
        // Direct Axios error with backend message
        errorMessage = error.response.data.message;
      } else if (error.message) {
        // Generic error with message
        errorMessage = error.message;
      }
      
      console.log('Extracted error message:', errorMessage);
      onError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
      onLoading(false);
    }
  };

  const handleReset = () => {
    reset();
    setStartDate(new Date());
    setStartTime('08:00');
    setShowDatePicker(false);
    setAddressData({
      current: { address: '' },
      pickup: { address: '' },
      dropoff: { address: '' }
    });
    onError('');
  };

  const handleDateChange = (date: Date | null) => {
    setStartDate(date);
    if (date) {
      setValue('start_date', date);
    }
  };

  const handleTimeChange = (time: string) => {
    setStartTime(time);
    setValue('start_time', time);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Trip Timing */}
      <Card className="border-brand-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm text-brand-primary">
            <Calendar className="h-4 w-4" />
            Trip Timing
          </CardTitle>
          <CardDescription className="text-xs">
            Set the start date and time for your trip
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2 relative" ref={datePickerRef}>
              <label className="text-sm font-medium">Start Date</label>
              <div className="relative">
                <input
                  type="text"
                  value={startDate ? format(startDate, 'MMM dd, yyyy') : ''}
                  onClick={() => setShowDatePicker(!showDatePicker)}
                  readOnly
                  placeholder="Select date..."
                  className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm ring-offset-background cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                />
                <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              </div>
              
              {showDatePicker && (
                <div className="absolute z-50 mt-1 bg-white border border-gray-200 rounded-md shadow-lg">
                  <DayPicker
                    mode="single"
                    selected={startDate || undefined}
                    onSelect={(date) => {
                      handleDateChange(date || null);
                      setShowDatePicker(false);
                    }}
                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                    className="p-3"
                  />
                </div>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Start Time</label>
              <TimePicker
                value={startTime}
                onChange={handleTimeChange}
                placeholder="Select start time..."
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Location */}
      <Card className="border-brand-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm text-brand-primary">
            <Navigation className="h-4 w-4" />
            Current Location
          </CardTitle>
          <CardDescription className="text-xs">
            Where are you starting from?
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AddressInput
            label="Current Address"
            placeholder="Enter your current location..."
            value={addressData.current.address}
            onChange={(address, coordinates) => handleAddressChange('current', address, coordinates)}
            error={errors.current_address?.message}
            required
          />
          {addressData.current.coordinates && (
            <div className="mt-2 text-xs text-muted-foreground">
              <Route className="h-3 w-3 inline mr-1" />
              Coordinates: {addressData.current.coordinates[1].toFixed(6)}, {addressData.current.coordinates[0].toFixed(6)}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pickup Location */}
      <Card className="border-brand-secondary/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm text-brand-secondary">
            <MapPin className="h-4 w-4" />
            Pickup Location
          </CardTitle>
          <CardDescription className="text-xs">
            Where will you pick up the load?
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AddressInput
            label="Pickup Address"
            placeholder="Enter pickup location..."
            value={addressData.pickup.address}
            onChange={(address, coordinates) => handleAddressChange('pickup', address, coordinates)}
            error={errors.pickup_address?.message}
            required
          />
          {addressData.pickup.coordinates && (
            <div className="mt-2 text-xs text-muted-foreground">
              <Route className="h-3 w-3 inline mr-1" />
              Coordinates: {addressData.pickup.coordinates[1].toFixed(6)}, {addressData.pickup.coordinates[0].toFixed(6)}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dropoff Location */}
      <Card className="border-brand-accent/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm text-brand-accent">
            <Truck className="h-4 w-4" />
            Dropoff Location
          </CardTitle>
          <CardDescription className="text-xs">
            Where will you deliver the load?
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AddressInput
            label="Dropoff Address"
            placeholder="Enter dropoff location..."
            value={addressData.dropoff.address}
            onChange={(address, coordinates) => handleAddressChange('dropoff', address, coordinates)}
            error={errors.dropoff_address?.message}
            required
          />
          {addressData.dropoff.coordinates && (
            <div className="mt-2 text-xs text-muted-foreground">
              <Route className="h-3 w-3 inline mr-1" />
              Coordinates: {addressData.dropoff.coordinates[1].toFixed(6)}, {addressData.dropoff.coordinates[0].toFixed(6)}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Optional Fields */}
      <Card className="border-muted">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            Optional Information
          </CardTitle>
          <CardDescription className="text-xs">
            Driver ID and current cycle hours for HOS tracking
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Driver ID</label>
              <input
                type="number"
                placeholder="123"
                {...register('driver_id')}
                className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Current Cycle Hours</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="70"
                placeholder="0.0"
                {...register('current_cycle_used_hours')}
                className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4">
        <Button
          type="submit"
          disabled={isSubmitting || !addressData.current.coordinates || !addressData.pickup.coordinates || !addressData.dropoff.coordinates}
          className="flex-1 bg-brand-primary hover:bg-brand-primary/90 text-white"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Planning Trip...
            </>
          ) : (
            <>
              <MapPin className="h-4 w-4 mr-2" />
              Plan Trip
            </>
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={handleReset}
          disabled={isSubmitting}
        >
          Reset
        </Button>
      </div>

      {/* Validation Status */}
      {addressData.current.coordinates && addressData.pickup.coordinates && addressData.dropoff.coordinates && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-md">
          <div className="flex items-center gap-2 text-green-700">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm font-medium">All locations validated and ready for trip planning</span>
          </div>
        </div>
      )}
    </form>
  );
}