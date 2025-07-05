# CLF Ingestion Data Pipeline - Backend Architecture

## Overview

The CLF (Cassia Library Framework) ingestion data pipeline is a sophisticated microservices-based architecture built on .NET 8 that handles the extraction, transformation, and loading of data from various external sources. The system follows clean architecture principles and leverages Microsoft Orleans for distributed computing.

## Architecture Components

### 1. **CLF.Gateway** (Port 5000)
- **Role**: API Gateway and Request Orchestration
- **Purpose**: Single entry point for all external requests
- **Key Features**:
  - Routes requests to appropriate microservices
  - Handles authentication and authorization
  - Provides health monitoring and rate limiting
  - Manages request/response transformation

### 2. **CLF.Ingestion** (Port 5001)
- **Role**: Data Ingestion Service
- **Purpose**: Handles data extraction from external sources and initial validation
- **Key Components**:
  - **Controllers**: `IngestionController` - REST API endpoints for triggering and monitoring ingestion
  - **Adapters**: Source-specific adapters for different data providers
  - **Grains**: Orleans-based distributed processing units
  - **Schedulers**: Automated polling and ingestion scheduling

#### Ingestion Data Flow:
```
External Data Source → Adapter → BaseIngestionGrain → Raw Data Storage → ETL Trigger
```

### 3. **CLF.ETL** (Port 5002)
- **Role**: Extract, Transform, Load Service
- **Purpose**: Transforms raw data into clean, structured data
- **Status**: Currently in development (basic template implemented)

### 4. **CLF.Storage** (Port 5003)
- **Role**: Data Storage and Retrieval Service
- **Purpose**: Manages different types of data storage
- **Planned Features**:
  - Event store management
  - Time series data storage
  - Geospatial data storage
  - Search indexing

### 5. **CLF.Orleans** (Port 5004)
- **Role**: Distributed Computing Layer
- **Purpose**: Provides scalable, fault-tolerant distributed processing
- **Features**:
  - Grain-based actor model
  - Stream processing for real-time data
  - Automatic state management
  - Built-in clustering and load balancing

## Data Models and Storage

### Core Data Entities

#### 1. **ExternalDataSource**
- Configuration for external data providers
- Contains connection strings, API keys, and polling intervals
- Supports multiple source types (API, Database, File, etc.)

#### 2. **RawData** (Staging Layer)
- Stores unprocessed data from external sources
- Contains source metadata and ingestion status
- Supports retry mechanisms for failed ingestions

#### 3. **CleanData** (Processed Layer)
- Stores validated and transformed data
- Contains processing status and validation results
- Links back to original raw data for traceability

#### 4. **Specialized Data Types**:
- **EventData**: Event sourcing support
- **TimeSeriesData**: Time-based metrics and measurements
- **GeoData**: Geospatial information with coordinates and properties

### Database Context (CLFDbContext)
- Entity Framework Core with SQL Server
- Optimized indexing for time-series and geospatial queries
- JSON serialization for flexible metadata storage
- Proper relationships and constraints

## Data Source Integration

### Adapter Pattern Implementation

Each external data source has a dedicated adapter implementing `IDataSourceAdapter`:

```csharp
public interface IDataSourceAdapter
{
    string SourceName { get; }
    string SourceType { get; }
    Task<List<RawData>> FetchDataAsync(ExternalDataSource source);
    Task<bool> ValidateConnectionAsync(ExternalDataSource source);
}
```

### Currently Implemented Adapters:
1. **NasaFirmsAdapter** - NASA Fire Information for Resource Management System
2. **USGSAdapter** - US Geological Survey data
3. **GDACSAdapter** - Global Disaster Alert and Coordination System
4. **TwitterAdapter** - Social media monitoring
5. **CassiaUserReportAdapter** - User-generated reports

### NASA FIRMS Example:
- Fetches satellite-based fire detection data
- Parses CSV format from NASA API
- Handles API key authentication
- Converts to structured JSON format

## Distributed Processing with Orleans

### Grain Architecture

