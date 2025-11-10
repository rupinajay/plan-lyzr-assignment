# PLAN Backend - FastAPI

Python FastAPI backend for PLAN project planner with modular LLM client.

## Features

- Chat endpoint with LLM-powered entity extraction
- **Smart task modification** - preserves manual edits while applying AI changes
- Modular LLM client (supports GROQ, OpenAI, Anthropic via config)
- Task scheduling with dependency resolution
- Weekend-aware business day calculation
- Gantt chart data export
- CSV export
- Rate limiting and CORS protection

## Setup

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Configure Environment

Copy `.env.example` to `.env` and set your values:

```bash
cp .env.example .env
```

Edit `.env`:

```env
LLM_BASE_URL=https://api.groq.com/openai/v1
LLM_API_KEY=your_groq_api_key_here
APP_SECRET=your_jwt_secret_here
CORS_ORIGINS=http://localhost:3000,https://your-frontend.vercel.app
```

**IMPORTANT**: Never commit `.env` to git. It's already in `.gitignore`.

### 3. Run Development Server

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

API will be available at `http://localhost:8000`

## API Endpoints

### Health Check
- `GET /` - Root endpoint
- `GET /api/health` - Health check

### Chat
- `POST /api/chat` - Send message, extract entities
  ```json
  {
    "session_id": "optional-uuid",
    "text": "I need to build a website with 3 pages"
  }
  ```

### Generate Report
- `POST /api/generate_report` - Finalize and schedule plan
  ```json
  {
    "session_id": "uuid",
    "start_date": "2025-01-15"
  }
  ```

### Export
- `GET /api/gantt_data/{plan_id}` - Get Gantt chart data
- `GET /api/report/{plan_id}` - Get full report
- `GET /api/report/{plan_id}/csv` - Download CSV

## Architecture

### Modular LLM Client

The `llm_client.py` provides an OpenAI-compatible interface that works with any provider:

- **GROQ**: Set `LLM_BASE_URL=https://api.groq.com/openai/v1` (uses `openai/gpt-oss-20b` model)
- **OpenAI**: Set `LLM_BASE_URL=https://api.openai.com/v1` (uses `gpt-4o-mini` or `gpt-4`)
- **Anthropic**: Adapt the client for their API format
- **Self-hosted**: Point to your own endpoint

This design keeps business logic decoupled from the LLM provider.

**Current GROQ Models (as of Nov 2024):**
- `openai/gpt-oss-20b` (default, fast)
- `llama-3.1-70b-versatile` (deprecated)
- Check https://console.groq.com/docs/models for latest

### Task Modification System

The system intelligently handles two modes:

**Initial Extraction Mode** (first query):
- User describes project: "Plan a trip to Goa"
- LLM extracts tasks from full conversation
- Tasks displayed in editable table

**Modification Mode** (subsequent queries):
- Frontend sends current table state (including manual edits)
- LLM applies ONLY requested changes
- Manual edits are preserved
- Example: "Change duration to 3 days" only modifies duration

See `TASK_MODIFICATION.md` for detailed documentation.

### Task Scheduling

The scheduler (`scheduler.py`):
- Resolves task dependencies
- Skips weekends (Saturday/Sunday)
- Calculates business days
- Returns tasks with start/end dates

## Deployment

### Render / Railway / Fly.io

1. Connect your git repository
2. Set environment variables in the platform's dashboard
3. Use build command: `pip install -r requirements.txt`
4. Use start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

### Environment Variables for Production

```
LLM_BASE_URL=https://api.groq.com/openai/v1
LLM_API_KEY=<your-key-from-secrets-manager>
APP_SECRET=<random-secret>
CORS_ORIGINS=https://your-frontend.vercel.app
```

## Security

- API keys stored in environment variables only
- Input validation via Pydantic models
- Rate limiting via slowapi
- CORS configured for specific origins
- Max message length: 10,000 characters

## Testing

### Run Task Modification Tests

```bash
python -m backend.test_task_modification
```

This tests:
- Duration changes
- Owner assignments
- Manual edit preservation
- Adding new tasks
- Multiple simultaneous changes

### Run All Tests

```bash
pytest
```

(Add more tests in `tests/` directory)
