# ITUE301 Practical 9 - In-Memory Caching and Query Optimization

## Objective

Implement server-side caching using `node-cache`, cache `GET /tasks` for 60 seconds, invalidate the cache after POST/PUT/DELETE, and compare cached vs uncached API response times.

## Requirements

- Node.js v18+
- npm
- MongoDB running locally OR a MongoDB Atlas connection string
- Postman or Thunder Client

## 1. Install

Open PowerShell in this project folder:

```powershell
npm install
```

## 2. Configure MongoDB

Copy `.env.example` to `.env`.

PowerShell:

```powershell
Copy-Item .env.example .env
```

Default local URI:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/practical9_tasks
```

For MongoDB Atlas, replace `MONGO_URI` with your Atlas connection string.

## 3. Start the server

```powershell
npm start
```

Expected:

```text
MongoDB connected
Server running on http://localhost:5000
```

## 4. Test API

### GET all tasks

```http
GET http://localhost:5000/tasks
```

First request:

```text
CACHE MISS - /tasks
```

Second request within 60 seconds:

```text
CACHE HIT - /tasks
```

### POST task

```http
POST http://localhost:5000/tasks
Content-Type: application/json
```

Body:

```json
{
  "title": "Complete Practical 4 to 10",
  "description": "Implement node-cache",
  "completed": false
}
```

POST invalidates `all_tasks`.

### PUT task

```http
PUT http://localhost:5000/tasks/TASK_ID
Content-Type: application/json
```

Body:

```json
{
  "completed": true
}
```

PUT invalidates the all-tasks and individual-task cache.

### DELETE task

```http
DELETE http://localhost:5000/tasks/TASK_ID
```

DELETE invalidates the cache.

## 5. Response-time experiment

### Uncached

Temporarily comment out the cache check and `cache.set()` in `GET /tasks`.

Send GET /tasks three times and record Postman/Thunder Client response times.

| Test | Uncached |
|---|---:|
| 1 | ____ ms |
| 2 | ____ ms |
| 3 | ____ ms |
| Average | ____ ms |

### Cached

Restore caching.

Send GET /tasks three times.

| Test | Cached |
|---|---:|
| 1 | ____ ms |
| 2 | ____ ms |
| 3 | ____ ms |
| Average | ____ ms |

Use your actual measurements. Do not copy example values.

## 6. Why invalidation is required

If MongoDB is changed but the old cache remains, GET /tasks can return stale data. POST, PUT and DELETE therefore remove the relevant cache entries.

## 7. Why node-cache has a multi-server limitation

node-cache is process-local memory. If multiple Node.js server instances are running, each instance has a separate cache. A shared cache such as Redis would be more appropriate for a multi-instance deployment.

## 8. Important observation

The cache disappears when the Node.js server restarts because node-cache stores values in process memory.

## Viva points

1. Cache hit: requested data exists in cache.
2. Cache miss: requested data is not in cache, so MongoDB is queried.
3. TTL: Time To Live; here it is 60 seconds.
4. Invalidation: removing old cached data after a write.
5. Stable key: `all_tasks` is used for GET /tasks.
6. node-cache is process-local and is not a shared distributed cache.

## Git

```powershell
git init
git add .
git commit -m "Implement Practical 9 in-memory caching"
```
# Practical 10 - Asynchronous Processing with Event-Driven Architecture

## Objective

Implement asynchronous processing using Event-Driven Architecture in the Task Manager application.

## Architecture

The application uses Node.js EventEmitter as an in-process event bus.

Task events:

- task.created
- task.updated
- task.deleted

## Event Flow

Client
↓
Express API
↓
MongoDB
↓
Event Bus
↓
Event Handler
↓
Asynchronous Processing

## Event-Driven Processing

When a task is created, updated, or deleted, the application publishes an event.

The event handler receives the event and performs asynchronous processing without adding the processing logic directly into the task API route.

## Technologies

- Node.js
- Express.js
- MongoDB
- Mongoose
- Node.js EventEmitter
- Async/Await

## Testing

### Create Task

POST /tasks

Example:

{
  "title": "Learn Event Driven Architecture",
  "description": "Implement asynchronous processing",
  "completed": false
}

### Update Task

PUT /tasks/:id

### Delete Task

DELETE /tasks/:id

## Expected Event Logs

EVENT RECEIVED: task.created
Processing task asynchronously
ASYNC PROCESSING COMPLETED

## Advantages

1. Loose coupling
2. Asynchronous processing
3. Better scalability
4. Easier integration
5. Separation of responsibilities