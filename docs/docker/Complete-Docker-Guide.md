# Grocery Frontend - Complete Docker Guide

## Overview
This project uses Docker to create consistent development, testing, and production environments. Docker ensures that everyone on the team works with the same environment, eliminating **"it works on my machine"** problems.

## Why Docker?
- Same environment for all developers
- Easy onboarding for new team members
- No need to install Node.js/npm locally
- Production-like testing environment
- Quick setup and teardown

## Prerequisites
Before starting, make sure you have installed:

<table>
  <tr>
    <th>Software</th>
    <th>Version</th>
    <th>Download</th>
  </tr>
  <tr>
    <td>Docker Desktop</td>
    <td>Latest</td>
    <td>docker.com</td>
  </tr>
  <tr>
    <td>Node.js</td>
    <td>18+</td>
    <td>nodejs.org (optional - for local testing)</td>
  </tr>
  <tr>
    <td>Git</td>
    <td>KursProfi</td>
    <td>Latest</td>
  </tr>
</table>

**Verify installation:**
```bash
docker --version
docker-compose --version
```

## Docker & Test Project Structure

```bash
grocery-frontend/
├── docker/
│   ├── docker-compose-dev.yml      # Development environment
│   ├── docker-compose-prod.yml     # Production environment
│   ├── docker-compose-test.yml     # Testing environment
│   ├── dockerfile.dev              # Development Dockerfile
│   ├── dockerfile.prod             # Production Dockerfile
│   └── dockerfile.test             # Testing Dockerfile
├── test/
│   ├── unit                        # Unit tests/
│   │   ├── home.test.js
│   │   ├── ... (other files)
│   │   └── components/
│   │       ├── Button.test.js
│   │       ├── Navbar.test.js
│   │       ├── ... (other files)
│   │       └── utils/
│   │           ├── formatDate.test.js
│   │           └── ... (other files)
│   ├── integration               # Integration tests/
│   │   ├── api/
│   │   │   ├── products.test.js
│   │   │   └── ... (other files)
│   │   ├── pages/
│   │   │   ├── checkout.test.js
│   │   │   └── ... (other files)
│   │   └── auth/
│   │       ├── login.test.js
│   │       └── ... (other files)
│   └── e2e                      # End-to-end tests/
│       ├── homepage.spec.js
│       ├── checkout.spec.js
│       ├── ... (other files)
│       └── fixtures/
│           ├── test-data.json
│           └── ... (other files)
├── jest.config.js             # Jest configuration
├── est.setup.js              # Jest setup file
├── cypress.config.js          # Cypress configuration (if using Cypress)
├── package.json
└── ... (other files)
```

## Environment Overview

<table>
  <tr>
    <th>Environment</th>
    <th>File</th>
    <th>Port</th>
    <th>Volumes</th>
    <th>Purpose</th>
    <th>Who Uses</th>
  </tr>
  <tr>
    <td>Development</td>
    <td>docker-compose-dev.yml</td>
    <td>3000:3000</td>
    <td>Yes (hot reload)</td>
    <td>Active coding</td>
    <td>Developers</td>
  </tr>
  <tr>
    <td>Testing</td>
    <td>docker-compose-test.yml</td>
    <td>3001:3000</td>
    <td>No</td>
    <td>Pre-deployment validation</td>
    <td>QA, Testers</td>
  </tr>
  <tr>
    <td>Production</td>
    <td>docker-compose-prod.yml</td>
    <td>8080:3000</td>
    <td>No</td>
    <td>Live deployment</td>
    <td>DevOps, End users</td>
  </tr>
</table>

## Quick Start
For New Developers (5-Minute Setup)

```bash
# 1. Clone the repository
git clone https://github.com/desipayments/grocery-frontend.git 

# 2. Create a branch
git checkout -b feature/<feature-name>

# 3. Create a backup branch
git checkout -b backup/<feature-name>

# 4. Install dependencies:
npm install

# 5. Start the development environment
npm run docker:dev:build

# 6. View the logs
npm run docker:dev:logs

# 7. Open your browser
open http://localhost:3000

# 8. When done, stop containers
npm run docker:dev:down
```
**That's it!** You now have a fully functional development environment.

## NPM Scripts Reference
We've created easy-to-remember NPM scripts for all Docker commands. No need to remember complex docker-compose commands!

