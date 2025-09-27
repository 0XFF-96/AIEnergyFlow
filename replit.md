# Energy Management Dashboard

## Overview

This is an AI-powered energy management dashboard for microgrid monitoring and anomaly detection. The application provides real-time monitoring of energy consumption, solar generation, battery storage, and grid interactions through an intuitive web interface. It features automated anomaly detection using OpenAI's API, comprehensive alerting systems, and detailed reporting capabilities for utility-focused environments.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
The frontend is built using React with TypeScript and utilizes a modern component-based architecture:
- **Framework**: React 18 with TypeScript for type safety
- **UI Library**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design system inspired by Grafana dashboards
- **State Management**: TanStack Query for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Build Tool**: Vite for fast development and optimized builds

### Backend Architecture
The backend follows a REST API pattern with Express.js:
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Structure**: RESTful endpoints for energy metrics, alerts, and anomaly data
- **Data Simulation**: Built-in energy simulator for generating realistic test data
- **Error Handling**: Centralized error handling with structured logging

### Data Storage Solutions
The application uses a dual-storage approach:
- **Primary Database**: PostgreSQL with Drizzle ORM for production data persistence
- **Development Storage**: In-memory storage implementation for development and testing
- **Database Schema**: Time-series optimized tables for energy metrics, anomalies, alerts, and daily reports
- **Migration Management**: Drizzle Kit for schema migrations and database management

### AI Integration
AI-powered anomaly detection is implemented through OpenAI's API:
- **Model**: GPT-5 for advanced pattern recognition in energy data
- **Hybrid Approach**: Combines rule-based anomaly detection with AI-powered pattern analysis
- **Fallback System**: Rule-based detection serves as backup when AI service is unavailable
- **Anomaly Scoring**: Confidence-based scoring system (0-1 scale) with severity classification

### Design System
The application implements a comprehensive design system:
- **Color Scheme**: Dark mode primary with teal/aqua accent colors (#00E0A1, #77E6F5)
- **Typography**: Inter for UI elements, Roboto Mono for data displays
- **Component Library**: Consistent spacing using Tailwind's 4px unit system
- **Responsive Design**: Mobile-first approach with grid-based layouts

## External Dependencies

### Core Services
- **OpenAI API**: AI-powered anomaly detection and pattern analysis
- **Neon Database**: Serverless PostgreSQL hosting for production data storage

### Development Tools
- **Replit Integration**: Native Replit development environment support with error handling and debugging
- **Vite Plugins**: Development banner, cartographer for navigation, and runtime error overlay

### UI Libraries
- **Radix UI**: Accessible component primitives for complex UI interactions
- **Recharts**: Data visualization library for energy consumption charts and graphs
- **Lucide React**: Icon library for consistent iconography throughout the application

### Data Management
- **Drizzle ORM**: Type-safe database queries and schema management
- **Zod**: Runtime type validation for API inputs and database schemas
- **Date-fns**: Date manipulation and formatting utilities

### Development Dependencies
- **TypeScript**: Static type checking across the entire codebase
- **Tailwind CSS**: Utility-first CSS framework with custom configuration
- **PostCSS**: CSS processing with autoprefixer for browser compatibility