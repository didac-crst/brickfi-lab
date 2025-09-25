# Housing Strategy Dashboard

An interactive web application for analyzing housing investment decisions and mortgage refinancing strategies. This dashboard provides visual tools to compare buy vs rent scenarios and optimize forward rate decisions for mortgage refinancing.

## Features

### 🏠 Buy vs Rent Analyzer
- **Interactive Input Forms**: Modify property price, mortgage rates, rent costs, and other parameters in real-time
- **Visual Charts**: See break-even analysis, cost comparisons, and sensitivity analysis with interactive charts
- **Economic Analysis**: Compare first-year ownership costs vs rental costs with detailed breakdowns

### 📈 Forward Rate Tracker
- **Rate Decision Dashboard**: Visualize forward-loaded mortgage rates and decision triggers
- **Premium Schedule Modeling**: Interactive charts showing how forward premiums affect rates over time
- **Small-Loan Analysis**: Model surcharges and optimize loan amounts for better rates

### 📊 Interactive Visualizations
- **Real-time Updates**: All charts and calculations update instantly as you modify inputs
- **Sensitivity Analysis**: Visualize how changes in rates, rents, or other factors affect outcomes
- **Comparison Tools**: Side-by-side analysis of different scenarios

## Tech Stack

- **Backend**: FastAPI (Python) with the core housing strategy logic
- **Frontend**: React with TypeScript, Material-UI, and Chart.js
- **Charts**: Interactive visualizations with Recharts
- **Deployment**: Docker containers with docker-compose

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
2. Enter property details (price, down payment, mortgage rate, etc.)
3. Enter rental market data (monthly rent, comparable costs)
4. View real-time analysis with interactive charts
5. Use sensitivity sliders to explore different scenarios

### Forward Rate Decision
1. Navigate to the "Forward Rate" tab
2. Enter current market rates and your decision parameters
3. Set your risk tolerance and trigger points
4. View the decision recommendation with supporting charts
5. Explore different lead times and premium schedules

## API Documentation

The backend provides a REST API with comprehensive documentation available at `/docs` when running the application.

## Architecture

```
housing-strategy-dashboard/
├── backend/                 # FastAPI backend
│   ├── app/
│   │   ├── main.py         # FastAPI application
│   │   ├── models/         # Pydantic models
│   │   └── api/            # API routes
│   └── requirements.txt    # Python dependencies
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── charts/         # Chart components
│   │   └── utils/          # Utility functions
│   └── package.json        # Node.js dependencies
├── docker/                 # Docker configuration
└── docs/                   # Additional documentation
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details.