### Build Scripts
```bash
# Build development image
npm run docker:build:dev

# Build testing image  
npm run docker:build:test

# Build production image
npm run docker:build:prod
```

### Development Environment
```bash
# Start dev in attached mode (see logs in terminal)
npm run docker:dev

# Start dev in detached mode (run in background)
npm run docker:dev:d

# Build and start dev (use after Dockerfile changes)
npm run docker:dev:build

# Stop dev containers
npm run docker:dev:down

# View dev logs
npm run docker:dev:logs
```

### Testing Environment
```bash
# Start test in attached mode
npm run docker:test

# Start test in detached mode
npm run docker:test:d

# Build and start test
npm run docker:test:build

# Stop test containers
npm run docker:test:down
```

### Production Environment
```bash
# Start prod in attached mode
npm run docker:prod

# Start prod in detached mode
npm run docker:prod:d

# Build and start prod
npm run docker:prod:build

# Stop prod containers
npm run docker:prod:down
```

### Utility Scripts
```bash
# List running containers
npm run docker:ps

# View development logs
npm run docker:logs

# Clean up unused Docker resources
npm run docker:clean

# Clean up everything (including volumes) - use with caution!
npm run docker:clean:all
```

### Workflow Scripts (One-Command Workflows)
```bash
# Start development with logs (complete dev workflow)
npm run workflow:dev

# Start test environment and run E2E tests
npm run workflow:test

# Build and deploy to production
npm run workflow:deploy
```

### Testing Scripts
```bash
# Run all tests
npm test

# Run unit tests only
npm run test:unit

# Run integration tests only
npm run test:integration

# Run E2E tests (headless)
npm run test:e2e

# Open Cypress UI for E2E tests
npm run test:e2e:open

# Run tests in watch mode (during development)
npm run test:watch

# Generate test coverage report
npm run test:coverage

# Run all tests (for CI/CD pipelines)
npm run test:ci
```

## Summary
<table>
  <tr>
    <th>Environment</th>
    <th>Command to Start</th>
    <th>URL</th>
    <th>Use Case</th>
  </tr>
  <tr>
    <td>Development</td>
    <td>npm run docker:dev:d</td>
    <td>http://localhost:3000</td>
    <td>Daily coding</td>
  </tr>
  <tr>
    <td>Testing</td>
    <td>npm run docker:test:build</td>
    <td>http://localhost:3001</td>
    <td>Pre-deployment</td>
  </tr>
  <tr>
    <td>Production</td>
    <td>npm run docker:prod:build</td>
    <td>http://localhost:8080</td>
    <td>Live deployment</td>
  </tr>
</table>

# Docker Commands Cheat Sheet

## Basic Docker Commands
```bash
# List running containers
docker ps

# List all containers (including stopped)
docker ps -a

# List all images
docker images

# Stop a container
docker stop <container-name>

# Stop all containers
docker stop $(docker ps -q)

# Remove a container
docker rm <container-name>

# Remove an image
docker rmi <image-name>

# View container logs
docker logs <container-name>

# Follow logs in real-time
docker logs -f <container-name>

# Execute command inside container
docker exec -it <container-name> sh

# Check disk usage
docker system df
```

## Understanding Docker Modes
Attached Mode (`up` without `-d`)
```bash
npm run docker:dev
```

