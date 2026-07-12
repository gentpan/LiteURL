# LiteURL

Self-hosted URL shortener with analytics. Single-user, zero-config, SQLite-backed.

## Features

- **Short links** — custom or random aliases, password protection, expiration
- **308 redirect** — permanent redirect with cloaking & OG preview support
- **Analytics** — clicks, visitors, referrers, browsers, devices, countries, time series, heatmap
- **AI slug generation** — optional OpenAI-powered alias suggestions
- **CSV export** — export stats and link data
- **Backup & restore** — JSON snapshot with full DB export
- **i18n** — 10 locales built-in
- **REST API** — full CRUD + analytics endpoints

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | [Hono](https://hono.dev) (Node.js) |
| Frontend | React 19 + TanStack Router + TanStack Query + TanStack Table |
| Styling | Tailwind CSS v4 |
| Charts | Recharts |
| State | Zustand |
| Database | SQLite via better-sqlite3 |
| Validation | Zod |
| Package manager | pnpm (workspaces) |

## Quick Start

```bash
# Clone
git clone https://github.com/gentpan/LiteURL.git
cd LiteURL

# Install
pnpm install

# Configure
cp .env.example packages/api/.env
# Edit packages/api/.env — set SERVER_SITE_TOKEN

# Dev
pnpm dev
```

- **API** → http://localhost:3000
- **Web** → http://localhost:7465

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `SERVER_PORT` | `3000` | API port |
| `SERVER_SITE_TOKEN` | — | Bearer token for auth (required) |
| `SERVER_DB_PATH` | `./data/liteurl.db` | SQLite database path |
| `REDIRECT_STATUS_CODE` | `308` | HTTP status for redirects |
| `REDIRECT_CASE_SENSITIVE` | `false` | Case-sensitive alias matching |
| `NOT_FOUND_REDIRECT` | — | Fallback URL for unknown slugs |
| `AI_API_KEY` | — | OpenAI API key (optional) |
| `AI_MODEL` | `gpt-4o-mini` | Model for slug generation |
| `API_CORS` | `false` | Enable CORS |

## API Reference

All `/api/*` routes require `Authorization: Bearer <token>`.

### Links

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/link/create` | Create short link |
| `POST` | `/api/link/upsert` | Create or update |
| `PUT` | `/api/link/edit` | Edit existing link |
| `POST` | `/api/link/delete` | Delete link |
| `GET` | `/api/link/query?alias=` | Get single link |
| `GET` | `/api/link/list` | List all links |
| `GET` | `/api/link/search?q=` | Search links |
| `GET` | `/api/link/export` | Export as CSV |
| `POST` | `/api/link/import` | Import from CSV |
| `POST` | `/api/link/check` | Batch check aliases |

### Analytics

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/stats/counters?alias=` | Visit/visitor counts |
| `GET` | `/api/stats/metrics?alias=&type=browser` | Top metrics (browser, OS, device, country, referer) |
| `GET` | `/api/stats/views?alias=&unit=day` | Time series data |
| `GET` | `/api/stats/heatmap?alias=` | Hourly/weekday heatmap |
| `GET` | `/api/stats/export?alias=` | Export stats CSV |

### System

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/verify` | Verify token |
| `POST` | `/api/backup` | Download DB backup |
| `POST` | `/api/upload/image` | Upload image |

## Project Structure

```
LiteURL/
├── packages/
│   ├── models/          # Shared Zod schemas, types, utils
│   ├── api/             # Hono backend (server)
│   │   ├── src/
│   │   │   ├── app.ts           # Entry point
│   │   │   ├── core/            # Auth, config, forwarder
│   │   │   ├── db/              # SQLite connection & repos
│   │   │   ├── handlers/        # Route handlers
│   │   │   ├── services/        # Business logic
│   │   │   └── lib/             # Utilities
│   │   └── .env                 # Runtime config
│   └── web/             # React frontend
│       └── src/
│           ├── features/        # Feature modules
│           ├── shared/          # Shared components & utils
│           └── routes.tsx       # Route definitions
├── package.json
├── pnpm-workspace.yaml
└── .env.example
```

## License

MIT
