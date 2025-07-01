# Fire Events API

A comprehensive ASP.NET Core Web API for managing fire events at the township level using Orleans grains for distributed state management and SignalR for real-time updates.

## Features

- **Township-level Fire Event Management**: Each township has its own Orleans grain for managing fire events
- **Real-time Updates**: SignalR hub for live fire event notifications
- **Comprehensive Filtering**: Support for date ranges, status, intensity, and geographic bounding boxes
- **RESTful API**: Full CRUD operations for fire events
- **Swagger Documentation**: Auto-generated API documentation
- **CORS Support**: Cross-origin resource sharing enabled for web applications

## Architecture

### Orleans Grains
- **ITownshipFireGrain**: Interface for township-level fire event management
- **TownshipFireGrain**: Implementation with persistent state storage
- **TownshipFireState**: State model for storing fire events

### SignalR Hub
- **FireHub**: Real-time communication hub for fire event updates
- **Geographic Groups**: Support for region-based subscriptions
- **Global Monitoring**: Worldwide fire event monitoring

### API Controllers
- **FireEventsController**: Main REST API for fire event operations

## API Endpoints

### 1. Get Active Townships Today
```
GET /api/fire-events/townships/active-today
```
Returns all townships that have fire events today.

### 2. Get Fire Events by Township
```
GET /api/fire-events/township/{township}
```
Get fire events for a specific township with optional filters:
- `fromDate`: Start date filter
- `toDate`: End date filter  
- `status`: Status filter (active, contained, resolved)
- `minIntensity`: Minimum intensity filter
- `maxIntensity`: Maximum intensity filter

### 3. Get Fire Events by Multiple Townships
```
GET /api/fire-events/townships?townships=Springfield,Riverside,Oakland
```
Get fire events for multiple townships with the same filtering options.

### 4. Get Fire Events by Bounding Box
```
GET /api/fire-events/bbox?minLon=-120&minLat=25&maxLon=-60&maxLat=55
```
Get fire events within a geographic bounding box with optional filters.

### 5. Get Township Summary
```
GET /api/fire-events/township/{township}/summary
```
Get a summary of fire events for a specific township.

### 6. Add Fire Event
```
POST /api/fire-events/township/{township}
```
Add a new fire event to a township.

### 7. Update Fire Event
```
PUT /api/fire-events/township/{township}/event/{eventId}
```
Update an existing fire event.

### 8. Remove Fire Event
```
DELETE /api/fire-events/township/{township}/event/{eventId}
```
Remove a fire event from a township.

### 9. Health Check
```
GET /api/fire-events/health
```
Check the health status of the API.

## SignalR Hub Endpoints

### Connection
```
/hubs/fire
```

### Methods
- `JoinGroup(groupName)`: Join a geographic group
- `LeaveGroup(groupName)`: Leave a geographic group
- `JoinGlobalFireMonitoring()`: Join global fire monitoring
- `LeaveGlobalFireMonitoring()`: Leave global fire monitoring
- `GetCurrentFireData(bbox)`: Get current fire data for an area
- `GetCurrentEvents(params)`: Get current events with parameters

### Events
- `FireEventReceived`: Fired when a new fire event is received
- `FireBatch`: Fired when a batch of fire events is received

## Data Models

### FireEvent
```json
{
  "id": "string",
  "type": "Feature",
  "township": "string",
  "geometry": {
    "type": "Point",
    "coordinates": [longitude, latitude]
  },
  "properties": {
    "name": "string",
    "description": "string",
    "timestamp": "datetime",
    "intensity": "number",
    "status": "string",
    "temperature": "number",
    "humidity": "number",
    "windSpeed": "number",
    "windDirection": "string",
    "weatherCondition": "string",
    "fireType": "string",
    "areaAffected": "number",
    "severity": "string",
    "source": "string",
    "confidence": "string",
    "satellite": "string",
    "algorithm": "string",
    "brightness": "number",
    "frp": "number",
    "dayNight": "string",
    "country": "string",
    "state": "string",
    "county": "string",
    "city": "string",
    "riskLevel": "string"
  },
  "source": "string"
}
```

### TownshipFireSummary
```json
{
  "township": "string",
  "eventCount": "number",
  "lastEventTime": "datetime",
  "averageIntensity": "number",
  "mostSevereStatus": "string"
}
```

### FireEventResponse
```json
{
  "events": "FireEvent[]",
  "totalCount": "number",
  "queryTime": "datetime",
  "queryId": "string"
}
```

## Getting Started

### Prerequisites
- .NET 8.0 SDK
- Visual Studio 2022 or VS Code

### Running the Application

1. **Build the project**:
   ```bash
   dotnet build
   ```

2. **Run the application**:
   ```bash
   dotnet run
   ```

3. **Access the API**:
   - API Base URL: `https://localhost:7001`
   - Swagger UI: `https://localhost:7001/swagger`
   - SignalR Hub: `https://localhost:7001/hubs/fire`

### Testing the API

Use the provided `CLF.Server.http` file in Visual Studio or VS Code to test the API endpoints. The file contains examples for all major operations.

## Configuration

### Orleans Configuration
The application uses Orleans with localhost clustering and in-memory storage for development. For production, you would configure:
- Database storage (SQL Server, PostgreSQL)
- Clustering (Azure, AWS, or custom)
- Logging and monitoring

### SignalR Configuration
- Maximum message size: 100KB
- Detailed errors enabled in development
- CORS configured for web applications

## Development Notes

### Mock Data
The application includes a seed service that generates mock fire event data for testing purposes. This data is automatically created when the application starts.

### Error Handling
All endpoints include comprehensive error handling with appropriate HTTP status codes and detailed error messages.

### Logging
The application uses structured logging with Serilog for detailed operation tracking.

## Integration with Angular Services

This API is designed to work seamlessly with the Angular services:
- `FireSourceApiService`: For REST API calls
- `FireSourceRealtimeService`: For SignalR real-time updates

The API endpoints match the expected interfaces in the Angular services, providing a complete backend solution for the fire monitoring application. 