#### **BaseIngestionGrain**
- Abstract base class for all ingestion grains
- Provides common functionality:
  - Polling mechanism with configurable intervals
  - Webhook processing capabilities
  - Orleans stream integration
  - Error handling and retry logic
  - Status tracking and monitoring

#### **Specialized Grains**:
- **NasaFirmsIngestionGrain**
- **USGSIngestionGrain**
- **GDACSIngestionGrain**
- **TwitterIngestionGrain**
- **CassiaUserReportIngestionGrain**

### Orleans Streams
- Real-time data streaming between grains
- Asynchronous processing pipeline
- Automatic backpressure handling
- Persistent stream storage

## API Endpoints

### Ingestion Service API:
```
POST /api/ingestion/trigger    - Trigger data ingestion
GET  /api/ingestion/{id}       - Get ingestion status
GET  /api/ingestion           - List all ingestions (paginated)
POST /api/ingestion/{id}/retry - Retry failed ingestion
GET  /health                  - Health check
```

### Data Processing Flow:
1. **Trigger Ingestion**: External request or scheduled polling
2. **Data Extraction**: Adapter fetches data from source
3. **Validation**: Raw data validation and error handling
4. **Storage**: Store in staging database (RawData)
5. **ETL Trigger**: Automatically trigger transformation
6. **Processing**: ETL service transforms data
7. **Clean Storage**: Store processed data (CleanData)
8. **Indexing**: Update search indices and downstream services

## Scheduling and Automation

### IngestionScheduler
- Orleans-based reminder system
- Configurable polling intervals per data source
- Automatic retry mechanisms for failed ingestions
- Distributed scheduling across cluster nodes

### Polling Configuration:
- Default: 5-minute intervals
- Configurable per data source
- Adaptive scheduling based on data availability
- Circuit breaker pattern for failing sources

## Technology Stack

### Core Technologies:
- **.NET 8**: Primary framework
- **ASP.NET Core**: Web API development
- **Entity Framework Core**: ORM and database access
- **Microsoft Orleans**: Distributed computing
- **SQL Server**: Primary data storage
- **SignalR**: Real-time communication (planned)

### Data Processing:
- **JSON Serialization**: Flexible metadata storage
- **CSV Parsing**: External data format handling
- **HTTP Clients**: External API integration
- **Stream Processing**: Real-time data handling

## Key Design Patterns

### 1. **Adapter Pattern**
- Abstracts different data source integrations
- Consistent interface for all external sources
- Easy to add new data sources

### 2. **Actor Model (Orleans Grains)**
- Distributed processing units
- Automatic state management
- Fault tolerance and recovery

### 3. **Repository Pattern**
- Data access abstraction
- Testable database operations
- Consistent data access patterns

### 4. **Circuit Breaker Pattern**
- Prevents cascade failures
- Automatic retry mechanisms
- Graceful degradation

## Error Handling and Monitoring

### Error Handling:
- Comprehensive logging at all levels
- Structured error messages
- Retry mechanisms with exponential backoff
- Dead letter queues for failed messages

### Status Tracking:
- Real-time ingestion status monitoring
- Pipeline execution tracking
- Performance metrics collection
- Health check endpoints

## Future Enhancements

### Planned Features:
1. **Message Queuing**: RabbitMQ or Azure Service Bus
2. **Caching Layer**: Redis for frequently accessed data
3. **Event Sourcing**: Complete event sourcing implementation
4. **Real-time Analytics**: Stream processing capabilities
5. **Machine Learning**: ML.NET integration for data insights

### Infrastructure Improvements:
1. **Containerization**: Docker containers
2. **Orchestration**: Kubernetes deployment
3. **Monitoring**: Prometheus and Grafana
4. **CI/CD**: Automated deployment pipelines

## Configuration and Environment

### Service Configuration:
- Environment-specific settings
- Service discovery URLs
- Database connection strings
- External API credentials

### Development Setup:
- In-memory database for local development
- Swagger/OpenAPI documentation
- Comprehensive logging
- Health check endpoints

This architecture provides a robust, scalable foundation for ingesting data from multiple external sources while maintaining clean separation of concerns and supporting future growth and complexity.