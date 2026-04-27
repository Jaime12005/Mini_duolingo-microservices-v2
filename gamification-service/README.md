# Gamification Service

Microservice that manages XP, streaks and achievements.

Run locally:

```bash
cd gamification-service
npm install
cp .env.example .env
# edit .env to set DB credentials
npm run dev
```

DB: run `migrations/create_tables.sql` against your MySQL database.
