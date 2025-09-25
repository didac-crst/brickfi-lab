# Makefile Guide - Housing Strategy Dashboard

This guide explains how to use the comprehensive Makefile included with the Housing Strategy Dashboard project.

## Quick Start Commands

### 🚀 Get Started Immediately
```bash
# See all available commands
make help

# Complete setup for new developers
make setup

# Start development environment
make dev
```

### 📋 Most Common Commands
```bash
make dev          # Start development with hot reload
make build        # Build production images
make start        # Start production environment
make stop         # Stop all containers
make logs         # View application logs
make status       # Check container status
```

## Command Categories

### 🛠️ Development Commands
| Command | Description |
|---------|-------------|
| `make dev` | Start development environment with hot reload |
| `make dev-backend` | Start only backend in development mode |
| `make dev-frontend` | Start only frontend in development mode |
| `make install` | Install all dependencies (backend + frontend) |
| `make setup` | Complete initial setup for new developers |

### 🏭 Production Commands
| Command | Description |
|---------|-------------|
| `make build` | Build production Docker images |
| `make start` | Start production environment |
| `make start-prod` | Start with nginx reverse proxy |
| `make stop` | Stop all running containers |
| `make restart` | Restart all containers |

### 📊 Monitoring & Debugging
| Command | Description |
|---------|-------------|
| `make logs` | Show logs from all containers |
| `make logs-backend` | Show backend logs only |
| `make logs-frontend` | Show frontend logs only |
| `make logs-nginx` | Show nginx logs only |
| `make status` | Show container status |
| `make health` | Check application health |
| `make shell-backend` | Open shell in backend container |
| `make shell-frontend` | Open shell in frontend container |

### 🧪 Testing & Quality
| Command | Description |
|---------|-------------|
| `make test` | Run all tests |
| `make test-backend` | Run backend tests only |
| `make test-frontend` | Run frontend tests only |
| `make lint` | Run linting for both backend and frontend |
| `make format` | Format code for both backend and frontend |
| `make security-scan` | Run security scans |

### 🧹 Cleanup Commands
| Command | Description |
|---------|-------------|
| `make clean` | Clean up containers, images, and volumes |
| `make clean-all` | Clean up everything including images |
| `make clean-frontend` | Clean frontend build artifacts |
| `make clean-backend` | Clean backend build artifacts |

### 📦 Dependency Management
| Command | Description |
|---------|-------------|
| `make check-deps` | Check for outdated dependencies |
| `make update-deps` | Update all dependencies |

### 🚀 Deployment Scripts
| Command | Description |
|---------|-------------|
| `make dev-script` | Run development using the dev script |
| `make deploy` | Deploy to production using the deploy script |
| `make deploy-staging` | Deploy to staging using the deploy script |

### ⚡ Quick Aliases
| Command | Alias For | Description |
|---------|-----------|-------------|
| `make up` | `make dev` | Start development environment |
| `make down` | `make stop` | Stop all containers |
| `make ps` | `make status` | Show container status |

## Development Workflow

### 1. First Time Setup
```bash
# Clone the repository
git clone <repository-url>
cd housing-strategy-dashboard

# Complete setup
make setup
```

### 2. Daily Development
```bash
# Start development environment
make dev

# In another terminal, check logs if needed
make logs

# Stop when done
make down
```

### 3. Testing Changes
```bash
# Run tests
make test

# Check code quality
make lint
make format

# Security scan
make security-scan
```

### 4. Production Deployment
```bash
# Build production images
make build

# Deploy to production
make deploy

# Check health
make health
```

## Environment Configuration

### Using Environment Variables
1. Copy the example environment file:
   ```bash
   cp env.example .env
   ```

2. Edit `.env` with your specific configuration:
   ```bash
   nano .env
   ```

### Key Environment Variables
- `REACT_APP_API_URL`: Frontend API URL
- `BACKEND_PORT`: Backend server port
- `FRONTEND_PORT`: Frontend server port
- `CORS_ORIGINS`: Allowed CORS origins

## Troubleshooting

### Common Issues

#### Docker Not Running
```bash
# Check Docker status
docker info

# Start Docker Desktop or Docker daemon
# Then retry your make command
```

#### Port Already in Use
```bash
# Check what's using the port
lsof -i :3000
lsof -i :8000

# Stop conflicting services or change ports in .env
```

#### Permission Issues
```bash
# Make scripts executable
chmod +x scripts/*.sh

# Fix Docker permissions (Linux/Mac)
sudo usermod -aG docker $USER
```

#### Clean Start
```bash
# Complete cleanup and restart
make clean-all
make setup
```

### Getting Help
```bash
# Show all available commands
make help

# Check container status
make status

# View logs for debugging
make logs
```

## Advanced Usage

### Custom Docker Registry
```bash
# Deploy with custom registry
./scripts/deploy.sh production your-registry.com v1.2.3
```

### Performance Testing
```bash
# Run performance tests
make perf-test
```

### Backup and Restore
```bash
# Create backup
make backup

# Restore from backup (manual process)
```

## Integration with CI/CD

The Makefile is designed to work well with CI/CD pipelines:

```yaml
# Example GitHub Actions workflow
- name: Build and Test
  run: |
    make install
    make test
    make lint
    make build

- name: Deploy
  run: make deploy
```

## Best Practices

1. **Always use `make help`** to see available commands
2. **Use `make setup`** for first-time setup
3. **Use `make dev`** for development work
4. **Use `make clean`** when things go wrong
5. **Use `make health`** to verify deployments
6. **Use scripts for production deployments**

## Contributing

When adding new Makefile targets:
1. Follow the existing naming conventions
2. Add help text with `## Description`
3. Test the command thoroughly
4. Update this guide if needed

---

For more information, see the main [README.md](README.md) file.
