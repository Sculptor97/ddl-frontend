# FMCSA Log Sheet Components

This directory contains the refactored FMCSA Log Sheet components, broken down by separation of concerns for better maintainability and reusability.

## Component Structure

### Main Component
- **`FMCSALogSheet.tsx`** - Main orchestrating component that combines all sub-components

### Sub-Components

#### Form Components
- **`TripInformationForm.tsx`** - Handles trip origin and destination information
- **`VehicleCarrierForm.tsx`** - Manages vehicle and carrier details, mileage information
- **`RemarksForm.tsx`** - Remarks and shipping documents section
- **`RecapForm.tsx`** - End-of-day recap with auto-populated duty status timeline
- **`HoursSummaryForm.tsx`** - Driver hours summary with FMCSA compliance calculations

#### Timeline Components
- **`DutyStatusTimeline.tsx`** - 24-hour duty status grid with time slots and totals
- **`DutyStatusCanvas.tsx`** - Canvas drawing logic for duty status visualization

#### Utility Components
- **`PDFDownloadButton.tsx`** - PDF generation and download functionality
- **`index.ts`** - Barrel export for all components

## Key Features

### Auto-Population
- Form fields are automatically populated from backend trip data
- Location information extracted from daily log entries
- Distance and duration calculations from route data
- Duty status timeline auto-generated from log entries

### Separation of Concerns
- Each component handles a specific section of the log sheet
- Canvas drawing logic isolated from form logic
- PDF generation separated from main component
- State management centralized in main component

### Reusability
- Components can be used independently
- Props-based configuration for different use cases
- Consistent styling and behavior across components

## Usage

```tsx
import { FMCSALogSheet } from '@/components/FMCSALogSheet';

<FMCSALogSheet
  dailyLogs={dailyLogs}
  carrierName="ABC Trucking"
  vehicleNumber="TRK-001"
  tripData={{
    fromLocation: "New York, NY",
    toLocation: "Los Angeles, CA",
    totalDistance: 2800,
    totalDuration: 45.5
  }}
/>
```

## Props Interface

### FMCSALogSheetProps
- `dailyLogs: DailyLog[]` - Array of daily log entries
- `carrierName?: string` - Name of the carrier
- `vehicleNumber?: string` - Vehicle identification
- `date?: string` - Log sheet date
- `tripData?: TripData` - Additional trip information for auto-population

### TripData Interface
- `fromLocation?: string` - Trip origin
- `toLocation?: string` - Trip destination
- `totalDistance?: number` - Total trip distance in miles
- `totalDuration?: number` - Total trip duration in hours
- `totalMilesDriving?: number` - Miles driven today
- `mainOfficeAddress?: string` - Main office address
- `homeTerminalAddress?: string` - Home terminal address

## Benefits of Refactoring

1. **Maintainability** - Smaller, focused components are easier to maintain
2. **Testability** - Individual components can be tested in isolation
3. **Reusability** - Components can be reused in different contexts
4. **Performance** - Better code splitting and lazy loading opportunities
5. **Developer Experience** - Clearer code organization and easier debugging
