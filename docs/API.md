# API Documentation

## Table of Contents

- [Authentication](#authentication)
- [Endpoints](#endpoints)
  - [Health](#health)
  - [Predictions](#predictions)
  - [Suggestions](#suggestions)
  - [Decision Analysis](#decision-analysis)
  - [Analytics](#analytics)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)

## Authentication

Currently, the API does not require authentication. For production use, implement proper authentication:

```javascript
headers: {
  'Authorization': 'Bearer YOUR_TOKEN'
}
```

## Endpoints

### Health

**GET** `/health`

Check API health status.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-02-27T23:15:00.000Z"
}
```

---

### Predictions

#### Generate Predictions

**POST** `/api/predictions`

Generate event predictions based on context.

**Request Body:**
```json
{
  "context": {
    "userId": "user123",
    "timestamp": "2026-02-27T23:15:00Z",
    "activity": "coding",
    "priority": 0.8,
    "complexity": 0.6,
    "urgency": 0.7
  }
}
```

**Response:**
```json
{
  "predictions": [
    {
      "type": "code-review",
      "confidence": 0.85,
      "sources": ["pattern", "neural-network"],
      "details": [...]
    }
  ],
  "metadata": {
    "totalPredictions": 15,
    "highConfidence": 5,
    "threshold": 0.7,
    "timestamp": "2026-02-27T23:15:00.000Z"
  }
}
```

#### Submit Prediction Feedback

**POST** `/api/predictions/feedback`

Provide feedback on prediction accuracy.

**Request Body:**
```json
{
  "prediction": "code-review",
  "actual": "code-review",
  "context": {
    "userId": "user123"
  }
}
```

**Response:**
```json
{
  "success": true,
  "feedback": {
    "id": "feedback-1234567890-abc123",
    "type": "prediction",
    "correct": true,
    "timestamp": "2026-02-27T23:15:00.000Z"
  }
}
```

---

### Suggestions

#### Generate Suggestions

**POST** `/api/suggestions`

Generate context-aware suggestions.

**Request Body:**
```json
{
  "context": {
    "userId": "user123",
    "content": "Working on React TypeScript project",
    "activity": "coding",
    "entities": ["React", "TypeScript"],
    "timestamp": "2026-02-27T23:15:00Z"
  }
}
```

**Response:**
```json
{
  "suggestions": [
    {
      "type": "content-based",
      "category": "entity-related",
      "title": "Explore: React Hooks",
      "description": "Related content about React Hooks",
      "relevance": 0.85,
      "actions": [
        {
          "label": "Search",
          "action": "search",
          "query": "React Hooks"
        }
      ]
    }
  ],
  "metadata": {
    "total": 20,
    "returned": 10,
    "sources": {
      "content-based": 5,
      "temporal": 2,
      "knowledge-graph": 3
    },
    "timestamp": "2026-02-27T23:15:00.000Z"
  }
}
```

#### Submit Suggestion Feedback

**POST** `/api/suggestions/feedback`

**Request Body:**
```json
{
  "suggestion": {
    "title": "Review documentation"
  },
  "action": "accepted",
  "context": {
    "userId": "user123"
  }
}
```

---

### Decision Analysis

#### Analyze Decision

**POST** `/api/decisions/analyze`

Analyze a decision using all five Atlas frameworks.

**Request Body:**
```json
{
  "decision": {
    "title": "Launch new feature",
    "description": "Should we launch the new feature next week?",
    "options": ["Launch", "Delay", "Cancel"]
  },
  "context": {
    "values": ["innovation", "quality", "speed"],
    "timeline": "short-term"
  }
}
```

**Response:**
```json
{
  "analyses": {
    "patternLens": {
      "framework": "Pattern Lens",
      "confidence": 0.75,
      "insights": [...],
      "recommendation": "proceed"
    },
    "valuesFirst": {...},
    "timePerspective": {...},
    "assumptionTest": {...},
    "decisionTriad": {...}
  },
  "synthesis": {
    "insights": [...],
    "warnings": [...],
    "overallConfidence": 0.78,
    "consensus": [...],
    "conflicts": []
  },
  "recommendations": [
    {
      "type": "proceed",
      "priority": "high",
      "message": "Strong alignment across all frameworks",
      "confidence": 0.78
    }
  ],
  "confidence": 0.78
}
```

#### Get Decision History

**GET** `/api/decisions/history?limit=10`

**Response:**
```json
{
  "history": [
    {
      "decision": {...},
      "analyses": {...},
      "timestamp": "2026-02-27T23:15:00.000Z"
    }
  ]
}
```

---

### Analytics

#### Get Performance Metrics

**GET** `/api/metrics?timeframe=week`

Timeframe options: `hour`, `day`, `week`, `month`

**Response:**
```json
{
  "prediction": {
    "count": 150,
    "accuracy": 0.82,
    "calibration": 0.85,
    "byConfidence": {...}
  },
  "suggestion": {
    "count": 200,
    "acceptanceRate": 0.45,
    "dismissalRate": 0.30
  },
  "decision": {
    "count": 50,
    "successRate": 0.75
  },
  "overall": {
    "totalFeedback": 400,
    "positiveRate": 0.67,
    "engagementRate": 0.55,
    "timeframe": "week"
  }
}
```

#### Get Improvement Recommendations

**GET** `/api/improvements`

**Response:**
```json
{
  "recommendations": [
    {
      "area": "prediction",
      "priority": "high",
      "issue": "Low prediction accuracy",
      "recommendation": "Increase training data and retrain models",
      "currentValue": 0.65,
      "targetValue": 0.8
    }
  ],
  "metrics": {...},
  "timestamp": "2026-02-27T23:15:00.000Z"
}
```

#### Apply Learning

**POST** `/api/learning/apply`

Apply accumulated feedback to improve models.

**Response:**
```json
{
  "improvements": [
    {
      "model": "predictor",
      "improvement": "improved",
      "accuracyChange": 0.05,
      "trainingDataSize": 150
    }
  ],
  "feedbackProcessed": 150,
  "timestamp": "2026-02-27T23:15:00.000Z"
}
```

---

## Error Handling

All endpoints return standard HTTP status codes:

- `200` - Success
- `400` - Bad Request (invalid input)
- `404` - Not Found
- `429` - Too Many Requests (rate limited)
- `500` - Internal Server Error

**Error Response:**
```json
{
  "error": "Error message",
  "message": "Detailed error description"
}
```

## Rate Limiting

Default rate limits:
- **100 requests per 15 minutes** per IP address
- Applies to all `/api/*` endpoints

**Rate Limit Headers:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1234567890
```
