# Quick Start Guide

Get up and running with Integration Glue Predictive Intelligence in 5 minutes.

## Prerequisites

- Node.js 18 or higher
- npm 9 or higher
- Git

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/iacosta3994/integration-glue-predictive-intelligence.git
cd integration-glue-predictive-intelligence
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your preferences. Minimum required:

```env
NODE_ENV=development
PORT=3000
LOG_LEVEL=info
```

### 4. Start the Server

```bash
npm start
```

You should see:

```
Predictive Intelligence API listening on port 3000
```

## Your First API Call

### Test the Health Endpoint

```bash
curl http://localhost:3000/health
```

Response:
```json
{
  "status": "ok",
  "timestamp": "2026-02-27T23:15:00.000Z"
}
```

### Generate a Prediction

```bash
curl -X POST http://localhost:3000/api/predictions \
  -H "Content-Type: application/json" \
  -d '{
    "context": {
      "userId": "user123",
      "activity": "coding",
      "timestamp": "2026-02-27T23:15:00Z"
    }
  }'
```

### Get Suggestions

```bash
curl -X POST http://localhost:3000/api/suggestions \
  -H "Content-Type: application/json" \
  -d '{
    "context": {
      "userId": "user123",
      "content": "Working on a React project",
      "activity": "coding"
    }
  }'
```

### Analyze a Decision

```bash
curl -X POST http://localhost:3000/api/decisions/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "decision": {
      "title": "Launch new feature",
      "description": "Should we launch next week?",
      "options": ["Launch", "Delay"]
    }
  }'
```

## Using the JavaScript Client

```javascript
import PredictiveIntelligenceClient from './examples/api-client.js';

const client = new PredictiveIntelligenceClient('http://localhost:3000');

// Check health
const health = await client.health();
console.log(health);

// Generate predictions
const predictions = await client.predict({
  userId: 'user123',
  activity: 'coding'
});
console.log(predictions);

// Get suggestions
const suggestions = await client.suggest({
  userId: 'user123',
  content: 'Working on API development'
});
console.log(suggestions);
```

## Docker Quick Start

### Using Docker Compose

```bash
# Start all services
docker-compose up -d

# Check logs
docker-compose logs -f app

# Stop services
docker-compose down
```

### Using Docker

```bash
# Build image
docker build -t predictive-intelligence .

# Run container
docker run -d \
  -p 3000:3000 \
  --env-file .env \
  --name predictive-api \
  predictive-intelligence

# Check logs
docker logs -f predictive-api
```

## Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run in watch mode
npm run test:watch
```

## Development Mode

```bash
# Start with auto-reload
npm run dev
```

## Next Steps

1. **Read the [API Documentation](./API.md)** - Learn all available endpoints
2. **Explore [Examples](../examples/)** - See usage examples
3. **Review [Architecture](./ARCHITECTURE.md)** - Understand the system design
4. **Check [Contributing Guide](../CONTRIBUTING.md)** - Start contributing

## Common Issues

### Port Already in Use

```bash
# Change port in .env
PORT=3001
```

### Module Not Found

```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Tests Failing

```bash
# Clear Jest cache
npm test -- --clearCache
```

## Getting Help

- **Documentation**: Check `/docs` folder
- **Issues**: Open an issue on GitHub
- **Examples**: See `/examples` folder

## What's Next?

Now that you have the system running:

1. Try different prediction contexts
2. Experiment with decision frameworks
3. Submit feedback and watch the system learn
4. Check performance metrics
5. Explore the codebase

Happy predicting! 🚀
