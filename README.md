# Cassia Library Framework (CLF)

A sophisticated microservices-based data pipeline framework built on .NET 8 that handles extraction, transformation, and loading of data from various external sources with distributed computing capabilities.

## 🚀 Overview

The Cassia Library Framework (CLF) is a scalable, maintainable data processing platform that follows clean architecture principles and leverages Microsoft Orleans for distributed computing. It provides a robust foundation for ingesting data from multiple external sources, transforming it, and making it available through a unified API.

## ✨ Key Features

- **Microservices Architecture**: Scalable, independent services that can be deployed and scaled individually
- **Distributed Computing**: Built on Microsoft Orleans for fault-tolerant, scalable processing
- **Multi-Source Data Ingestion**: Supports various data sources including APIs, databases, and file systems
- **Real-time Processing**: Stream processing capabilities for real-time data handling
- **Clean Architecture**: Separation of concerns with clear boundaries between layers
- **Comprehensive Monitoring**: Health checks, logging, and performance metrics
- **Flexible Storage**: Support for multiple storage types (relational, time-series, geospatial, search)

## 🏗️ Architecture

The CLF follows a microservices pattern with the following core components:

```
External Data Sources → CLF.Gateway → CLF.Ingestion → CLF.ETL → CLF.Storage → CLF.Orleans
```

### Core Services

- **CLF.Gateway** (Port 5000): API Gateway and request orchestration
- **CLF.Ingestion** (Port 5001): Data ingestion from external sources
- **CLF.ETL** (Port 5002): Extract, Transform, Load processing
- **CLF.Storage** (Port 5003): Data storage and retrieval
- **CLF.Orleans** (Port 5004): Distributed computing layer

### Supporting Libraries

- **CLF.Shared**: Common models, interfaces, and constants
- **CLF.Infrastructure**: Data access, messaging, and infrastructure services

## 🛠️ Technology Stack

- **.NET 8**: Core framework
- **ASP.NET Core**: Web API development
- **Entity Framework Core**: Object-relational mapping
- **Microsoft Orleans**: Distributed computing platform
- **SQL Server**: Primary database
- **SignalR**: Real-time communication
- **Docker**: Containerization ready

## 🚦 Quick Start

### Prerequisites

- .NET 8 SDK
- SQL Server or LocalDB
- Visual Studio 2022 or VS Code

### Getting Started

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd CLF
   ```

2. **Build the solution**
   ```bash
   dotnet build
   ```

3. **Run the services**
   ```bash
   # Start the Gateway (main entry point)
   cd CLF.Gateway
   dotnet run
   
   # In separate terminals, start other services
   cd CLF.Ingestion && dotnet run
   cd CLF.ETL && dotnet run
   cd CLF.Storage && dotnet run
   cd CLF.Orleans && dotnet run
   ```

4. **Access the API**
   - Gateway: `http://localhost:5000`
   - Health Check: `http://localhost:5000/health`
   - API Status: `http://localhost:5000/api/status`

## 📚 Data Sources

The framework supports ingestion from multiple external data sources:

- **NASA FIRMS**: Fire Information for Resource Management System
- **USGS**: US Geological Survey data
- **GDACS**: Global Disaster Alert and Coordination System
- **Twitter**: Social media monitoring
- **Cassia User Reports**: User-generated reports

## 🔧 API Endpoints

### Gateway API (Port 5000)
- `GET /health` - Health check
- `GET /api/status` - Service status
- `POST /api/pipeline/ingest` - Trigger data ingestion
- `GET /api/pipeline/ingest/{id}` - Get ingestion status
- `GET /api/pipeline/data/{dataType}/{id}` - Retrieve data

### Ingestion Service API (Port 5001)
- `POST /api/ingestion/trigger` - Trigger data ingestion
- `GET /api/ingestion/{id}` - Get specific ingestion status
- `GET /api/ingestion` - List all ingestions (paginated)
- `POST /api/ingestion/{id}/retry` - Retry failed ingestion

## 🔧 Configuration

### Environment Variables
```bash
ConnectionStrings__DefaultConnection=<database-connection-string>
Services__Ingestion=http://localhost:5001
Services__ETL=http://localhost:5002
Services__Storage=http://localhost:5003
Services__Orleans=http://localhost:5004
```

### Service Configuration
Each service has its own `appsettings.json` with:
- Database connections
- Service URLs
- Timeout and retry settings
- Logging configuration

## 🏃‍♂️ Development

### Code Organization
- Follow clean architecture principles
- Use dependency injection
- Implement comprehensive error handling
- Add structured logging
- Write unit tests for business logic

### Adding New Data Sources
1. Create a new adapter implementing `IDataSourceAdapter`
2. Add the adapter to the DI container
3. Create a corresponding Orleans grain
4. Update the ingestion service configuration

## 📈 Monitoring

- **Health Checks**: Each service exposes `/health` endpoints
- **Structured Logging**: Comprehensive logging with correlation IDs
- **Performance Metrics**: Custom business metrics and performance counters
- **Status Tracking**: Real-time ingestion and processing status monitoring

## 🔮 Future Enhancements

- **Message Queuing**: RabbitMQ or Azure Service Bus integration
- **Event Sourcing**: Complete event sourcing implementation
- **CQRS**: Command Query Responsibility Segregation
- **GraphQL**: Alternative API interface
- **Kubernetes**: Container orchestration deployment
- **Machine Learning**: ML.NET integration for data insights

## 📖 Documentation

- [Architecture Guide](./ARCHITECTURE.md) - Detailed system architecture
- [Ingestion Pipeline](./ingestion_pipeline_architecture.md) - Data ingestion specifics
- [Township Optimization](./TOWNSHIP_OPTIMIZATION_GUIDE.md) - Performance optimization guide

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Follow the established architecture patterns
4. Add comprehensive tests
5. Update documentation
6. Submit a pull request

## 🆘 Support

For questions, issues, or contributions:
- Check the [documentation](./ARCHITECTURE.md)
- Review existing issues
- Create a new issue with detailed information
- Contact the development team

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Built with ❤️ using .NET 8 and Microsoft Orleans**