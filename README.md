# SkillSphere API — Day 25: Testing & Deployment

A production-ready REST API for an online learning platform, featuring full CRUD on courses and users, unit tests, integration tests, and deployment configuration.

---

## Project Structure

```
skillsphere/
├── app.js                          # Express app (no listen — importable for tests)
├── server.js                       # Entry point (reads PORT from env)
├── Procfile                        # Heroku/Render deployment
├── .env.example                    # Environment variable template
├── package.json
│
├── routes/
│   ├── courses.js                  # GET/POST/PUT/DELETE /api/courses
│   └── users.js                    # GET/POST/PUT/DELETE /api/users + enroll
│
├── models/
│   ├── courseStore.js              # In-memory course data store
│   └── userStore.js                # In-memory user data store
│
├── middleware/
│   └── validate.js                 # Request body validation middleware
│
└── test/
    ├── courses.test.js             # Challenge 1 — Unit Tests (Mocha + Chai)
    └── users.integration.test.js   # Challenge 2 — Integration Tests (SuperTest)
```

---

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Copy and fill environment variables
cp .env.example .env

# 3. Run in development
npm run dev

# 4. Run in production
npm start
```

---

## Challenge 1 — Unit Tests (Mocha + Chai)

Tests every `/api/courses` route in isolation. The store is reset before each test for full isolation.

### Coverage
| Route                 | Tests |
|-----------------------|-------|
| GET /api/courses      | Filter by category, count, required fields |
| GET /api/courses/:id  | Found, 404 not found, correct shape |
| POST /api/courses     | Create, persist, missing fields, negative price, negative duration |
| PUT /api/courses/:id  | Update fields, preserve untouched fields, 404 |
| DELETE /api/courses/:id | Delete, verify gone, count reduced, 404 |
| GET /status           | Returns "App is live" |
| Unknown routes        | Returns 404 |

```bash
# Run unit tests only
npm run test:unit

# Run all tests
npm test

# Run with coverage report
npm run test:coverage
```

---

## Challenge 2 — Integration Tests (SuperTest)

Simulates real HTTP requests through the **full middleware stack** (helmet, cors, compression, express.json, validateUser). Tests interactions between routes, middleware, and the data layer.

### Coverage
| Scenario | What's verified |
|---|---|
| GET /api/users | Middleware headers, shape, count |
| POST /api/users | Validation middleware, duplicate email, role checks |
| PUT/DELETE | 200 success, 404 not found |
| POST /api/users/:id/enroll | Cross-resource (Users + Courses), 409 duplicate, 404 missing |
| Full lifecycle | Create → Read → Update → Delete end-to-end |

```bash
# Run integration tests only
npm run test:integration
```

---

## Challenge 3 — Deployment

### Deploy to Render

1. Push this repo to GitHub
2. Go to [render.com](https://render.com) → New → Web Service
3. Connect your GitHub repo
4. Set:
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js` (or Render reads the `Procfile` automatically)
5. Add environment variable: `NODE_ENV=production`
6. Deploy → visit `https://your-app.onrender.com/status`

### Deploy to Heroku

```bash
heroku create skillsphere-api
git push heroku main
heroku open /status
```

### Verify Deployment

```
GET /status  →  { "message": "App is live" }
```

---

## API Endpoints

### Courses

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/courses | Get all courses (optional ?category=) |
| GET | /api/courses/:id | Get course by ID |
| POST | /api/courses | Create a new course |
| PUT | /api/courses/:id | Update a course |
| DELETE | /api/courses/:id | Delete a course |

### Users

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/users | Get all users |
| GET | /api/users/:id | Get user by ID |
| POST | /api/users | Create a new user |
| PUT | /api/users/:id | Update a user |
| DELETE | /api/users/:id | Delete a user |
| POST | /api/users/:id/enroll | Enroll user in a course |

### Misc

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /status | Health check — returns `{ message: "App is live" }` |

---

## Best Practices Applied (Day 25)

- **CI/CD ready** — `npm test` runs all suites; drop into GitHub Actions with zero config
- **Environment variables** — `PORT` and all secrets read from `.env` via `dotenv`
- **gzip compression** — `compression` middleware enabled on all responses
- **Security headers** — `helmet` middleware applied globally
- **Process management** — compatible with PM2 (`pm2 start server.js`) and Docker
- **Test isolation** — store reset in `beforeEach` ensures tests never bleed into each other
