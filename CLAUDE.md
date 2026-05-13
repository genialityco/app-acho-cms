# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## About

Admin CMS for ACHO (Asociación Colombiana de Hematología y Oncología). A React web app that manages events, agendas, speakers, posters, members, notifications, surveys, and more. Talks to the same backend as the mobile app (`https://lobster-app-uy9hx.ondigitalocean.app`).

## Commands

```bash
# Dev server
npm run dev

# Type-check + build
npm run build

# Build ignoring TS errors (used when types are temporarily broken)
npm run build_ignore_errors
```

There is no test suite in this repo.

## Architecture

### Framework: Refine + Mantine v6

The app uses [Refine](https://refine.dev/) (`@refinedev/core`) as the data/routing framework with Mantine v6 as the UI library. All CRUD pages are built with Refine hooks (`useList`, `useOne`, `useForm`, `useTable`) — do not call the backend directly from pages; go through the Refine data provider hooks.

### Data Provider

`src/components/dataProvider/customGenRestDataProvider.ts` wraps `@refinedev/simple-rest` with backend-specific adaptations:

- **`getList`**: Translates Refine pagination/filter/sorter params into the backend's query format (`pageSize`, `current`, `filters[i][field/operator/value]`, `sorters[i][field/order]`). Returns `{ data: items[], total: totalItems }`.
- **`getOne`**: Unwraps the backend's `response.data.data` nesting.
- **`create` / `update` / `deleteOne`**: Mostly delegates to `simple-rest` with minor response unwrapping.
- **Special case**: `update` on resource `"notifications/send-from-template"` fires a `POST` to send the notification instead of a `PUT`.

The base URL is hardcoded in this file. To switch to local dev: change `API_URL` to `http://localhost:3000`.

### Auth

Auth is a mock in `src/App.tsx` — it only checks that the email matches `recertificacion@acho.com.co` and stores it in `localStorage`. There is no real backend authentication.

### Page structure

Each resource under `src/pages/<resource>/` exports its CRUD components from `index.ts`:

```
src/pages/<resource>/
  index.ts        # re-exports list, create, edit, show
  list.tsx
  create.tsx
  edit.tsx
  show.tsx
```

All resources are registered in `src/App.tsx` under the `resources` array of `<Refine>`.

### Rich text / file uploads

- Long-form descriptions use `@uiw/react-md-editor` or `react-quill`.
- Image uploads go to Firebase Storage via the backend's `/upload` endpoint (proxied through the custom data provider or called with `axios` directly in form pages).

### Types

`src/types/eventTypes.ts` defines `EVENT_TYPE_LABELS` — the canonical list of event type values used in event create/edit forms.
