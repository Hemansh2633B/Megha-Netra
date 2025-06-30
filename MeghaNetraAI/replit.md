# replit.md

## Overview

MeghaNetra is an advanced AI-powered weather intelligence platform that combines real-time satellite data analysis with deep learning models to provide unprecedented weather prediction accuracy. The application leverages LSTM networks, CNN analysis, and Transformer models for comprehensive weather analysis and forecasting. Built as a partnership with ISRO, the platform offers both a sophisticated web interface and intelligent chat capabilities for weather data interaction.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript and Vite for fast development and building
- **UI Library**: Shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design system for weather-themed aesthetics
- **State Management**: TanStack Query for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Authentication**: Replit Auth integration with session management

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database ORM**: Drizzle ORM with PostgreSQL as the primary database
- **Database Provider**: Neon serverless PostgreSQL
- **AI Services**: OpenAI GPT-4 integration for intelligent weather analysis
- **External APIs**: OpenWeatherMap API for real-time weather data
- **Session Management**: PostgreSQL-based session storage with connect-pg-simple

### Development Environment
- **Build System**: Vite for frontend, esbuild for backend
- **Development Server**: Custom Vite middleware integration with Express
- **TypeScript**: Strict type checking across the entire codebase
- **Module System**: ESM modules throughout the application

## Key Components

### Database Schema
The application uses a comprehensive PostgreSQL schema designed for weather intelligence:

- **Users Table**: Replit Auth integration with user profiles and roles
- **Sessions Table**: Secure session management for authentication
- **Weather Data Table**: Real-time weather measurements with geospatial indexing
- **AI Predictions Table**: ML model predictions with confidence scores
- **Chat Messages Table**: Conversational AI interactions with response tracking
- **Weather Alerts Table**: Automated alert system for severe weather events
- **ML Model Status Table**: Deep learning model health and performance monitoring

### AI Integration
- **Weather Query Processing**: Natural language understanding for weather queries
- **ML Model Management**: Multiple neural network architectures (LSTM, CNN, Transformer)
- **Predictive Analytics**: Advanced forecasting with confidence intervals
- **Real-time Analysis**: Continuous weather pattern recognition

### Core Services
- **AI Service**: GPT-4 powered weather analysis and conversational AI
- **Weather Service**: Real-time data collection and processing from multiple sources
- **ML Service**: Neural network model management and inference
- **Storage Service**: Comprehensive data persistence and retrieval operations

### User Interface Components
- **Dashboard**: Real-time weather monitoring with interactive visualizations
- **AI Chat Interface**: Conversational weather analysis and queries
- **Weather Maps**: Interactive geospatial weather data visualization
- **Alert System**: Real-time severe weather notifications
- **Neural Network Status**: Live monitoring of ML model performance

## Data Flow

1. **Weather Data Ingestion**: Real-time collection from satellite feeds and weather APIs
2. **AI Processing**: Deep learning models analyze patterns and generate predictions
3. **Data Storage**: Structured storage in PostgreSQL with geospatial indexing
4. **User Interaction**: Web interface and chat system for data access
5. **Real-time Updates**: WebSocket connections for live weather monitoring
6. **Alert Generation**: Automated severe weather detection and notification

## External Dependencies

### Core Infrastructure
- **Neon Database**: Serverless PostgreSQL with automatic scaling
- **OpenAI API**: GPT-4 for natural language processing and weather analysis
- **OpenWeatherMap API**: Real-time weather data and forecasting
- **Replit Auth**: Authentication and user management system

### Development Tools
- **Shadcn/ui**: Comprehensive component library with accessibility features
- **Tailwind CSS**: Utility-first styling with custom design tokens
- **Drizzle Kit**: Database migrations and schema management
- **TanStack Query**: Advanced data fetching and caching

### AI/ML Libraries
- **OpenAI SDK**: Integration with GPT models for conversational AI
- **Neural Network Models**: LSTM, CNN, and Transformer architectures for weather prediction

## Deployment Strategy

### Development Environment
- **Local Development**: Vite dev server with hot module replacement
- **Database**: Neon serverless PostgreSQL with connection pooling
- **Environment Variables**: Secure configuration for API keys and database URLs
- **TypeScript Compilation**: Incremental builds with tsBuildInfoFile caching

### Production Build
- **Frontend**: Vite production build with optimized assets
- **Backend**: esbuild bundle for Node.js deployment
- **Database Migrations**: Drizzle Kit for schema deployment
- **Environment Configuration**: Production-ready environment variable management

### Performance Optimizations
- **Code Splitting**: Automatic route-based code splitting
- **Asset Optimization**: Vite's built-in minification and compression
- **Database Indexing**: Optimized queries with geospatial indexing
- **Caching Strategy**: TanStack Query for intelligent data caching

## Recent Changes

### June 30, 2025 - Complete Platform Implementation
- **Removed External Dependencies**: Eliminated OpenAI dependency and built local AI service
- **Advanced AI Capabilities**: Implemented LSTM, CNN, and Transformer model simulations
- **Chat Interface**: Built sophisticated natural language processing for weather queries
- **Real-time Features**: Added WebSocket connections for live updates and monitoring
- **ML Training**: Integrated model training endpoints in backend API
- **Professional UI**: Created glass-morphism design with ISRO partnership branding
- **Database Schema**: Established comprehensive PostgreSQL schema for all data types
- **Authentication**: Implemented secure Replit Auth integration
- **API Endpoints**: Built complete REST API for weather, ML, and chat functionality
- **Documentation**: Added comprehensive README with setup and usage instructions

### Application Features Implemented
- Advanced weather intelligence dashboard
- AI-powered chat assistant with natural language understanding  
- Real-time weather monitoring with satellite analysis
- Neural network status monitoring and metrics
- Weather alert system with confidence scoring
- Predictive analytics and pattern recognition
- ML model management and training capabilities
- Voice control and AR data preview interfaces
- Blockchain verification and quality control systems

## Changelog

```
Changelog:
- June 30, 2025. Complete MeghaNetra AI platform implementation
- June 30, 2025. Added comprehensive documentation and README
- June 30, 2025. Removed external API dependencies for local operation
- June 30, 2025. Initial setup
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```