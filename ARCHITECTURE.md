# CLF Data Pipeline Architecture

## Overview

The CLF (Cassia Library Framework) has been restructured into a microservices-based data pipeline architecture that follows clean architecture principles and enables scalable, maintainable data processing.

## Architecture Diagram

```
[ External Data Sources ] 
      |
      v
[ CLF.Gateway ] - API Gateway & Orchestration
      |
      v
[ CLF.Ingestion ] - Data Ingestion Service
      |
      v
[ Raw Data Storage (Staging) ] - CLFDbContext
      |
      v
[ CLF.ETL ] - ETL Processing Service
      |
      v
[ Clean Data Storage ] - Events, Time Series, Geo Data
      |
      v
[ CLF.Storage ] - Data Storage & Indexing Service
      |
      v
[ CLF.Orleans ] - Distributed Computing Layer
      |
      v
[ Indexing & Downstream Services ]
```

## Project Structure

### Core Projects

#### 1. **CLF.Shared** - Shared Library
- **Purpose**: Contains shared models, interfaces, and constants used across all services
- **Key Components**:
  - `Models/DataPipelineModels.cs` - Core data models for the pipeline
  - `Interfaces/IDataPipelineInterfaces.cs` - Service interfaces
  - Common enums and constants

#### 2. **CLF.Infrastructure** - Infrastructure Layer
- **Purpose**: Provides data access, messaging, and infrastructure services
- **Key Components**:
  - `Data/CLFDbContext.cs` - Entity Framework context
  - Database repositories and data access patterns
  - Message bus implementations
  - Caching services

#### 3. **CLF.Gateway** - API Gateway
- **Purpose**: Single entry point for all external requests, handles routing and orchestration
- **Port**: 5000 (default)
- **Key Features**:
  - API routing to microservices
  - Health monitoring
  - Request/response transformation
  - Authentication and authorization
  - Rate limiting

#### 4. **CLF.Ingestion** - Data Ingestion Service
- **Purpose**: Handles data extraction from external sources and initial validation
- **Port**: 5001
- **Key Features**:
  - External data source connectivity
  - Data validation
  - Raw data storage
  - ETL pipeline triggering

#### 5. **CLF.ETL** - ETL Processing Service
- **Purpose**: Transforms raw data into clean, structured data
- **Port**: 5002
- **Key Features**:
  - Data extraction from staging
  - Data transformation and normalization
  - Data loading to appropriate storage
  - Pipeline orchestration

#### 6. **CLF.Storage** - Data Storage Service
- **Purpose**: Manages different types of data storage and retrieval
- **Port**: 5003
- **Key Features**:
  - Event store management
  - Time series data storage
  - Geospatial data storage
  - Search indexing

#### 7. **CLF.Orleans** - Distributed Computing Layer
- **Purpose**: Provides distributed computing capabilities using Microsoft Orleans
- **Port**: 5004
- **Key Features**:
  - Grain-based distributed processing
  - State management
  - Real-time processing
  - SignalR integration

## Data Flow

### 1. Data Ingestion
```
External Source → CLF.Gateway → CLF.Ingestion → Raw Data Storage
```

### 2. Data Processing
```
Raw Data → CLF.ETL → Clean Data → Storage Services
```

### 3. Data Storage
```
Clean Data → Event Store | Time Series DB | Geo DB | Search Index
```

### 4. Data Access
```
Client → CLF.Gateway → CLF.Storage → Formatted Response
```

## Key Features

### Scalability
- **Horizontal Scaling**: Each service can be scaled independently
- **Load Balancing**: Gateway handles request distribution
- **Database Sharding**: Support for multiple database instances

### Reliability
- **Circuit Breaker Pattern**: Prevents cascade failures
- **Retry Mechanisms**: Automatic retry for failed operations
- **Health Monitoring**: Real-time service health checks
- **Data Validation**: Multi-layer validation throughout the pipeline

### Maintainability
- **Separation of Concerns**: Each service has a single responsibility
- **Clean Architecture**: Clear boundaries between layers
- **Dependency Injection**: Loose coupling between components
- **Comprehensive Logging**: Structured logging across all services

### Performance
- **Async/Await**: Non-blocking operations throughout
- **Caching**: Redis-based caching for frequently accessed data
- **Database Optimization**: Proper indexing and query optimization
- **Message Queuing**: Asynchronous processing where appropriate

## Technology Stack

