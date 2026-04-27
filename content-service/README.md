# Content Service

Endpoints under `/api/v1/content`:

- `POST /units` - create unit
- `GET /units` - list units
- `POST /lessons` - create lesson
- `GET /units/:unitId/lessons` - lessons by unit
- `POST /exercises` - create exercise
- `GET /lessons/:lessonId/exercises` - exercises by lesson
- `POST /exercises/:exerciseId/validate` - validate answer

Run:

1. Copy `.env.example` to `.env` and set DB credentials.
2. `npm install`
3. `npm run dev`