### What happens:
- Container runs in current terminal
- See all logs in real-time
- Press `Ctrl+C` to stop
- Terminal is blocked (can't use for other commands)

**Use when:** Debugging, first-time setup, need to see logs

Detached Mode (`up -d`)
```bash
npm run docker:dev:d
```

### What happens:
- Container runs in background
- Get terminal back immediately
- No logs shown
- Container keeps running after terminal closes
- Use npm run `docker:dev:logs` to see output

**Use when:** Normal development, want terminal free

## Daily Workflows

### Developer Daily Workflow
```bash
# Start development environment
npm run docker:dev:d

# Check if everything is running
npm run docker:ps

# Make code changes (hot reload works automatically!)

# Run tests as you code
npm run test:watch

# If something breaks, check logs
npm run docker:dev:logs

# If you add new packages (package.json changes)
npm run docker:dev:build

# End of day: Stop containers
npm run docker:dev:down
```

### QA/Tester Workflow
```bash
# 1. Start test environment with latest build
npm run docker:test:build

# 2. Run automated tests
npm run test:e2e

# 3. Manual testing at http://localhost:3001

# 4. Check test logs if needed
npm run docker:test:logs

# 5. Clean up after testing
npm run docker:test:down
```

### Before Pushing Code
```bash
# 1. Run all tests locally
npm test

# 2. Start test environment
npm run docker:test:build

# 3. Run E2E tests against test environment
npm run test:e2e

# 4. If all tests pass, you're ready to push!
npm run docker:test:down
```

### Deployment Workflow
```bash
# 1. Run full test suite
npm run test:ci

# 2. Build production image
npm run docker:build:prod

# 3. Deploy to production
npm run workflow:deploy

# 4. Monitor production logs
npm run docker:prod:logs

# 5. Verify deployment
open http://localhost:8080
```

## Troubleshooting Guide

### 1. Port already in use
```bash
# Error: Bind for 0.0.0.0:3000 failed: port is already allocated

# Find what's using the port
lsof -i :3000

# Stop the container using that port
docker stop $(docker ps -q --filter "publish=3000")

# Or use a different port in docker-compose file
```

### 2. Container exits immediately
```bash
# Check logs to see why
npm run docker:dev:logs

# Common causes:
# - Missing dependencies
# - Incorrect CMD in Dockerfile
# - Port already in use
```

### 3. Volume not working (no hot reload)
```bash
# Check if volumes are properly mounted
docker inspect docker-dev-frontend-1 | grep -A 10 Mounts

# You should see your local directory mounted to /src
```

### 4. Permission denied errors
```bash
# Fix npm permissions on host machine
sudo chown -R $(whoami) ~/.npm

# Fix volume permissions in container
docker exec -it docker-dev-frontend-1 chmod -R 755 /src
```

### 5. Build fails with "no such file or directory"
```bash
# Check if you're in the right directory
pwd  # Should be /path/to/grocery-frontend

# Check if Dockerfile exists
ls -la docker/dockerfile.dev
```

### 6. "npm: not found" error
```bash
# This usually means CMD syntax is wrong in Dockerfile
# CMD should be: CMD ["npm", "run", "dev"]
# NOT: CMD [npm, run, dev] or CMD npm run dev
```

### 7. Out of disk space
```bash
# Check disk usage
docker system df

# Clean up unused resources
npm run docker:clean

# Clean everything (be careful!)
npm run docker:clean:all
```

### Quick Diagnostic Commands
```bash
# Check if containers are running
docker ps

# Check all containers (including stopped)
docker ps -a

# Check logs
npm run docker:dev:logs

# Check container details
docker inspect docker-dev-frontend-1

# Check Docker system health
docker system df
```

## Best Practices
### DO:

- Always use down to stop containers
    ```bash
    npm run docker:dev:down  # Correct
    # NOT Ctrl+C (can cause issues)
    ```

- Rebuild after package.json changes
    ```bash
    npm run docker:dev:build  # After adding/removing packages
    ```

- Use .env files for environment variables
    ```bash
    # Create .env.development, .env.test, .env.production
    # Never commit sensitive data!
    ```

- Regular cleanup
    ```bash
    # Once a week
    npm run docker:clean
    ```

- Check logs first when debugging
    ```bash
    npm run docker:dev:logs  # Always check logs first!
    ```

- Use the NPM scripts
    ```bash
    # They're easier to remember and less error-pronenpm run docker:dev:d  # Instead of long docker-compose commands
    ```

### DON'T:

- Don't use `sudo` with Docker commands (unless absolutely necessary)
- Don't install packages inside running containers
    ```bash
    # Wrong
    docker exec docker-dev-frontend-1 npm install axios

    # Correct - update package.json and rebuild
    npm run docker:dev:build
    ```
- Don't ignore health checks
    ```bash
    # If container shows (unhealthy), investigate!
    docker ps  # Check STATUS column
    ```

- Don't commit `node_modules` to git (it's in .gitignore)
- Don't use `docker-compose down -v` unless you want to delete volumes


### Remember:
- Use NPM scripts - they're easier!
- Check logs first when debugging
- Clean up regularly
- Ask for help when stuck

## Quick Reference Card
``` bash
# Start development
npm run docker:dev:d

# Stop development
npm run docker:dev:down

# View logs
npm run docker:dev:logs

# Run tests
npm test

# Rebuild after changes
npm run docker:dev:build

# Clean up
npm run docker:clean

# For testing
npm run docker:test:build
npm run test:e2e

# For production (admin only)
npm run docker:prod:build
```