# Mapbox Setup Guide

## Getting Started with Mapbox

### 1. Create a Mapbox Account
1. Go to [https://account.mapbox.com/](https://account.mapbox.com/)
2. Sign up for a free account
3. Verify your email address

### 2. Get Your Access Token
1. Log into your Mapbox account
2. Go to the [Access Tokens page](https://account.mapbox.com/access-tokens/)
3. Copy your default public token or create a new one
4. Make sure the following APIs are enabled:
   - **Maps API** - For displaying maps
   - **Geocoding API** - For address-to-coordinates conversion
   - **Directions API** - For route planning (if needed)

### 3. Configure Your Environment
Create a `.env` file in the `react-ts` directory with the following content:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:8000/api

# Mapbox Configuration
VITE_MAPBOX_ACCESS_TOKEN=your_actual_token_here

# Development Configuration
VITE_APP_ENV=development
```

Replace `your_actual_token_here` with your actual Mapbox access token.

### 4. API Usage Limits
- **Free Tier**: 50,000 map loads per month
- **Geocoding**: 100,000 requests per month
- **Directions**: 100,000 requests per month

### 5. Security Best Practices
- Never commit your access token to version control
- Use environment variables for all sensitive data
- Consider using scoped tokens for production
- Monitor your API usage in the Mapbox dashboard

### 6. Troubleshooting

#### Common Issues:
1. **"Invalid access token" error**
   - Verify your token is correct
   - Check that the token has the required API permissions

2. **"Geocoding API error"**
   - Ensure Geocoding API is enabled for your token
   - Check your API usage limits

3. **Maps not loading**
   - Verify Maps API is enabled
   - Check your internet connection
   - Ensure the token is properly set in environment variables

### 7. Production Deployment
For production deployment:
1. Create a new scoped token with only required permissions
2. Set up proper environment variables on your hosting platform
3. Monitor API usage and costs
4. Consider upgrading to a paid plan if needed

## Features Enabled

With proper Mapbox setup, you'll have access to:

- ✅ **Interactive Maps** - Professional map visualization
- ✅ **Address Autocomplete** - Real-time address suggestions
- ✅ **Geocoding** - Convert addresses to coordinates
- ✅ **Route Visualization** - Display trip routes on maps
- ✅ **Custom Markers** - Waypoint markers with popups
- ✅ **Responsive Design** - Maps that work on all devices
