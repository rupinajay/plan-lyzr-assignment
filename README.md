# PLAN - AI-Powered Project Planner

Chat-driven project planner that converts conversations into structured project plans with visual timeline visualizations.

## Overview

PLAN uses AI to extract project tasks, dependencies, and timelines from natural conversation. It features:

- **Chat Interface**: Describe your project naturally
- **AI Entity Extraction**: Automatically identifies tasks, durations, owners, and dependencies
- **Smart Scheduling**: Business-day aware task scheduling with dependency resolution
- **Visual Timeline**: Interactive Gantt chart in a modal
- **Export Options**: Download plans as CSV

## Architecture

```
User (Browser)
  └─ Next.js Frontend (Vercel)
       ├─ shadcn UI components only
       └─ Gantt chart in modal (vis-timeline)
       └─ Calls FastAPI backend

FastAPI Backend (Render/Railway/Fly.io)
  ├─ /api/chat           → LLM-powered entity extraction
  ├─ /api/generate       → Task scheduling & plan generation
  ├─ /api/gantt_data     → Timeline data for chart
  └─ Modular LLM Client  → OpenAI-compatible wrapper (GROQ default)
```

## Unique Features

### Modular LLM Client

The backend uses a provider-agnostic LLM client that works with any OpenAI-compatible API:

- **GROQ** (default): Fast, cost-effective inference
- **OpenAI**: GPT-4, GPT-3.5
- **Anthropic**: Claude (with adapter)
- **Self-hosted**: Point to your own endpoint

Switch providers by changing `LLM_BASE_URL` and `LLM_API_KEY` environment variables - no code changes needed.

### Planned Contextual Stitching

PLAN doesn't just store messages - it:
1. Converts chat into structured project entities incrementally
2. Maintains context-aware summaries
3. Resolves task dependencies automatically
4. Schedules tasks with business-day awareness

## Tech Stack

### Frontend
- Next.js 14 (React + TypeScript)
- shadcn/ui components exclusively
- vis-timeline for Gantt charts
- Tailwind CSS

### Backend
- FastAPI (Python 3.11+)
- Pydantic for validation
- httpx for async HTTP
- slowapi for rate limiting

### LLM
- GROQ (primary)
- Modular client supports OpenAI, Anthropic, custom endpoints

### Deployment
- Frontend: Vercel
- Backend: Render / Railway / Fly.io

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- Python 3.11+
- GROQ API key (or OpenAI/other provider)

### 1. Clone Repository

```bash
git clone <your-repo-url>
cd PLAN
```

### 2. Backend Setup

```bash
cd backend
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env and add your LLM_API_KEY
```

Start backend:

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Backend runs at `http://localhost:8000`

### 3. Frontend Setup

```bash
cd frontend
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local if needed (default points to localhost:8000)
```

Start frontend:

```bash
npm run dev
```

Frontend runs at `http://localhost:3000`

### 4. Use the App

1. Open `http://localhost:3000`
2. Describe your project in the chat
3. Watch as tasks are extracted automatically
4. Click "Generate Report" to create timeline
5. View Gantt chart in modal
6. Download CSV if needed

## Environment Variables

### Backend (`backend/.env`)

```env
LLM_BASE_URL=https://api.groq.com/openai/v1
LLM_API_KEY=your_groq_api_key_here
APP_SECRET=random_secret_for_jwt
CORS_ORIGINS=http://localhost:3000,https://your-frontend.vercel.app
```

**IMPORTANT**: Never commit `.env` files. Use deployment platform's secret management.

### Frontend (`frontend/.env.local`)

```env
NEXT_PUBLIC_API_BASE=http://localhost:8000
NEXT_PUBLIC_ENV=development
```

## Deployment

### Frontend to Vercel

1. Push code to GitHub
2. Import project in Vercel
3. Set environment variable:
   - `NEXT_PUBLIC_API_BASE` = your backend URL
4. Deploy

### Backend to Render/Railway

1. Connect GitHub repository
2. Set environment variables in dashboard:
   - `LLM_BASE_URL`
   - `LLM_API_KEY` (use secrets manager)
   - `APP_SECRET`
   - `CORS_ORIGINS`
3. Set start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Deploy

## API Endpoints

### Chat
```
POST /api/chat
Body: { "session_id": "optional", "text": "I need to build..." }
```

### Generate Report
```
POST /api/generate_report
Body: { "session_id": "uuid", "start_date": "2025-01-15" }
```

### Export
```
GET /api/gantt_data/{plan_id}     # Gantt chart data
GET /api/report/{plan_id}         # Full report
GET /api/report/{plan_id}/csv     # CSV download
```

### Health Check
```
GET /api/health
```

## Security Best Practices

 API keys in environment variables only  
 Input validation via Pydantic  
 Rate limiting on endpoints  
 CORS configured for specific origins  
 HTTPS in production  
 No secrets in git repository  
 Max message length enforced  

## Project Structure

```
PLAN/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI app
│   │   ├── routers/             # API endpoints
│   │   ├── services/            # Business logic
│   │   │   ├── llm_client.py    # Modular LLM wrapper
│   │   │   ├── parser.py        # Entity extraction
│   │   │   └── scheduler.py     # Task scheduling
│   │   ├── models/              # Pydantic schemas
│   │   └── storage.py           # Session storage
│   ├── requirements.txt
│   └── README.md
├── frontend/
│   ├── app/                     # Next.js pages
│   ├── components/              # React components
│   │   ├── ui/                  # shadcn components
│   │   ├── ChatWindow.tsx
│   │   ├── GanttModal.tsx
│   │   └── GanttChart.tsx
│   ├── lib/
│   │   └── api.ts               # Backend client
│   ├── package.json
│   └── README.md
├── solution.md                  # Implementation guide
└── README.md                    # This file
```

## Development

### Backend Tests

```bash
cd backend
pytest
```

### Frontend Linting

```bash
cd frontend
npm run lint
```

### Type Checking

```bash
cd frontend
npx tsc --noEmit
```

## Switching LLM Providers

### Use OpenAI

```env
LLM_BASE_URL=https://api.openai.com/v1
LLM_API_KEY=sk-...
```

Update model in `backend/app/services/llm_client.py`:
```python
model="gpt-4o-mini"  # or gpt-4
```

### Use Custom Endpoint

```env
LLM_BASE_URL=https://your-endpoint.com/v1
LLM_API_KEY=your-key
```

## Troubleshooting

### Backend won't start
- Check Python version: `python --version` (need 3.11+)
- Verify `LLM_API_KEY` is set in `.env`
- Check port 8000 is available

### Frontend can't connect to backend
- Verify backend is running
- Check `NEXT_PUBLIC_API_BASE` in `.env.local`
- Verify CORS origins in backend

### Gantt chart not displaying
- Check browser console for errors
- Verify plan has valid date formats
- Ensure vis-timeline CSS is loaded

### LLM errors
- Verify API key is valid
- Check rate limits on provider
- Review error messages in backend logs

## Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Test thoroughly
5. Submit pull request

## License

See LICENSE file for details.

## Support

For issues and questions:
- Check documentation in `backend/README.md` and `frontend/README.md`
- Review `solution.md` for implementation details
- Open GitHub issue with details