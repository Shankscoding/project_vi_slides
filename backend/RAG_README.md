# Closed-Domain RAG System Implementation

This implementation adds a closed-domain RAG (Retrieval-Augmented Generation) system to vi-slides that automatically answers student questions based on a fixed Q&A dataset. **No LLM or external AI services are used** - only vector similarity matching.

## Features

- **Closed-domain**: Only answers questions if similar question exists in dataset
- **No LLM**: Uses @xenova/transformers for embeddings, no external AI APIs
- **Automatic answering**: Questions are automatically answered when similarity >= 0.75
- **Unanswered tracking**: Questions without good matches are marked as "unanswered"
- **Vector database**: Uses ChromaDB for efficient similarity search

## Architecture

### Components

1. **RAGService.ts** - Core RAG logic with ChromaDB integration
2. **Question.ts** - Updated MongoDB model with RAG fields
3. **questionController.ts** - Modified to use RAG for automatic answering
4. **seedQA.ts** - Script to populate ChromaDB with Q&A data
5. **sample_qa.json** - 45 CS questions and answers dataset

### Data Flow

```
Student Question -> RAGService.findAnswer() -> ChromaDB Query -> 
Similarity Check -> Auto-answer OR Unanswered -> MongoDB Storage
```

## Setup Instructions

### Prerequisites

1. **ChromaDB Server** running on http://localhost:8000
2. **Node.js** and **npm** installed
3. **MongoDB** running

### Install Dependencies

```bash
cd backend
npm install chromadb @xenova/transformers
```

### Start ChromaDB

```bash
# Option 1: Using Docker (recommended)
docker run -d --name chromadb -p 8000:8000 chromadb/chroma

# Option 2: Python installation
pip install chromadb
chroma run --host 0.0.0.0 --port 8000
```

### Seed Q&A Data

```bash
# Run the seeding script
npx ts-node scripts/seedQA.ts
```

This will:
- Load 45 CS questions from `data/sample_qa.json`
- Generate embeddings using all-MiniLM-L6-v2 model
- Store in ChromaDB collection "vi_slides_qa"
- Test the system with sample queries

### Start the Backend

```bash
npm run dev
```

The RAG service will automatically initialize at startup.

## API Usage

### Create Question (with RAG)

```http
POST /api/questions
Content-Type: application/json

{
  "content": "What is binary search?",
  "sessionId": "session_id_here"
}
```

**Response (Auto-answered):**
```json
{
  "success": true,
  "data": {
    "content": "What is binary search?",
    "question": "What is binary search?",
    "answer": "Binary search has a time complexity of O(log n)...",
    "status": "auto_answered",
    "sessionId": "session_id_here",
    "timestamp": "2024-01-01T12:00:00.000Z"
  },
  "ragStatus": "auto_answered",
  "ragAnswer": "Binary search has a time complexity of O(log n)...",
  "ragSimilarity": 0.8923,
  "message": "Question automatically answered using RAG system"
}
```

**Response (Unanswered):**
```json
{
  "success": true,
  "data": {
    "content": "What is quantum computing?",
    "question": "What is quantum computing?",
    "answer": "",
    "status": "unanswered",
    "sessionId": "session_id_here",
    "timestamp": "2024-01-01T12:00:00.000Z"
  },
  "ragStatus": "unanswered",
  "ragAnswer": null,
  "ragSimilarity": 0.2341,
  "message": "Question submitted and queued for grammar/clarity refinement"
}
```

### Get Unanswered Questions

```http
GET /api/sessions/{sessionId}/unanswered-questions
```

**Response:**
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "content": "What is quantum computing?",
      "question": "What is quantum computing?",
      "answer": "",
      "status": "unanswered",
      "sessionId": "session_id_here",
      "timestamp": "2024-01-01T12:00:00.000Z",
      "user": { "name": "Student Name" }
    }
  ]
}
```

## Configuration

### Similarity Threshold

Default similarity threshold is **0.75**. This can be adjusted in `RAGService.ts`:

```typescript
private readonly similarityThreshold = 0.75;
```

### ChromaDB Settings

- **URL**: http://localhost:8000
- **Collection**: vi_slides_qa
- **Embedding Model**: Xenova/all-MiniLM-L6-v2

### Model Settings

The embedding model is cached locally in `backend/models/` directory.

## Q&A Dataset

The `data/sample_qa_mern.json` contains 45 MERN stack and TypeScript questions covering:

- **MongoDB**: Database concepts, aggregation, indexing, sharding, replication, GridFS
- **Express.js**: Middleware, routing, error handling, session management, REST APIs
- **React**: Components, hooks, JSX, state, props, context, Redux, portals, error boundaries
- **Node.js**: Runtime, event loop, streams, clustering, npm, async/await
- **TypeScript**: Types, interfaces, generics, decorators, utility types, modules
- **Full-stack concepts**: JWT authentication, CORS, environment variables, RESTful APIs

### Adding New Questions

1. Update `data/sample_qa_mern.json`
2. Re-run seeding script: `npx ts-node scripts/seedQA.ts`

## Monitoring & Debugging

### RAG Service Status

```bash
# Check logs for RAG initialization
# Look for messages like:
# "RAG Service initialized with 45 Q&A pairs in collection"
# "Question auto-answered with similarity 0.8923"
```

### Health Check

```http
GET /api/health
```

### Test RAG Directly

The seeding script includes test queries that show similarity scores and matches.

## Error Handling

### Common Issues

1. **ChromaDB not running**: Start ChromaDB server first
2. **No embeddings**: Run seeding script to populate ChromaDB
3. **Low similarity**: Adjust threshold or add more Q&A pairs
4. **Model download**: First run downloads embedding model (may take time)

### Fallback Behavior

- If ChromaDB is unavailable, questions are marked as "unanswered"
- If similarity < threshold, questions are marked as "unanswered"
- All unanswered questions can be retrieved via API

## Performance

- **Embedding generation**: ~100ms per question (first time slower due to model download)
- **ChromaDB query**: ~10-50ms
- **Memory usage**: ~500MB for embedding model
- **Storage**: ~1MB for 45 Q&A pairs in ChromaDB

## Security

- No external API calls or LLM usage
- All processing happens locally
- No user data sent to external services
- Embeddings are stored locally in ChromaDB

## Future Enhancements

1. **Dynamic threshold adjustment** based on question type
2. **Multiple embedding models** for different domains
3. **Question categorization** for better matching
4. **Analytics dashboard** for RAG performance
5. **Batch processing** for bulk question updates

## Troubleshooting

### Port Conflicts
If ChromaDB port 8000 is in use:
```bash
# Use different port
chroma run --host 0.0.0.0 --port 8001
# Update RAGService.ts chromaUrl accordingly
```

### Model Issues
If embedding model fails to load:
```bash
# Clear model cache
rm -rf backend/models/
# Restart server to re-download
```

### Database Issues
If ChromaDB collection is empty:
```bash
# Re-seed the data
npx ts-node scripts/seedQA.ts
```
