### `11-performance-scaling.md`

```markdown
# Module 11 – Performance Optimization & Scaling

## Module Overview
Learn techniques for **scaling your API and optimizing performance**.

**Goals:**
- Implement caching with Redis
- Optimize database queries
- Use response compression
- Use async endpoints for long-running tasks

---

## Lecture Content

### 1. Redis Caching
```python
from flask_caching import Cache
cache = Cache(app, config={"CACHE_TYPE": "RedisCache"})
````

### 2. Database Optimization

* Indexes, query optimization, eager loading

### 3. Response Compression

* `Flask-Compress` to gzip responses

### 4. Async Endpoints

* Flask + Celery for long-running tasks

### 5. Common Mistakes

* No caching → slow queries
* Blocking synchronous operations
* Ignoring DB indexing

---

## Exercises

1. Cache `/products` endpoint using Redis
2. Add compression to large payload endpoints
3. Optimize `/users` queries using eager loading

---

## Mini-Project

**Scalable API**

* Redis caching, compression, DB optimization
* Evaluation: Caching (30%), DB optimization (40%), Compression (30%)

---

## References

* [Flask-Caching](https://flask-caching.readthedocs.io/)
* [Flask-Compress](https://flask-compress.readthedocs.io/)
* [Celery + Flask](https://docs.celeryq.dev/en/stable/django/first-steps-with-flask.html)

````
