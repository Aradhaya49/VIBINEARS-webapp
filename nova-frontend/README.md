# Nova Frontend

A production-grade, futuristic AI-powered social audio platform frontend.

## Stack

- **React 18** + **TypeScript** + **Vite 5**
- **Tailwind CSS 3** — cyberpunk neon dark theme
- **Framer Motion** — immersive animations
- **Zustand** — global state (auth, chat, social, UI)
- **TanStack Query** — server state + caching
- **React Router v7** — client-side routing
- **Socket.IO / WebSocket** — real-time presence, chat, WebRTC signaling
- **Radix UI** — accessible headless components

## Quick Start

```bash
# 1. Copy env
cp .env.example .env

# 2. Install
npm install

# 3. Start dev server (make sure Django backend is running on :8000)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `VITE_API_URL` | `http://localhost:8000` | Django REST API base URL |
| `VITE_WS_URL` | `ws://localhost:8000` | WebSocket base URL |

## Pages

| Route | Page | Description |
|---|---|---|
| `/` | Landing | Animated hero, features, CTA |
| `/login` | Login | Glassmorphism auth |
| `/register` | Register | Account creation |
| `/dashboard` | Dashboard | Stats, nearby, AI widget |
| `/nearby` | Nearby | User discovery with icebreakers |
| `/chat` | Chat | Real-time messaging |
| `/chat/:id` | Chat Room | Specific conversation |
| `/ai` | AI Assistant | Voice + text AI, memory, translate |
| `/sos` | SOS | Emergency trigger + contacts |
| `/gamification` | VIP | Tiers, badges, orders |
| `/map` | Spatial Map | Geo-tagged voice notes |
| `/memory` | Memory | Semantic memory search |

## Architecture

```
src/
├── components/
│   ├── ui/          # Button, Input, GlassCard, Avatar, Badge, Waveform, etc.
│   └── layout/      # Sidebar, TopBar, AppLayout
├── pages/           # All page components
├── routes/          # Router + ProtectedRoute
├── services/        # API clients (auth, chat, social, ai, sos, gamification, etc.)
├── store/           # Zustand stores (auth, ui, chat, social)
├── hooks/           # useWebSocket, useGeolocation, useVoice
├── types/           # Full TypeScript type definitions
├── utils/           # cn(), format helpers
└── styles/          # globals.css (Tailwind + custom CSS)
```

## Real-time Features

- **WebSocket** auto-connects on login, auto-reconnects with exponential backoff
- **Presence** — online/offline + open-to-talk status updates
- **Chat** — real-time messages + typing indicators
- **Notifications** — connection requests, SOS alerts
- **WebRTC** — signaling support for voice calls

## Design System

### Colors
- Neon Purple `#8B5CF6` — primary
- Electric Blue `#3B82F6` — secondary  
- Neon Pink `#EC4899` — accent
- Cyan Glow `#22D3EE` — online/open
- Gold VIP `#FACC15` — gamification
- Deep Black `#09090B` — background

### Components
- `GlassCard` — glassmorphism cards with optional neon glow
- `Button` — neon/ghost/danger/gold/cyan variants with Framer Motion
- `Avatar` — with online indicator, VIP crown, open-to-talk ring
- `Badge` — colored status badges with pulse animation
- `NeonProgress` — animated gradient progress bars
- `Waveform` — reactive audio visualizer
- `ParticleField` — canvas-based floating particles
- `Skeleton` — shimmer loading states

## Build

```bash
npm run build    # Production build
npm run preview  # Preview production build
```
