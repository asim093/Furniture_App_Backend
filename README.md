# Furniture Worker Management – Backend

Node.js + Express + MongoDB API for the Furniture Worker Management app.

## Setup

1. Install dependencies:
   ```bash
   cd Backend && npm install
   ```

2. Copy environment file and set variables:
   ```bash
   copy .env.example .env
   ```
   Edit `.env` and set:
   - `MONGODB_URI` – MongoDB connection string (default: `mongodb://localhost:27017/furniture_workers`)
   - `JWT_SECRET` – Secret for JWT (use a strong value in production)
   - `PORT` – Server port (default: 4000)

3. Create admin user (after MongoDB is running):
   ```bash
   npm run seed
   ```
   Default admin: **name** `admin`, **password** `admin123`. Change in production.

4. Start server:
   ```bash
   npm run dev
   ```
   API runs at `http://localhost:4000`.

## API Endpoints

- `POST /api/auth/login` – Body: `{ "name", "password" }` → `{ token, user }`
- `GET /api/workers` – List workers (admin)
- `POST /api/workers` – Create worker (admin). Body: `{ name, previousAdvanceBalance? }`
- `GET /api/weeks` – List weeks
- `POST /api/weeks` – Create week (admin). Body: `{ startDate, endDate, label? }`
- `GET /api/worksheets?weekId=&workerId=` – List worker sheets (worker: only own)
- `GET /api/worksheets/:id` – Get one sheet
- `POST /api/worksheets` – Create sheet (admin). Body: `{ weekId, workerId, ... }`
- `PATCH /api/worksheets/:id` – Update sheet (admin). Body: items, extraPay, advanceThisWeek, deductions, note
- `POST /api/worksheets/:id/extra-pay` – Add extra pay (admin). Body: `{ amount, note? }`

All routes except `/api/auth/login` require header: `Authorization: Bearer <token>`.

## Net Pay

`netPay = itemsTotal + extraPayTotal - advanceThisWeek - deductions`

Items total = sum of (pricePerItem × quantity) for each item.
