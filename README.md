# AI Energy Management System

<div align="center">

![AI Energy Management](https://img.shields.io/badge/AI-Energy%20Management-00E0A1?style=for-the-badge&logo=lightning&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![OpenAI](https://img.shields.io/badge/OpenAI-412991?style=for-the-badge&logo=openai&logoColor=white)

**Intelligent microgrid monitoring and optimization platform powered by AI**

[🚀 Quick Start](#-quick-start) • [📊 Features](#-features) • [🏗️ Architecture](#️-architecture) • [📚 Documentation](#-documentation)

</div>

## 🎯 Overview

The AI Energy Management System is a comprehensive platform designed for real-time monitoring, intelligent anomaly detection, and optimization of microgrid energy systems. Built with modern web technologies and powered by OpenAI GPT-5, it provides actionable insights for energy efficiency improvements.

### Key Capabilities
- 🔋 **Real-time Energy Monitoring** - Live tracking of consumption, generation, and storage
- 🤖 **AI-Powered Anomaly Detection** - Intelligent pattern analysis and alert generation  
- 📊 **Advanced Data Visualization** - Interactive charts and KPI dashboards
- 🚨 **Smart Alert System** - Context-aware notifications with severity levels
- 💡 **Automated Insights** - AI-generated recommendations and daily reports

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- OpenAI API key

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/AIEnergyFlow/ai-energy-management.git
cd ai-energy-management
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
# Create .env file
cp .env.example .env

# Configure required variables
OPENAI_API_KEY=your_openai_api_key_here
DATABASE_URL=postgresql://user:password@host:port/database
NODE_ENV=development
PORT=5000
```

4. **Initialize the database**
```bash
npm run db:push
```

5. **Start the development server**
```bash
npm run dev
```

6. **Access the application**
- Frontend: http://localhost:5000
- API: http://localhost:5000/api

## 📊 Features

### Real-time Monitoring
- **Live Energy Metrics**: Consumption, generation, storage, and efficiency tracking
- **System Health**: Component status monitoring (solar panels, battery, grid)
- **Performance KPIs**: Key performance indicators with trend analysis
- **Data Visualization**: Interactive charts with 24-hour energy overview

### AI-Powered Analytics
- **Anomaly Detection**: Automatic identification of unusual energy patterns
- **Pattern Recognition**: Machine learning-based trend analysis
- **Predictive Insights**: Forecasting potential issues and opportunities
- **Smart Recommendations**: AI-generated optimization suggestions

### Alert Management
- **Intelligent Alerts**: Context-aware notifications with severity levels
- **Alert Types**: Consumption spikes, generation drops, storage critical, device faults
- **Resolution Tracking**: Automated status updates and resolution monitoring
- **Notification System**: In-app alerts with actionable buttons

### System Administration
- **Data Simulation**: Generate realistic test data for development
- **Anomaly Testing**: Simulate various anomaly scenarios
- **System Initialization**: One-click setup with sample data
- **Health Monitoring**: Comprehensive system status indicators

## 🏗️ Architecture

### Technology Stack
```
Frontend: React 18 + TypeScript + Vite
├── UI Framework: Tailwind CSS + shadcn/ui
├── State Management: React Query
├── Routing: Wouter
└── Charts: Recharts

Backend: Node.js + Express + TypeScript
├── Database: PostgreSQL + Drizzle ORM
├── AI Integration: OpenAI GPT-5
├── Real-time: WebSocket support
└── Validation: Zod schemas

Infrastructure:
├── Containerization: Docker
├── Environment: Multi-environment support
└── Monitoring: Health check endpoints
```

### Project Structure
```
ai-energy-management/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── lib/          # Utility functions
│   │   └── ui/           # Reusable UI primitives
├── server/               # Express backend
│   ├── routes.ts         # API endpoints
│   ├── storage.ts         # Database operations
│   ├── ai-service.ts     # AI/ML logic
│   └── index.ts          # Server setup
├── shared/               # Shared code
│   └── schema.ts         # Types and validation
└── docs/                 # Documentation
```

## 🔧 Development

### Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run check        # TypeScript type checking
npm run db:push      # Push database schema changes
```

### Development Guidelines
- **Modular Architecture**: Each file focuses on a single responsibility
- **TypeScript First**: Strict typing with comprehensive type definitions
- **Component Design**: Maximum 200 lines per component file
- **API Design**: RESTful endpoints with consistent error handling
- **Testing**: Unit tests for utilities, integration tests for APIs

### Code Quality
- **ESLint**: Code linting and style enforcement
- **Prettier**: Code formatting
- **TypeScript**: Static type checking
- **Husky**: Git hooks for quality gates

## 📚 Documentation

### Core Documentation
- [Project Overview](./PROJECT_OVERVIEW.md) - Comprehensive project background and scope
- [Design Guidelines](./design_guidelines.md) - UI/UX design system and standards
- [API Documentation](./docs/api.md) - Complete API reference
- [Deployment Guide](./docs/deployment.md) - Production deployment instructions

### Development Resources
- [Architecture Guide](./docs/architecture.md) - System design and patterns
- [Component Library](./docs/components.md) - Reusable UI components
- [Database Schema](./docs/database.md) - Database design and migrations
- [AI Integration](./docs/ai-integration.md) - OpenAI integration guide

## 🌟 Key Features in Detail

### Energy Monitoring Dashboard
- **Real-time Metrics**: Live energy consumption, generation, and storage data
- **Historical Analysis**: Trend analysis over customizable time periods
- **Efficiency Tracking**: Solar panel efficiency and battery health monitoring
- **Grid Integration**: Export/import tracking and optimization

### AI Anomaly Detection
- **Pattern Analysis**: Advanced machine learning for anomaly identification
- **Severity Classification**: Low, medium, high, and critical severity levels
- **Contextual Alerts**: Smart notifications with relevant context
- **Resolution Tracking**: Automated status updates and resolution monitoring

### Data Visualization
- **Interactive Charts**: 24-hour energy overview with zoom and pan
- **KPI Cards**: Key performance indicators with trend indicators
- **System Status**: Component health with color-coded indicators
- **Responsive Design**: Optimized for desktop, tablet, and mobile

## 🚀 Deployment

### Environment Setup
```bash
# Development
NODE_ENV=development
OPENAI_API_KEY=your_dev_key
DATABASE_URL=postgresql://localhost:5432/energy_dev

# Production
NODE_ENV=production
OPENAI_API_KEY=your_prod_key
DATABASE_URL=postgresql://prod_host:5432/energy_prod
```

### Docker Deployment
```bash
# Build and run with Docker
docker build -t ai-energy-management .
docker run -p 5000:5000 --env-file .env ai-energy-management
```

### Production Checklist
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] OpenAI API key validated
- [ ] Health check endpoints responding
- [ ] SSL certificates configured
- [ ] Monitoring and logging setup

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Follow the coding standards and guidelines
4. Write tests for new functionality
5. Commit changes (`git commit -m 'Add amazing feature'`)
6. Push to branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Code Standards
- **TypeScript**: Strict typing, avoid `any` type
- **React**: Functional components with hooks
- **API**: RESTful design with proper HTTP status codes
- **Database**: Use Drizzle ORM for all database operations
- **Testing**: Write tests for critical functionality

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **OpenAI** for GPT-5 AI capabilities
- **shadcn/ui** for the beautiful component library
- **Tailwind CSS** for the utility-first CSS framework
- **Drizzle ORM** for type-safe database operations
- **React Query** for efficient data fetching and caching

---

<div align="center">

**Built with ❤️ for the future of energy management**

[Report Bug](https://github.com/AIEnergyFlow/ai-energy-management/issues) • [Request Feature](https://github.com/AIEnergyFlow/ai-energy-management/issues) • [Documentation](https://github.com/AIEnergyFlow/ai-energy-management/wiki)

</div>
