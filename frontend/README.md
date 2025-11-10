# PLAN Frontend - Next.js

Next.js frontend for PLAN project planner, built exclusively with shadcn UI components.

## Features

- Chat interface for project planning
- Real-time task extraction display
- Gantt chart visualization in modal (shadcn Dialog)
- CSV export functionality
- Responsive design with Tailwind CSS
- All UI components from shadcn (no custom UI components)

## Tech Stack

- Next.js 14 (App Router)
- React 18
- TypeScript
- shadcn/ui components
- Tailwind CSS
- frappe-gantt (Modern, simple Gantt chart library)

## Setup

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_API_BASE=http://localhost:8000
NEXT_PUBLIC_ENV=development
```

For production (Vercel), set:

```env
NEXT_PUBLIC_API_BASE=https://your-backend-api.onrender.com
NEXT_PUBLIC_ENV=production
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
frontend/
├── app/
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Main chat page
│   └── globals.css         # Global styles
├── components/
│   ├── ui/                 # shadcn components
│   │   ├── button.tsx
│   │   ├── dialog.tsx
│   │   ├── input.tsx
│   │   ├── card.tsx
│   │   ├── scroll-area.tsx
│   │   └── badge.tsx
│   ├── ChatWindow.tsx      # Chat message display
│   ├── ChatInput.tsx       # Message input
│   ├── ChatMessage.tsx     # Individual message
│   ├── TaskList.tsx        # Task list sidebar
│   ├── GanttChart.tsx      # Gantt chart (vis-timeline)
│   └── GanttModal.tsx      # Modal wrapper for Gantt
└── lib/
    ├── api.ts              # Backend API client
    └── utils.ts            # Utility functions
```

## Components

### shadcn Components Used

All UI elements use shadcn components:

- **Dialog**: Modal for Gantt chart display
- **Button**: All buttons (send, generate, download)
- **Input**: Text input and date picker
- **Card**: Container components
- **ScrollArea**: Scrollable chat window
- **Badge**: Task metadata display

### Gantt Chart

The Gantt chart uses `frappe-gantt` library embedded inside a shadcn Dialog component. Frappe Gantt is a modern, lightweight, and beautiful Gantt chart library that provides:
- Interactive timeline visualization
- Multiple view modes (Day, Week, Month)
- Color-coded tasks by owner
- Hover tooltips with task details
- Clean, modern design

## API Integration

The frontend communicates with the FastAPI backend via:

- `POST /api/chat` - Send messages
- `POST /api/generate_report` - Generate project plan
- `GET /api/gantt_data/{plan_id}` - Fetch Gantt data
- `GET /api/report/{plan_id}/csv` - Download CSV

See `lib/api.ts` for implementation.

## Deployment to Vercel

### Option 1: GitHub Integration

1. Push code to GitHub
2. Import project in Vercel dashboard
3. Set environment variables:
   - `NEXT_PUBLIC_API_BASE` = your backend URL
4. Deploy

### Option 2: Vercel CLI

```bash
npm install -g vercel
vercel login
vercel
```

Follow prompts and set environment variables when asked.

### Environment Variables in Vercel

Go to Project Settings → Environment Variables:

```
NEXT_PUBLIC_API_BASE = https://your-backend.onrender.com
NEXT_PUBLIC_ENV = production
```

## Build

```bash
npm run build
npm start
```

## Styling

Uses Tailwind CSS with shadcn's design system. Theme variables are defined in `app/globals.css` and can be customized.

## Security

- API base URL configured via environment variable
- Input validation (max 10,000 characters)
- No sensitive data stored in frontend
- CORS handled by backend

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## Troubleshooting

### Gantt chart not rendering

- Check browser console for errors
- Ensure vis-timeline CSS is loaded
- Verify plan data has valid dates

### API connection failed

- Verify `NEXT_PUBLIC_API_BASE` is set correctly
- Check backend is running
- Verify CORS is configured on backend

### Build errors

- Clear `.next` folder: `rm -rf .next`
- Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`
