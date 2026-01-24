# Module 11 – Performance Optimization & Scaling

## Module Overview
Scaling isn't just about adding more servers. It starts with optimized code, efficient database queries, and smart caching strategies. This module covers how to make your Flask API handle thousands of requests per second.

**Goals:**
- Master **Database Optimization** (Indexing, N+1 queries).
- Implement **caching strategies** (Redis, Memoization).
- Use **Asynchronous Tasks** (Celery) for heavy lifting.
- Enable **Gzip/Brotli Compression**.
- Understand **Vertical vs. Horizontal Scaling**.

---

## Lecture Content

### 1. Database Optimization: The #1 Bottleneck
Most performance issues are DB-related.

**Indexes**:
An index is like a book's table of contents. Without it, the DB scans every row.
*   **Good**: Index columns used in `WHERE`, `JOIN`, and `ORDER BY`.
*   **Bad**: Indexing everything (slows down writes).

**N+1 Query Problem**:
Fetching a list of users, then fetching posts for *each* user in a loop.
*   **Fix**: Use `JOIN` or `eager loading` (SQLAlchemy `.options(joinedload(...))`).

### 2. Caching with Redis
Cache data that is read often but changes rarely.

*   **Look-Aside Cache**:
    1. Check Cache.
    2. If miss, fetch from DB.
    3. Write to Cache.
    4. Return to user.
*   **Memoization**: Caching function return values based on arguments.

### 3. Asynchronous Tasks (Celery)
Don't block the HTTP request for long tasks (email sending, report generation).
*   **User Request** → **Add to Queue** → **Return "202 Accepted"**
*   **Worker Process** → **Picks up task** → **Executes in background**

### 4. Horizontal Scaling
*   **Vertical Scaling**: Bigger server (more RAM/CPU). Limited.
*   **Horizontal Scaling**: More servers (Load Balancer + 5 app instances). Unlimited.
    *   **Requires**: Stateless API (No `session` in memory! Use Redis).

---

## Flask Code Examples

### Redis Caching (Manual)
```python
import redis
import json
from flask import Flask, jsonify

app = Flask(__name__)
r = redis.Redis(host='localhost', port=6379, db=0)

def get_product_from_db(pid):
    # Simulate DB call
    return {"id": pid, "name": "Laptop", "price": 1000}

@app.route('/product/<int:pid>')
def get_product(pid):
    # 1. Check Cache
    cache_key = f"product:{pid}"
    cached = r.get(cache_key)
    if cached:
        return jsonify(json.loads(cached)), 200
    
    # 2. Fetch from DB
    data = get_product_from_db(pid)
    
    # 3. Write to Cache (Expire in 60s)
    r.setex(cache_key, 60, json.dumps(data))
    
    return jsonify(data), 200
```

### Offloading to Celery
```python
# tasks.py
from celery import Celery

celery = Celery('tasks', broker='redis://localhost:6379/0')

@celery.task
def send_email_task(email):
    import time
    time.sleep(5)  # Simulate work
    print(f"Email sent to {email}")

# app.py
from flask import Flask, request
from tasks import send_email_task

app = Flask(__name__)

@app.route('/register', methods=['POST'])
def register():
    email = request.json['email']
    # Async call
    send_email_task.delay(email)
    return {"status": "Processing registration"}, 202
```

---

## Practical Exercises

### Exercise 1 – N+1 Hunter
* Create a route that fetches `Users` and their `Posts`.
* Observe the SQL queries (set `SQLALCHEMY_ECHO=True`).
* Fix the N+1 problem using `joinedload`.

### Exercise 2 – The Cache Layer
* Implement a `@cache` decorator using Redis.
* Apply it to a "slow" endpoint (simulate delay with `time.sleep`).
* Verify that the second request is instant.

### Exercise 3 – Compression
* Enable Gzip compression using `Flask-Compress`.
* Compare the response size of a large JSON payload (e.g., 1000 items) with and without compression.

---

## Mini-Project

**High-Performance Catalog API**
* **Scenario**: A product catalog accessed by millions of users.
* **Requirements**:
    *   `GET /products`: Returns list, Cached for 60 seconds.
    *   `POST /products`: Invalidates the cache.
    *   `POST /report`: Triggers a Celery task to generate a CSV report (simulated).
    *   **Performance Goal**: `GET /products` must respond in < 20ms (after cache warmup).
* **Tools**: Flask, Redis, Celery.

**Evaluation Criteria:**
* Cache logic is correct (invalidation working): 40%
* Async task implementation: 30%
* Code efficiency: 30%

---

## References
- [Redis Crash Course](https://redis.io/docs/manual/)
- [Celery First Steps](https://docs.celeryq.dev/en/stable/getting-started/first-steps-with-celery.html)
- [SQLAlchemy Performance](https://docs.sqlalchemy.org/en/14/topical_index.html#performance)
