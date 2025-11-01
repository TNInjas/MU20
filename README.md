# Lumos

A Next.js application with Flask backend integration.

## Getting Started

### Installation

```bash
npm install
```

### Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000
```

## Project Structure

```
lumos/
├── app/                    # Next.js App Router
│   ├── dashboard/         # Dashboard page
│   ├── progress/          # Progress page
│   ├── surplus/           # Surplus page
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Landing page
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── navigation/        # Navigation components
│   └── ui/                # UI components
├── lib/                   # Utilities and helpers
│   ├── api/              # API client for Flask backend
│   └── utils.ts          # Utility functions
└── types/                # TypeScript type definitions
```

## Pages

- **Landing Page** (`/`) - Home page
- **Dashboard** (`/dashboard`) - Dashboard page
- **Progress** (`/progress`) - Progress tracking page
- **Surplus** (`/surplus`) - Surplus management page

## Backend Integration

The app is configured to work with a Flask backend. Configure the API base URL in `.env.local` using `NEXT_PUBLIC_API_BASE_URL`.

The API client is available at `lib/api/client.ts` and can be used throughout the application:

```typescript
import { apiClient } from '@/lib/api/client';

// GET request
const data = await apiClient.get('/api/endpoint');

// POST request
const result = await apiClient.post('/api/endpoint', { data });
```

## Tech Stack

- **Next.js 16** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **React 19** - UI library
