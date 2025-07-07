# CLF Ingestion Web API

A high-performance, scalable data ingestion service built with .NET 8, Orleans, and ASP.NET Core.

## Features

- **Orleans Integration**: Distributed, scalable architecture using Microsoft Orleans
- **Multiple Data Sources**: Support for NASA FIRMS, USGS, GDACS, Twitter, and custom data sources
- **Real-time Processing**: Stream-based data processing with Orleans Streams
- **Webhook Support**: Handle external webhooks from various data sources
- **Health Monitoring**: Built-in health checks and monitoring endpoints
- **RESTful API**: Comprehensive REST API for managing ingestion operations
- **Swagger Documentation**: Auto-generated API documentation

## Architecture

### Core Components

- **Orleans Grains**: Distributed actors for data source management
- **Adapters**: Data source-specific adapters for fetching data
- **Streams**: Orleans Streams for real-time data processing
- **Controllers**: REST API endpoints for external communication
- **Schedulers**: Background job scheduling for data polling

### Data Flow

1. **Data Source Registration**: External data sources are registered via API
2. **Grain Activation**: Orleans grains are activated for each data source
3. **Polling/Webhooks**: Data is fetched via polling or webhook events
4. **Stream Processing**: Raw data is published to Orleans streams
5. **ETL Integration**: Processed data is sent to ETL service
6. **Storage**: Final data is stored in the database

## API Endpoints

### Data Sources

- `GET /api/ingestion/sources` - Get all data sources
- `POST /api/ingestion/sources` - Register new data source
- `GET /api/ingestion/sources/{id}` - Get specific data source
- `POST /api/ingestion/sources/{id}/start` - Start polling for data source
- `POST /api/ingestion/sources/{id}/stop` - Stop polling for data source
- `GET /api/ingestion/sources/{id}/status` - Get data source status
- `POST /api/ingestion/sources/{id}/fetch` - Trigger manual fetch

### Ingestion Records

- `GET /api/ingestion/records` - Get all ingestion records (with pagination)
- `GET /api/ingestion/records/{id}` - Get specific ingestion record
- `POST /api/ingestion/records/{id}/retry` - Retry failed ingestion

### Webhooks

- `POST /api/webhook/nasa-firms` - Handle NASA FIRMS webhook
- `POST /api/webhook/usgs` - Handle USGS webhook
- `POST /api/webhook/gdacs` - Handle GDACS webhook
- `POST /api/webhook/twitter` - Handle Twitter webhook
- `POST /api/webhook/cassia-user-report` - Handle Cassia User Report webhook
- `POST /api/webhook/generic/{sourceType}` - Generic webhook handler

### Cluster Management

- `GET /api/cluster/health` - Get cluster health status
- `GET /api/cluster/grains` - Get all active grains
- `GET /api/cluster/statistics` - Get grain statistics
- `POST /api/cluster/grains/{grainType}/activate` - Activate grain
- `POST /api/cluster/grains/{grainType}/deactivate` - Deactivate grain

### Health & Monitoring

- `GET /health` - Service health check
- `GET /api/ingestion/health` - Ingestion service health

## Configuration

### appsettings.json

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Data Source=localhost;Initial Catalog=CLF_Ingestion;Integrated Security=true;TrustServerCertificate=true"
  },
  "Services": {
    "ETL": "https://localhost:5002",
    "Storage": "https://localhost:5003"
  },
  "Orleans": {
    "ClusterId": "CLF_Ingestion_Cluster",
    "ServiceId": "CLF_Ingestion_Service"
  },
  "DataSources": {
    "NasaFirms": {
      "ApiUrl": "https://firms.modaps.eosdis.nasa.gov/api/area/csv",
      "PollingInterval": "00:15:00"
    }
  }
}
```

## Getting Started

### Prerequisites

- .NET 8.0 SDK
- SQL Server (or SQLite for development)
- Visual Studio 2022 or VS Code

### Running the Service

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd CLF/CLF.Ingestion
   ```

2. **Restore dependencies**
   ```bash
   dotnet restore
   ```

3. **Update database**
   ```bash
   dotnet ef database update
   ```

4. **Run the service**
   ```bash
   dotnet run
   ```

5. **Access the API**
   - Swagger UI: http://localhost:5000
   - Health Check: http://localhost:5000/health

### Development

#### Adding a New Data Source

1. **Create Adapter**
   ```csharp
   public class NewDataSourceAdapter : IDataSourceAdapter
   {
       public async Task<List<RawData>> FetchDataAsync(ExternalDataSource source)
       {
           // Implementation
       }
   }
   ```

2. **Create Grain**
   ```csharp
   public class NewDataSourceIngestionGrain : BaseIngestionGrain
   {
       protected override IDataSourceAdapter GetAdapter()
       {
           return ServiceProvider.GetRequiredService<NewDataSourceAdapter>();
       }
   }
   ```

3. **Register Services**
   ```csharp
   builder.Services.AddHttpClient<NewDataSourceAdapter>();
   ```

4. **Add API Endpoints**
   - Add to `IngestionController.GetIngestionGrain()`
   - Add webhook endpoint to `WebhookController`

#### Testing

```bash
# Run tests
dotnet test

# Run specific test project
dotnet test CLF.Ingestion.Tests
```

## Deployment

### Docker

```dockerfile
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 80
EXPOSE 443

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["CLF.Ingestion/CLF.Ingestion.csproj", "CLF.Ingestion/"]
RUN dotnet restore "CLF.Ingestion/CLF.Ingestion.csproj"
COPY . .
WORKDIR "/src/CLF.Ingestion"
RUN dotnet build "CLF.Ingestion.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "CLF.Ingestion.csproj" -c Release -o /app/publish

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "CLF.Ingestion.dll"]
```

### Kubernetes

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: clf-ingestion
spec:
  replicas: 3
  selector:
    matchLabels:
      app: clf-ingestion
  template:
    metadata:
      labels:
        app: clf-ingestion
    spec:
      containers:
      - name: clf-ingestion
        image: clf-ingestion:latest
        ports:
        - containerPort: 80
        env:
        - name: ConnectionStrings__DefaultConnection
          valueFrom:
            secretKeyRef:
              name: clf-secrets
              key: connection-string
```

## Monitoring

### Health Checks

- Service health: `/health`
- Cluster health: `/api/cluster/health`
- Ingestion health: `/api/ingestion/health`

### Logging

Logs are configured to output to:
- Console (development)
- Debug (development)
- Structured logging with correlation IDs

### Metrics

- Orleans metrics via Orleans Dashboard
- Custom metrics for ingestion operations
- Performance counters for data processing

## Troubleshooting

### Common Issues

1. **Orleans Connection Issues**
   - Check cluster configuration
   - Verify silo ports are accessible
   - Review Orleans logs

2. **Database Connection Issues**
   - Verify connection string
   - Check SQL Server is running
   - Ensure database exists

3. **Webhook Failures**
   - Check webhook endpoint URLs
   - Verify payload format
   - Review webhook logs

### Debugging

1. **Enable Debug Logging**
   ```json
   {
     "Logging": {
       "LogLevel": {
         "CLF.Ingestion": "Debug"
       }
     }
   }
   ```

2. **Orleans Dashboard**
   - Access Orleans Dashboard for grain monitoring
   - View grain statistics and performance

3. **Stream Monitoring**
   - Monitor Orleans Streams for data flow
   - Check stream provider configuration

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 