### Backend
- **.NET 8**: Core framework
- **ASP.NET Core**: Web API framework
- **Entity Framework Core**: ORM
- **Microsoft Orleans**: Distributed computing
- **SignalR**: Real-time communication

### Data Storage
- **SQL Server**: Primary relational database
- **Redis**: Caching and session storage
- **InfluxDB**: Time series data (planned)
- **Elasticsearch**: Search and indexing (planned)
- **MongoDB**: Document storage (planned)

### Infrastructure
- **Docker**: Containerization
- **Kubernetes**: Orchestration (planned)
- **Azure/AWS**: Cloud deployment (planned)

## Getting Started

### Prerequisites
- .NET 8 SDK
- SQL Server (or LocalDB for development)
- Visual Studio 2022 or VS Code

### Running the Services

1. **Build the solution**:
   ```bash
   dotnet build
   ```

2. **Run the Gateway**:
   ```bash
   cd CLF.Gateway
   dotnet run
   ```

3. **Run the Ingestion Service**:
   ```bash
   cd CLF.Ingestion
   dotnet run
   ```

4. **Run other services** (ETL, Storage, Orleans):
   ```bash
   cd CLF.ETL
   dotnet run
   ```

### API Endpoints

#### Gateway (Port 5000)
- `GET /health` - Health check
- `GET /api/status` - Service status
- `POST /api/pipeline/ingest` - Trigger ingestion
- `GET /api/pipeline/ingest/{id}` - Get ingestion status
- `POST /api/pipeline/etl/{rawDataId}` - Trigger ETL
- `GET /api/pipeline/data/{dataType}/{id}` - Get data

#### Ingestion Service (Port 5001)
- `GET /health` - Health check
- `POST /api/ingestion/trigger` - Trigger ingestion
- `GET /api/ingestion/{id}` - Get ingestion status
- `GET /api/ingestion` - Get all ingestions
- `POST /api/ingestion/{id}/retry` - Retry failed ingestion

## Configuration

### Environment Variables
- `ConnectionStrings__DefaultConnection` - Database connection string
- `Services__Ingestion` - Ingestion service URL
- `Services__ETL` - ETL service URL
- `Services__Storage` - Storage service URL
- `Services__Orleans` - Orleans service URL

### App Settings
Each service has its own `appsettings.json` with service-specific configuration:
- Database connections
- Service URLs
- Timeouts and retry settings
- Logging configuration

## Development Guidelines

### Code Organization
- Follow clean architecture principles
- Use dependency injection
- Implement proper error handling
- Add comprehensive logging
- Write unit tests for business logic

### API Design
- Use RESTful conventions
- Implement proper HTTP status codes
- Include pagination for list endpoints
- Provide detailed error messages
- Use consistent response formats

### Database Design
- Use Entity Framework migrations
- Implement proper indexing
- Follow naming conventions
- Use appropriate data types
- Implement soft deletes where appropriate

## Monitoring and Observability

### Health Checks
- Each service exposes a `/health` endpoint
- Gateway aggregates health from all services
- Kubernetes-ready health check endpoints

### Logging
- Structured logging with Serilog (planned)
- Correlation IDs for request tracing
- Log levels: Debug, Information, Warning, Error

### Metrics
- Performance counters
- Custom business metrics
- Integration with monitoring tools (planned)

## Security

### Authentication & Authorization
- JWT token-based authentication (planned)
- Role-based access control
- API key management

### Data Protection
- Encrypted data at rest
- TLS for data in transit
- Input validation and sanitization
- SQL injection prevention

## Future Enhancements

### Planned Features
- **Message Queuing**: RabbitMQ or Azure Service Bus
- **Event Sourcing**: Complete event sourcing implementation
- **CQRS**: Command Query Responsibility Segregation
- **GraphQL**: Alternative to REST APIs
- **Real-time Analytics**: Stream processing with Apache Kafka
- **Machine Learning**: ML.NET integration for data insights

### Infrastructure Improvements
- **Kubernetes Deployment**: Container orchestration
- **Service Mesh**: Istio for service-to-service communication
- **Monitoring**: Prometheus and Grafana
- **CI/CD**: Automated deployment pipelines
- **Multi-region**: Geographic distribution

## Contributing

1. Follow the established architecture patterns
2. Add comprehensive tests for new features
3. Update documentation for API changes
4. Use conventional commit messages
5. Create feature branches for development

## Support

For questions or issues:
- Check the documentation
- Review existing issues
- Create a new issue with detailed information
- Contact the development team 