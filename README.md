# DDL Backend - React Frontend

A comprehensive Driver's Daily Log (DDL) application built with React, TypeScript, and modern mapping technologies.

## Features

- **Smart Address Input**: Type addresses instead of coordinates with real-time autocomplete
- **Interactive Route Planning**: Plan trips with HOS compliance using Mapbox GL JS
- **FMCSA Log Sheets**: Generate compliant log sheets with dynamic canvas drawing
- **PDF Export**: Download log sheets as PDFs using react-to-pdf
- **Spatial Analysis**: Advanced route calculations using Turf.js
- **Date/Time Management**: User-friendly date picker for trip scheduling
- **Real-time HOS Compliance**: Validate hours of service regulations
- **Geocoding Integration**: Automatic address-to-coordinates conversion using Mapbox

## Technology Stack

### Frontend
- **React 19** with TypeScript
- **react-map-gl** - Mapbox GL JS integration
- **@turf/turf** - Spatial analysis and calculations
- **react-to-pdf** - PDF generation from React components
- **react-datepicker** - Date and time input components
- **HTML Canvas** - Dynamic drawing for log sheets
- **Tailwind CSS** - Styling and responsive design
- **Vite** - Build tool and development server

### Backend
- **Django REST Framework** - API backend
- **PostgreSQL/SQLite** - Database
- **OpenRouteService** - Route calculation
- **Custom HOS Scheduler** - Hours of service compliance

## Installation

### Prerequisites
- Node.js 18+ and npm
- Python 3.9+ and pip
- Mapbox account and access token

### Frontend Setup

1. Install dependencies:
```bash
npm install
```

2. Create environment file:
```bash
cp .env.example .env
```

3. Configure environment variables:
```env
VITE_API_BASE_URL=http://localhost:8000/api
VITE_MAPBOX_ACCESS_TOKEN=your_mapbox_access_token_here
```

4. Start development server:
```bash
npm run dev
```

### Backend Setup

1. Install Python dependencies:
```bash
pip install -r requirements.txt
```

2. Run migrations:
```bash
python manage.py migrate
```

3. Start Django server:
```bash
python manage.py runserver
```

## Usage

### Trip Planning

1. **Enter Trip Details**:
   - Current location address (with autocomplete)
   - Pickup location address (with autocomplete)
   - Dropoff location address (with autocomplete)
   - Optional: Driver ID and current cycle hours
   - Optional: Start date and time

2. **View Route**:
   - Interactive map with route visualization
   - Waypoint markers with custom icons
   - Route statistics and cost estimates

3. **HOS Compliance**:
   - Automatic HOS schedule generation
   - Compliance validation and warnings
   - Daily log breakdown

4. **Export Log Sheets**:
   - Download FMCSA-compliant log sheets as PDF
   - Canvas-drawn duty status bars
   - Complete trip documentation

### API Endpoints

- `POST /api/plan-trip/` - Plan a trip with HOS compliance
- `GET /api/drivers/` - Get all drivers
- `GET /api/drivers/{id}/logs/` - Get driver HOS logs

## Component Architecture

### Core Components

- **TripPlanner**: Main dashboard component
- **TripForm**: Trip input form with address autocomplete and date picker
- **AddressInput**: Smart address input with Mapbox geocoding
- **MapView**: Interactive map using react-map-gl
- **FMCSALogSheet**: Log sheet with canvas drawing and PDF export
- **RouteInfo**: Route statistics and HOS compliance display

### Utilities

- **spatialAnalysis.ts**: Turf.js integration for route calculations
- **geocoding.ts**: Mapbox Geocoding API integration for address conversion
- **mapbox.ts**: Mapbox configuration and settings
- **tripPlanner.ts**: API client for backend communication

## Key Features

### Mapbox Integration
- Interactive route visualization
- Custom markers for waypoints
- Responsive map controls
- Route optimization
- Address autocomplete and geocoding
- Real-time address suggestions

### Canvas Drawing
- Dynamic duty status bars
- FMCSA-compliant color coding
- Real-time log sheet updates
- High-resolution PDF export

### Spatial Analysis
- Route distance calculations
- Rest stop optimization
- Multi-day trip segmentation
- HOS compliance validation

### PDF Generation
- High-quality log sheet export
- Canvas drawing preservation
- Professional formatting
- Compliance-ready documents

## Development

### Project Structure
```
src/
├── components/          # React components
├── lib/
│   ├── api/            # API client
│   ├── config/         # Configuration
│   ├── types/          # TypeScript types
│   └── utils/          # Utility functions
├── pages/              # Page components
└── styles/             # CSS and styling
```

### Code Style
- TypeScript for type safety
- ESLint for code quality
- Prettier for formatting
- Component-based architecture

## Deployment

### Frontend
```bash
npm run build
```

### Backend
```bash
python manage.py collectstatic
python manage.py migrate
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please open an issue in the repository.