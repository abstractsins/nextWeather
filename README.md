# NextWeather

NextWeather is a Next.js weather app that:
- detects your location (or accepts custom coordinates),
- fetches current weather from OpenWeather,
- reverse-geocodes place names with Geoapify,
- generates a concise weather summary through an assistant endpoint.

## Tech stack

- Next.js 15 (App Router)
- React 19 + TypeScript
- pnpm (declared package manager)

## Requirements

- Node.js 22.x (see `engines` in `package.json`)
- pnpm 10+
- Use pnpm for dependency and lockfile management in this repository.

## Environment variables

Create a `.env.local` file in the repository root with:

```env
OPENWEATHER_API_KEY=your_openweather_key
OPENWEATHER_AI_URL=assistant_service_endpoint
GEOAPIFY_API_KEY=your_geoapify_key
```

## Local development

```bash
pnpm install
pnpm dev
```

Open `http://localhost:3000`.

## Scripts

- `pnpm dev` - start local dev server
- `pnpm build` - create production build
- `pnpm start` - run production build
- `pnpm lint` - run ESLint

## Project structure

- `app/` - routes, API handlers, and global styles
- `components/` - UI building blocks
- `hooks/` - data and state orchestration
- `providers/` - React context providers
- `types/` - shared TypeScript types
- `utils/` - presentation and weather helpers
