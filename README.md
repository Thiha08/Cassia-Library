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

The CLF follows a microservices pattern with both backend services and a modern frontend application:

```
CLF.App (Angular Client) ↔ CLF.Gateway → CLF.Ingestion → CLF.ETL → CLF.Storage → CLF.Orleans
                                ↑
                        External Data Sources
```

### Backend Services

- **CLF.Gateway** (Port 5000): API Gateway and request orchestration
- **CLF.Ingestion** (Port 5001): Data ingestion from external sources
- **CLF.ETL** (Port 5002): Extract, Transform, Load processing
- **CLF.Storage** (Port 5003): Data storage and retrieval
- **CLF.Orleans** (Port 5004): Distributed computing layer

### Frontend Application

- **CLF.App**: Modern Angular 19 Progressive Web App with advanced visualization capabilities

### Supporting Libraries

- **CLF.Shared**: Common models, interfaces, and constants
- **CLF.Infrastructure**: Data access, messaging, and infrastructure services

## 🛠️ Technology Stack

### Backend
- **.NET 8**: Core framework
- **ASP.NET Core**: Web API development
- **Entity Framework Core**: Object-relational mapping
- **Microsoft Orleans**: Distributed computing platform
- **SQL Server**: Primary database
- **SignalR**: Real-time communication
- **Docker**: Containerization ready

### Frontend
- **Angular 19**: Modern web application framework
- **Angular Material**: Material Design components
- **TypeScript**: Type-safe JavaScript
- **RxJS**: Reactive programming
- **OpenLayers**: Advanced mapping and GIS visualization
- **ApexCharts**: Interactive charts and graphs
- **Progressive Web App (PWA)**: Offline capabilities and mobile-first design

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

### Client Application Setup

1. **Navigate to the client directory**
   ```bash
   cd clf.app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Access the application**
   - Client App: `https://localhost:4200`
   - Login with your credentials to access the dashboard

## 🖥️ CLF.App - Frontend Application

The CLF.App is a sophisticated Angular-based Progressive Web Application that provides a comprehensive interface for managing and visualizing data from the CLF pipeline.

### Key Features

#### 📊 **Advanced Dashboards**
- **Multiple Dashboard Views**: Two specialized dashboard layouts for different data perspectives
- **Real-time Data Visualization**: Live updates of ingestion status and pipeline metrics
- **Interactive Charts**: ApexCharts integration for dynamic data visualization
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices

#### 🗺️ **Geospatial Visualization**
- **7 Specialized Mapboards**: Different analytical views for geospatial data
- **OpenLayers Integration**: Advanced mapping capabilities with multiple layer support
- **Real-time Data Overlays**: Live visualization of NASA FIRMS, USGS, and GDACS data
- **Interactive Map Controls**: Zoom, pan, layer management, and data filtering

#### 📱 **Progressive Web App (PWA)**
- **Offline Capabilities**: Continue working even without internet connection
- **Push Notifications**: Real-time alerts for data pipeline events
- **Mobile-First Design**: Optimized for mobile devices and tablets
- **App-like Experience**: Install directly on devices like a native app

#### 🔐 **Security & Authentication**
- **User Authentication**: Secure login and session management
- **Role-Based Access Control**: Different permissions for different user types
- **Protected Routes**: Secure access to sensitive data and administrative functions

#### 🛠️ **Application Modules**
- **Data Management**: Tables and forms for managing ingested data
- **Task Management**: Kanban boards and task tracking for pipeline operations
- **Calendar Integration**: Schedule and track data ingestion jobs
- **Contact Management**: User and stakeholder management
- **Reporting**: Generate and export reports on data pipeline performance

#### 📈 **Monitoring & Analytics**
- **Real-time Status Monitoring**: Live pipeline health and performance metrics
- **Data Quality Metrics**: Validation results and data integrity reports
- **Performance Analytics**: Ingestion rates, processing times, and error rates
- **Custom Widgets**: Configurable dashboard widgets for specific metrics

### Application Structure

```
clf.app/
├── src/
│   ├── app/
│   │   ├── pages/
│   │   │   ├── dashboards/     # Main dashboard views
│   │   │   ├── mapboards/      # Geospatial visualization
│   │   │   ├── apps/           # Application modules
│   │   │   ├── charts/         # Chart components
│   │   │   ├── forms/          # Data input forms
│   │   │   ├── tables/         # Data tables
│   │   │   └── authentication/ # User authentication
│   │   ├── services/           # API services
│   │   ├── components/         # Reusable UI components
│   │   └── layouts/            # Application layouts
│   └── assets/                 # Static assets
└── package.json               # Dependencies and scripts
```

### Available Views

- **Main Dashboard**: Overview of entire data pipeline status
- **Mapboard I-VII**: Specialized analytical mapping views
- **Data Tables**: Tabular view of ingested and processed data
- **Charts & Analytics**: Visual representation of pipeline metrics
- **Forms**: Configuration and data input interfaces
- **Task Management**: Pipeline job scheduling and monitoring
- **User Management**: Authentication and user administration

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