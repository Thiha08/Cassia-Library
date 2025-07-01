# Fire Data Management System Architecture


## 1. System Overview

The Fire Data Management System provides a flexible, resilient architecture for accessing and displaying fire event data from multiple sources. The system dynamically adapts to different network conditions while maintaining a consistent API for consumers.

### Architecture Diagram

┌─────────────────────────────────────────────────────────────────┐
│                        Application Layer                        │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                       Fire Source Manager                       │
└───┬───────────────┬───────────────┬────────────────┬────────────┘
    │               │               │                │
    ▼               ▼               ▼                ▼
┌─────────┐    ┌─────────┐    ┌─────────┐      ┌─────────┐
│   API   │    │ Realtime│    │  Local  │      │ Manifest│
│ Service │    │ Service │    │ Network │      │ Service │
└────┬────┘    └────┬────┘    └────┬────┘      └────┬────┘
     │              │              │                │
     └──────────────┴──────┬───────┘                │
                           │                        │
                           ▼                        │
                     ┌───────────┐                  │
                     │  Network  │                  │
                     │ Resources │                  │
                     └───────────┘                  │
                                                    │
                                                    ▼
                                              ┌───────────┐
                                              │   Local   │
                                              │  Storage  │
                                              └───────────┘


## 2. Key Components

### 2.1 Fire Data Manager
**Purpose**: Acts as a facade and coordinator for all data sources, providing a unified API.

**Responsibilities**:
- Selects the optimal data source based on network conditions or explicit preferences
- Maintains synchronized state across active sources
- Provides a consistent reactive interface for consumers
- Manages lifecycle of underlying data sources


## 2.2 Data Sources

### 2.2.1 API Service
**Purpose**: Retrieves fire data from remote HTTP endpoints. Use Case: Primary data source when fully online with good connectivity.

### 2.2.2 Realtime Service
**Purpose**: Connects to WebSocket endpoints for live event updates. Use Case: Real-time monitoring of active fire events.

### 2.2.3 Local Network Service
**Purpose**: Discovers and connects to nearby data providers on the local network. Use Case: Field operations where internet connectivity is limited but local network is available.

### 2.2.4 Manifest Service
**Purpose**: Manages and retrieves cached data from local storage. Use Case: Offline operations or as a fallback when network resources are unavailable.


## 2.3 Support Services

### 2.3.1 Worker Service
**Purpose**: Manages Web Worker communication for CPU-intensive operations. 

**Responsibilities**:
- Parses large GeoJSON datasets
- Filters fire events by time and location
- Processes delta updates from realtime sources

### 2.3.2 Network Status Service
**Purpose**: Monitors network connectivity and conditions. 

**Responsibilities**:
- Detects online/offline status
- Identifies local network availability
- Notifies interested components of network changes


## 3. Data Flow Patterns

### 3.1 Data Acquisition Flow

1. **Request Initiation**:
  - Consumer calls refresh() on the FireDataManager
  - Manager delegates to the currently active data source

2. **Source Selection**:
  - Based on network status and configuration preferences
  - Falls back gracefully when preferred source is unavailable

3. **Data Processing Pipeline**:
  - Raw data acquired from selected source (network or cache)
  - Data processed in Web Worker (parsing, filtering)
  - Processed results pushed to reactive state via signals


### 3.2 Realtime Update Flow

1. **Connection Establishment**:
  - WebSocket connection opened to realtime endpoint
  - Message handlers configured for delta processing

2. **Event Processing**:
  - Delta events received through WebSocket
  - Updates processed by Worker Service
  - New events merged into existing dataset
  - UI reactively updates via signal mechanism


## 4. Design Principles

### 4.1 Resilience and Adaptability
- **Graceful Degradation**: System automatically falls back to available sources
- **Automatic Recovery**: Reestablishes optimal connections when conditions improve
- **Offline Capability**: Continues functioning with cached data when disconnected

### 4.2 Separation of Concerns
- **Data Acquisition**: Each source specializes in one acquisition strategy
- **Data Processing**: Offloaded to Web Workers for performance
- **State Management**: Handled through Angular signals
- **Network Management**: Abstracted through dedicated services

### 4.3 Performance Optimization
- **Background Processing**: CPU-intensive operations run in Web Workers
- **Caching Strategy**: Intelligent caching to minimize network requests
- **Granular Updates**: Realtime updates merge efficiently without full reloads

### 4.4 Maintainability
- **Consistent Patterns**: All data sources follow the same abstract interface
- **Single Responsibility**: Each component has a clear, focused purpose
- **Dependency Injection**: Services use Angular DI for loose coupling

## 5. Component Interactions

### 5.1 Source Selection Logic
The manager selects the appropriate data source using this priority order:

1. **User Preference**: If explicitly specified, use the selected source
2. **Network Availability**:
  - Online with WebSocket support → Realtime Service
  - Online with HTTP only → API Service
  - Local network only → Local Network Service
  - Offline → Manifest (Cache) Service

### 5.2 State Synchronization
- **Signal Propagation**: Each source maintains its own signal-based state
- **Effects System**: Manager uses Angular effects to synchronize state between active source and itself
- **Atomic Updates**: State changes happen atomically to prevent partial or inconsistent views

### 5.3 Error Handling Strategy
- **Multi-level Recovery**: Errors handled at source, manager, and application levels
- **Transparent Fallbacks**: Automatic source switching on critical errors
- **Error Visibility**: Error states propagated through the signal system


## 6. Benefits of the Architecture

### 6.1 Operational Benefits
- **Network Resilience**: Continues functioning across varying network conditions
- **Resource Efficiency**: Minimizes battery and data usage through intelligent source selection
- **UI Responsiveness**: Heavy processing in Web Workers keeps the UI thread free

### 6.2 Development Benefits
- **Extensibility**: New data sources can be added by implementing the common interface
- **Testability**: Clear boundaries make unit testing straightforward
- **Maintainability**: Well-defined responsibilities and interfaces


### 6.3 User Experience Benefits
- **Consistent Experience**: Application behaves predictably regardless of network conditions
- **Performance**: Responsive UI even with large datasets
- **Offline Capability**: Critical functionality available without connectivity

## 7. Conclusion
The Fire Data Management System architecture provides a robust, flexible foundation for accessing fire event data across a wide range of operational scenarios. By combining reactive programming patterns with intelligent source selection and background processing, the system delivers optimal performance while adapting to changing network conditions.
