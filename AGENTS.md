# AGENTS.md - Notaire As A Service

Guidelines for AI agents working in this repository.

## Project Overview

French estate planning application using React, TypeScript, Vite, and Cloudflare Pages. 
The app uses Gemini AI to analyze user situations and suggest optimized wealth transmission strategies.

**Language:** UI and business logic are in French. Code comments can be in English or French.

## Build & Development Commands

```bash
# Install dependencies
npm install

# Development (runs both Vite build watcher and Wrangler dev server)
npm run dev

# Production build
npm run build

# Preview production build locally
npm run preview

# Test the chat API endpoint
npm run test:api
```

**Note:** No test runner (Jest/Vitest) or linter (ESLint) is currently configured.

## Architecture

- **Frontend:** React 19 + TypeScript + Vite
- **Backend:** Cloudflare Pages Function at `functions/api/chat.ts`
- **Styling:** Tailwind CSS with custom brand colors (`brand-navy`, `brand-accent`)
- **Deployment:** Cloudflare Pages with `dist/` as output directory
- **Icons:** Lucide React

## Code Style Guidelines

### TypeScript

- Use strict TypeScript with explicit types
- Define interfaces in `types.ts` for all data structures
- Use PascalCase for types/interfaces, camelCase for variables/functions
- Constants use UPPER_SNAKE_CASE

### Imports

- React imports first
- Third-party libraries next
- Local imports last (use `@/` path alias for root-relative imports)
- Example:
```typescript
import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { UserSituation } from '@/types';
```

### Components

- Use functional components with React.FC typing
- Props interfaces named with `Props` suffix (e.g., `QuestionnaireProps`)
- Prefer `useCallback` and `useMemo` for performance optimization
- Components go in `/components/` directory

### Error Handling

- Use custom error classes (see `GeminiAPIError`, `ValidationError` in services)
- Always validate user input before API calls
- Handle network timeouts with AbortController
- Display user-friendly error messages in French

### Security

- **NEVER** commit API keys or secrets
- Server-side API calls only in Cloudflare Functions
- Sanitize user input to prevent injection (see `sanitizeInput()` in chat.ts)
- Environment variables (server-side only):
  - `GEMINI_API_KEY` (required) - Your Google AI Studio API key
  - `GEMINI_MODEL` (optional) - Gemini model to use (default: gemini-3-flash-preview)
  - `ALLOWED_ORIGINS` (optional) - Comma-separated list of allowed CORS origins

### File Organization

```
├── components/       # React components
├── services/         # Business logic & API calls
├── utils/           # Helper functions & data
├── functions/api/   # Cloudflare Pages Functions
├── docs/            # Documentation (DEPLOYMENT.md, README.md, etc.)
├── types.ts         # TypeScript type definitions
├── index.html       # Entry HTML
└── src/styles.css   # Compiled Tailwind CSS with custom styles
```

### Naming Conventions

- Components: PascalCase (e.g., `FeeSimulator.tsx`)
- Services: camelCase with descriptive names (e.g., `geminiService.ts`)
- Utilities: camelCase (e.g., `feeCalculator.ts`)
- Types: PascalCase with descriptive names

### Styling

- Use Tailwind CSS utility classes exclusively
- Custom brand colors: `brand-navy` (primary), `brand-accent` (cyan highlight)
- Responsive design with `md:`, `lg:` prefixes
- Glass morphism effects: `glass-card` class

## Environment Setup

Create `.env.local` for local development:
```
GEMINI_API_KEY=your_api_key_here
```

Optional: Configure a different Gemini model in Cloudflare Pages dashboard:
```
GEMINI_MODEL=gemini-1.5-pro  # Options: gemini-1.5-pro, gemini-1.5-flash, gemini-2.0-flash-exp
```

**Never commit `.env.local` or `.dev.vars`** - they are in `.gitignore`.

## Testing

Since there's no test framework, verify changes by:
1. Running `npm run dev` and testing manually
2. Using `npm run test:api` to verify the chat endpoint
3. Building with `npm run build` to catch TypeScript errors

### Regular API Testing

Agents should test the API regularly, especially after making changes to:
- `functions/api/chat.ts` (API endpoint)
- `services/geminiService.ts` (API client)
- Environment variables or configuration

Run the API test to ensure:
- Gemini API connectivity works
- Response parsing is correct
- Error handling functions properly
- CORS headers are configured correctly

```bash
# Test the chat API endpoint
npm run test:api
```

If the API test fails, check:
1. `GEMINI_API_KEY` is set in `.env.local`
2. Wrangler dev server is running (`npm run dev`)
3. The Gemini model configured in environment variables is available

### UI Validation with Chrome DevTools

**ALWAYS validate UI changes automatically using Chrome DevTools MCP after making modifications to components, styling, or layout.**

Validation steps:
1. Run `npm run dev` to start the development server
2. Wait for the server to be ready on `http://localhost:8788`
3. Navigate to the application using Chrome DevTools
4. Take a screenshot to verify visual appearance
5. Check console for any errors or warnings
6. Test interactive elements (forms, buttons, navigation)

What to validate:
- Layout renders correctly without overflow or broken elements
- All interactive components are functional (buttons, inputs, selects)
- No console errors or warnings
- Responsive design works on different viewports
- Custom brand colors (`brand-navy`, `brand-accent`) display correctly
- Glass morphism effects (`glass-card`) render properly

Example workflow:
```bash
# Terminal 1: Start dev server
npm run dev

# Terminal 2: Use Chrome DevTools MCP to validate
# - Navigate to http://localhost:8788
# - Take screenshot
# - Check console messages
# - Verify interactive elements
```

**Note:** Chrome DevTools MCP requires a running dev server. Always start `npm run dev` before attempting UI validation.

## Important Constraints

- Maximum prompt length: 50,000 characters (enforced in chat.ts)
- Maximum request size: 100KB
- API timeout: 30 seconds (client), 60 seconds (server)
- Target: ES2022, modern browsers only
