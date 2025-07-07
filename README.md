# Cassia Library Framework (CLF)

A sophisticated microservices-based data pipeline framework built on .NET 8 that handles extraction, transformation, and loading of data from various external sources with distributed computing capabilities.

## 🚀 Overview

The Cassia Library Framework (CLF) is a scalable, maintainable data processing platform that follows clean architecture principles and leverages Microsoft Orleans for distributed computing. It provides a robust foundation for ingesting data from multiple external sources, transforming it, and making it available through a unified API.

## � Project Story: Building Technology for Humanitarian Impact

Cassia Map is a humanitarian geospatial platform developed under the Cassia Library initiative, designed to provide real-time disaster awareness and location-based insights for communities across Myanmar. As Lead Developer, the system was built to turn raw event data into clear, accessible, and life-saving information during times of crisis.

The platform streams up-to-date data on natural hazards such as floods, cyclones, earthquakes, and fires—aggregating from multiple open and trusted sources. Using scalable cloud-native architecture and AI-assisted enrichment, Cassia Map processes and visualizes this information on an interactive map interface that supports time filtering, historical timelines, and geospatial overlays.

One of the platform's core goals is accessibility. Cassia Map is optimized for low-connectivity environments and mobile devices, with a roadmap that includes offline-first PWA support and multilingual AI chat assistance to help users understand risk in real time. The backend combines a geospatial event pipeline with a resilient, maintainable architecture designed to scale as user needs grow.

This project represents the first major layer of the broader Cassia Library ecosystem—a knowledge and resource platform focused on safety, education, and practical guidance during emergencies. It reflects a commitment to building reliable, human-centered systems that serve those most in need, using technology as a force for preparedness, understanding, and support.

## �🌍 Mission: Cassia Map - Humanitarian Geospatial Platform

**Cassia Map** is a humanitarian geospatial platform developed under the Cassia Library initiative, designed to provide real-time disaster awareness and location-based insights for communities across Myanmar. Built to turn raw event data into clear, accessible, and life-saving information during times of crisis.

### 🎯 **Transforming Data into Life-Saving Information**
The platform streams up-to-date data on natural hazards such as **floods, cyclones, earthquakes, and fires**—aggregating from multiple open and trusted sources. Using scalable cloud-native architecture and AI-assisted enrichment, Cassia Map processes and visualizes this information on an interactive map interface that supports time filtering, historical timelines, and geospatial overlays.

### 🌐 **Accessibility as a Core Goal**
One of the platform's core goals is accessibility. Cassia Map is optimized for low-connectivity environments and mobile devices, with a roadmap that includes:
- **Offline-first PWA support** for areas with limited internet access
- **Multilingual AI chat assistance** to help users understand risk in real-time
- **Mobile-optimized interfaces** designed for widespread smartphone access
- **Low-bandwidth optimization** ensuring critical information reaches those who need it most

### 🏗️ **Resilient Technical Architecture**
The backend combines a geospatial event pipeline with a resilient, maintainable architecture designed to scale as user needs grow. The CLF framework provides:
- **Real-time data ingestion** from multiple international disaster monitoring sources
- **AI-assisted data enrichment** for enhanced situational awareness
- **Scalable cloud-native infrastructure** that maintains performance under load
- **High availability design** ensuring access during critical emergency periods

### � **Vision: Technology as a Force for Good**
This project represents the first major layer of the broader **Cassia Library ecosystem**—a knowledge and resource platform focused on safety, education, and practical guidance during emergencies. It reflects a commitment to building reliable, human-centered systems that serve those most in need, using technology as a force for preparedness, understanding, and support.

**The Cassia Library Framework transforms complex technical capabilities into simple, accessible tools that keep communities safe. Every architectural decision, every line of code, and every feature serves the ultimate goal of protecting human life and empowering communities with the information they need to stay safe.**

## ✨ Key Features

### 🛡️ **Humanitarian-Focused Capabilities**
- **Real-time Disaster Monitoring**: Live tracking of floods, cyclones, earthquakes, and fires
- **Multi-Source Intelligence**: Aggregates data from NASA FIRMS, USGS, GDACS, and social media
- **Crisis-Ready Architecture**: High availability and reliability during emergency situations
- **Accessibility-First Design**: Optimized for low-connectivity and mobile environments
- **Community Safety**: Location-based insights and risk assessment for vulnerable populations

### ⚙️ **Technical Excellence**
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

### 🌍 **Humanitarian Features**
- **Multilingual AI Chat**: Real-time risk assessment and guidance in local languages
- **Offline-First PWA**: Complete offline functionality for disconnected environments
- **Community Reporting**: User-generated incident reports and community alerts
- **Predictive Analytics**: AI-powered early warning systems for disaster prediction
- **Mobile SMS Integration**: Critical alerts via SMS for areas without internet access

### 🛠️ **Technical Improvements**
- **Message Queuing**: RabbitMQ or Azure Service Bus integration
- **Event Sourcing**: Complete event sourcing implementation
- **CQRS**: Command Query Responsibility Segregation
- **GraphQL**: Alternative API interface
- **Kubernetes**: Container orchestration deployment
- **Machine Learning**: ML.NET integration for enhanced data insights

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

This project serves humanitarian purposes and community safety. For questions, issues, or contributions:

### 🤝 **For Developers & Contributors**
- Check the [documentation](./ARCHITECTURE.md)
- Review existing issues and feature requests
- Create a new issue with detailed information
- Contact the development team for collaboration opportunities

### 🌍 **For Humanitarian Organizations**
- Partnership opportunities for data sharing and integration
- Implementation support for other regions and communities
- Training and capacity building for local teams
- Custom deployment assistance for specific needs

### 🚨 **For Emergency Responders**
- Direct API access for emergency management systems
- Real-time data feeds for crisis response coordination
- Integration support for existing emergency response platforms

**This platform is built to save lives and serve communities in need. We welcome all contributions that advance this mission.**

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

**Built with ❤️ for humanitarian impact using .NET 8, Microsoft Orleans, and Angular 19**  
*"Technology serving humanity, one community at a time"*