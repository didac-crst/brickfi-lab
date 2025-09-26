# BrickFi-Lab

An interactive web application for comprehensive housing investment analysis. This dashboard provides advanced visual tools to compare buy vs rent scenarios and analyze wealth accumulation over time with sophisticated financial modeling.

## Features

### 🏠 Buy vs Rent Analyzer
- **Advanced Input Forms**: Configure property details, mortgage terms, rental costs, and investment parameters
- **Amortization Rate Calculator**: Input yearly amortization rate (e.g., 5%) and automatically calculate loan term
- **Comprehensive Analysis**: Property price, acquisition costs, mortgage breakdown, and total interest calculations
- **Wealth Comparison**: Compare house wealth vs investment wealth over 30 years with appreciation and investment returns
- **Interactive Charts**: 
  - Cost comparison over time with loan payoff consideration
  - Mortgage breakdown showing interest vs principal payments
  - Wealth comparison with house appreciation and investment growth
  - Break-even analysis with realistic post-loan scenarios

### 📊 Advanced Analytics
- **Pure Renter Baseline Analysis**: Rate-independent comparison with component breakdown
- **Net Advantage Tracking**: Evolution of buying advantage over time
- **Component Waterfall**: Detailed breakdown of appreciation, principal, interest, and opportunity costs
- **Sensitivity Analysis**: Test robustness across different interest rates and rental prices

### 💰 Wealth Analysis
- **House Appreciation**: Model property value growth over time (default: 2% annually)
- **Investment Returns**: Compare down payment investment in ETFs/funds (default: 7% annually)
- **Wealth Crossover Analysis**: Identify when investment strategy overtakes house ownership
- **30-Year Projections**: Complete wealth comparison with key milestones at 10, 20, and 30 years

### 📊 Interactive Visualizations
- **Real-time Updates**: All charts and calculations update instantly as you modify inputs
- **Sensitivity Analysis**: Visualize how changes in rates, rents, or other factors affect outcomes
- **Multi-line Charts**: Compare house wealth, investment wealth, and wealth differences over time
- **Comprehensive Summary**: Key metrics, break-even points, and wealth milestones

## Tech Stack

- **Backend**: FastAPI (Python) with comprehensive housing strategy logic
- **Frontend**: React with TypeScript, Material-UI components
- **Charts**: Interactive visualizations with Recharts library
- **Configuration**: Centralized JSON configuration for default values
- **Deployment**: Docker containers with docker-compose
- **API**: RESTful API with automatic OpenAPI documentation

## Quick Start

### Using Makefile (Recommended)
```bash
# Clone and start the application
git clone <repository-url>
cd housing-strategy-dashboard

# See all available commands
make help

# Quick development setup
make setup

# Or start development environment directly
make dev

# Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

### Using Docker Directly
```bash
# Clone and start the application
git clone <repository-url>
cd housing-strategy-dashboard
docker-compose up --build

# Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

### Development Setup
```bash
# Backend
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

# Frontend (in another terminal)
cd frontend
npm install
npm start
```

## Makefile Commands

The project includes a comprehensive Makefile for easy development and deployment:

### Development Commands
- `make dev` - Start development environment with hot reload
- `make dev-backend` - Start only backend in development mode
- `make dev-frontend` - Start only frontend in development mode
- `make install` - Install all dependencies

### Production Commands
- `make build` - Build production Docker images
- `make start` - Start production environment
- `make start-prod` - Start with nginx reverse proxy
- `make stop` - Stop all containers
- `make restart` - Restart all containers

### Monitoring and Debugging
- `make logs` - Show logs from all containers
- `make logs-backend` - Show backend logs only
- `make logs-frontend` - Show frontend logs only
- `make status` - Show container status
- `make health` - Check application health

### Testing and Quality
- `make test` - Run all tests
- `make lint` - Run linting for both backend and frontend
- `make format` - Format code for both backend and frontend
- `make security-scan` - Run security scans

### Cleanup Commands
- `make clean` - Clean up containers, images, and volumes
- `make clean-all` - Clean up everything including images
- `make clean-frontend` - Clean frontend build artifacts
- `make clean-backend` - Clean backend build artifacts

### Quick Aliases
- `make up` - Alias for `make dev`
- `make down` - Alias for `make stop`
- `make ps` - Alias for `make status`

Run `make help` to see all available commands with descriptions.

