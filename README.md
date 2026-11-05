# CodeMates

CodeMates is a focused developer network for finding collaborators, sharing what you build, and growing your connections. Browse a feed of developers, send and accept connection requests, chat with your connections, and keep your profile up to date.

This repository contains the CodeMates web client, built with React and Vite. It talks to the CodeMates backend API using cookie-based authentication.

## Features

- **Developer feed** — discover developers filtered by the skills you care about.
- **Connection requests** — review incoming requests and accept or pass in one click.
- **Connections** — keep every accepted connection in one place.
- **Chat** — continue the conversation with your connections.
- **Profiles** — view your profile and edit your details, skills, and photo.

## Tech stack

- React 19
- Vite
- Redux Toolkit + React Redux
- React Router
- Tailwind CSS + daisyUI
- Axios

## Getting started

### Prerequisites

- Node.js 20 or newer
- The CodeMates backend API running locally

### Install and run

```bash
npm install
npm run dev
```

The development server starts on the URL printed by Vite (typically `http://localhost:5173`).

### Environment variables

The client reads the backend URL from the `VITE_BASE_URL` environment variable.

- Local development: put `VITE_BASE_URL=http://localhost:3000` in `.env`.
- Production: `.env.production` points at `https://codemate-wn1u.onrender.com`.
  If `VITE_BASE_URL` is missing (or accidentally set to localhost) in a
  production build, the app falls back to that Render URL instead of sending
  requests to the visitor's machine.

The Render backend must allow the deployed frontend origin in its CORS
configuration (with credentials enabled), otherwise the browser blocks every
request before it reaches the API.

## Available scripts

| Script | Description |
| --- | --- |
| `npm run dev` | Start the Vite development server. |
| `npm run build` | Create a production build in `dist/`. |
| `npm run preview` | Preview the production build locally. |
| `npm run lint` | Run Oxlint over the project. |

## Project structure

```text
src/
  component/       Pages and UI components (feed, connections, requests, chat, profile)
  component/ui/    Shared UI primitives such as Logo, Avatar, and PageHeader
  utils/           Redux store and slices, API helpers, and shared constants
public/            Static assets, including the favicon
index.html         App shell, metadata, and browser tab title
```

## License

This project is intended for learning and personal use.
