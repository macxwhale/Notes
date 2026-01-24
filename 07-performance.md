# Module 7 – API Performance & Optimization

## Module Overview
This module teaches techniques to **optimize API performance** and ensure scalability under real-world load.  
By the end, you’ll understand caching, database optimization, response compression, and monitoring for bottlenecks.

**Goals:**
- Implement caching for faster responses
- Optimize database queries
- Apply response compression
- Monitor performance and bottlenecks
- Understand trade-offs between latency, throughput, and consistency

---

## Lecture Content

### 1. Why Performance Matters
- Poor API performance → bad user experience, increased costs
- Key metrics:
  - **Latency**: Time to respond to a request
  - **Throughput**: Requests per second
  - **Error rate**: Failed requests due to overload

---

### 2. Caching Strategies
- **Client-side caching**: `Cache-Control` headers
- **Server-side caching**: Memory or Redis
- **Partial/fragment caching**: Cache expensive computations
- **ETags**: Conditional requests

**Example: Flask + Flask-Caching**
```python
from flask import Flask, jsonify
from flask_caching import Cache

app = Flask(__name__)
cache = Cache(app, config={"CACHE_TYPE": "SimpleCache"})

@app.route("/expensive")
@cache.cached(timeout=60)
def expensive():
    result = sum(range(10_000_000))  # expensive computation
    return jsonify(result=result)
````

---

### 3. Database Optimization

* **Indexing**: Supercharges `WHERE`, `ORDER BY`, and `JOIN`.
    *   **Compound Indexes**: Index on `(user_id, status)` for queries filtering by both.
* **Explain Analyze**: Use `EXPLAIN ANALYZE SELECT ...` to debug slow queries.
* **Avoid N+1 queries**: Use joins or eager loading.
* **Limit returned fields**: `SELECT id, name` vs `SELECT *`.

**SQLAlchemy Example**

```python
# Eager loading to avoid N+1
users = User.query.options(joinedload(User.posts)).all()
```

---

### 4. Response Compression

* Reduce payload size using gzip or brotli

```python
from flask import Flask
from flask_compress import Compress

app = Flask(__name__)
Compress(app)
```

---

### 5. Pagination & Limits

* Large collections → paginate to reduce payload and server load
* Already covered in REST module; reinforce as performance measure

---

### 6. Monitoring & Profiling

* Use **Flask’s before_request/after_request** to measure response time
* External tools: Prometheus, Grafana, New Relic
* Identify slow endpoints and optimize

**Example:**

```python
from flask import g
import time

@app.before_request
def start_timer():
    g.start = time.time()

@app.after_request
def log_time(response):
    diff = time.time() - g.start
    print(f"{request.path} took {diff:.4f} seconds")
    return response
```

---

### 7. Common Mistakes

* Not caching frequently requested data
* Returning too much data
* Ignoring slow queries
* No monitoring → performance issues go undetected

---

## Flask Code Examples

### Simple Caching Endpoint

```python
from flask import Flask, jsonify
from flask_caching import Cache

app = Flask(__name__)
cache = Cache(app, config={"CACHE_TYPE": "SimpleCache"})

@app.route("/data")
@cache.cached(timeout=120)
def get_data():
    data = {"items": list(range(1000))}
    return jsonify(data)
```

### Gzip Compression

```python
from flask_compress import Compress
Compress(app)
```

### Profiling Response Time

```python
@app.before_request
def start_timer():
    g.start_time = time.time()

@app.after_request
def log_time(response):
    duration = time.time() - g.start_time
    print(f"{request.path} took {duration:.4f}s")
    return response
```

---

## Practical Exercises

### Exercise 1 – Caching

* Implement server-side caching for an **expensive computation endpoint**
* Cache results for 60 seconds

### Exercise 2 – Database Optimization

* Identify an N+1 query in a Flask-SQLAlchemy API
* Refactor using **joinedload or selectinload**

### Exercise 3 – Compression & Pagination

* Enable gzip compression for `/users` endpoint
* Add pagination (`limit` & `offset`) for large collections

### Exercise 4 – Monitoring

* Log request durations using `before_request` and `after_request`
* Identify the slowest endpoint and optimize it

---

## Exercise Solutions

**Server-Side Caching**

```python
@cache.cached(timeout=60)
def expensive_endpoint():
    result = sum(range(10_000_000))
    return jsonify(result=result)
```

**Eager Loading Example**

```python
users = User.query.options(joinedload(User.posts)).all()
```

**Pagination Example**

```python
@app.route("/users", methods=["GET"])
def list_users():
    limit = int(request.args.get("limit", 10))
    offset = int(request.args.get("offset", 0))
    return jsonify(users[offset:offset+limit])
```

---

## Quiz Questions

1. Name three performance optimizations for Flask APIs.
2. Why is caching important, and what types exist?
3. How can N+1 queries affect API performance?
4. What is the purpose of gzip compression?
5. How would you monitor slow endpoints in production?

---

## Mini-Project

**Optimize Blog API**

* Add:

  * Server-side caching for expensive queries
  * Pagination for `/posts` and `/users`
  * Response compression
  * Basic monitoring/logging
* Measure improvement in response times

**Evaluation Criteria**

* Caching implementation: 25%
* Pagination correctness: 25%
* Compression enabled: 20%
* Monitoring & logging: 30%

---

## Interactive Elements

* **Discussion Prompt:** How would you decide which endpoints to cache in a real-world API?
* **Group Activity:** Profile your API under load using simulated requests and identify top 3 slow endpoints.

---

## References

* [Flask-Caching](https://flask-caching.readthedocs.io/)
* [Flask-Compress](https://flask-compress.readthedocs.io/)
* [SQLAlchemy Eager Loading](https://docs.sqlalchemy.org/en/14/orm/loading_relationships.html)
* [API Performance Best Practices](https://www.nginx.com/blog/7-tips-for-optimizing-your-restful-api/)
* [Prometheus + Grafana](https://prometheus.io/docs/visualization/grafana/)