## Usage

### Buy vs Rent Analysis
1. Navigate to the "Buy vs Rent" tab
2. **Configure Property Details**:
   - Property price (default: €500,000)
   - Down payment (default: €100,000)
   - Purchase fees (default: 10%)
   - Interest rate (default: 3%)
   - Amortization rate (default: 5% yearly)
3. **Set Investment Parameters**:
   - House appreciation rate (default: 2% annually)
   - Investment return rate (default: 7% annually)
4. **Enter Rental Market Data**:
   - Monthly rent (default: €2,000)
   - Property taxes, insurance, maintenance costs
5. **View Comprehensive Analysis**:
   - Property acquisition costs and mortgage breakdown
   - Monthly cost comparisons (credit repayment vs owner cost)
   - Wealth comparison over 30 years
   - Break-even analysis with loan payoff consideration
   - Interactive charts showing wealth accumulation patterns

### Forward Rate Decision
1. Navigate to the "Forward Rate" tab
2. Enter current market rates and your decision parameters
3. Set your risk tolerance and trigger points
4. View the decision recommendation with supporting charts
5. Explore different lead times and premium schedules

### Key Insights
- **Wealth Crossover Point**: Identifies when investment strategy overtakes house ownership
- **Break-even Analysis**: Accounts for loan payoff and reduced monthly costs
- **Interest Rate Impact**: Shows how mortgage rates affect both house and investment wealth
- **30-Year Projections**: Complete wealth comparison with key milestones

## API Documentation

The backend provides a REST API with comprehensive documentation available at `/docs` when running the application.

## Architecture

```
housing-strategy-dashboard/
├── backend/                 # FastAPI backend
│   ├── app/
│   │   ├── main.py         # FastAPI application
│   │   ├── models/         # Pydantic models for API
│   │   ├── core/           # Core business logic
│   │   └── api/            # API routes and endpoints
│   └── requirements.txt    # Python dependencies
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # React components (forms, charts, summaries)
│   │   ├── pages/          # Page components (BuyVsRent, ForwardTracker)
│   │   ├── hooks/          # Custom React hooks for API integration
│   │   ├── types/          # TypeScript type definitions
│   │   └── utils/          # Utility functions and API client
│   └── package.json        # Node.js dependencies
├── shared/                 # Shared configuration
│   └── config/
│       └── defaults.json   # Centralized default values
├── docker/                 # Docker configuration
├── scripts/                # Build and deployment scripts
└── docs/                   # Additional documentation
```

### Key Components

- **Backend Core Logic**: Advanced financial calculations for buy vs rent analysis, wealth comparison, and mortgage optimization
- **Frontend Components**: Interactive forms, real-time charts, and comprehensive summary displays
- **Shared Configuration**: Centralized default values used by both backend and frontend
- **API Integration**: RESTful API with automatic documentation and type-safe frontend integration

## Recent Improvements

### 🚀 Major Features Added
- **Wealth Comparison Analysis**: Complete 30-year wealth projection comparing house ownership vs investment strategy
- **House Appreciation Modeling**: Property value growth over time with configurable appreciation rates
- **Investment Return Analysis**: Down payment investment simulation with ETF/fund returns
- **Amortization Rate Calculator**: Input yearly amortization rate instead of fixed loan terms
- **Advanced Break-even Analysis**: Accounts for loan payoff and reduced monthly costs post-mortgage

### 🔧 Technical Enhancements
- **Centralized Configuration**: Single JSON file for all default values across backend and frontend
- **Enhanced API Endpoints**: New endpoints for wealth comparison, house value, and investment projections
- **Improved Chart Visualizations**: Multi-line charts with wealth comparison, mortgage breakdown, and cost analysis
- **Real-time Calculations**: Instant updates as you modify input parameters
- **Comprehensive Summary**: Key metrics, wealth milestones, and crossover point analysis

### 📊 Analysis Capabilities
- **Interest Rate Impact**: Shows how mortgage rates affect both house and investment wealth
- **Wealth Crossover Detection**: Identifies when investment strategy overtakes house ownership
- **30-Year Projections**: Complete wealth comparison with milestones at 10, 20, and 30 years
- **Pure Investment Tracking**: Separates investment returns from mortgage-dependent savings
- **Realistic Cost Modeling**: Accounts for loan payoff and reduced monthly costs

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details.
