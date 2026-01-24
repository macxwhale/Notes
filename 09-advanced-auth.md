## `09-advanced-auth.md` – Advanced Authentication & Authorization

````markdown
# Module 9 – Advanced Authentication & Authorization

## Module Overview
This module builds on JWT basics (Module 5) to cover **production-ready authentication and authorization**: OAuth2, refresh tokens, role & scope management, and token revocation.

**Goals:**
- Implement OAuth2 flows for web apps and services
- Use JWT with short-lived access + refresh tokens
- Enforce role- and scope-based access control
- Handle token revocation and rotation
- Secure API endpoints in production

---

## Lecture Content

### 1. OAuth2 Flows Overview
- **Authorization Code Flow** → standard web apps
- **Client Credentials Flow** → service-to-service
- **Refresh Token Flow** → issue new access tokens without login
- Libraries: [`Authlib`](https://docs.authlib.org/) for Flask

### 2. Refresh Tokens
- Access tokens: short-lived (e.g., 15 min)
- Refresh tokens: long-lived (e.g., 7 days)
- Store refresh tokens securely (DB with hashed value)
- Endpoint example:
```python
@app.route("/token/refresh", methods=["POST"])
@jwt_required(refresh=True)
def refresh():
    identity = get_jwt_identity()
    new_access = create_access_token(identity=identity)
    return jsonify(access_token=new_access)
````

### 3. Role & Scope Enforcement

* Roles: admin, user, moderator
* Scopes: granular permissions (`read:users`, `write:products`)
* Example decorator:

```python
def require_role(role):
    def decorator(f):
        @wraps(f)
        def wrapper(*args, **kwargs):
            identity = get_jwt_identity()
            if identity["role"] != role:
                return jsonify({"msg": "Forbidden"}), 403
            return f(*args, **kwargs)
        return wrapper
    return decorator
```

### 4. Token Revocation & Blacklisting

* Use Redis or DB to blacklist compromised tokens
* Example with `flask-jwt-extended`:

```python
BLACKLIST = set()

@jwt.token_in_blocklist_loader
def check_if_token_revoked(jwt_header, jwt_payload):
    return jwt_payload["jti"] in BLACKLIST
```

### 5. Common Mistakes

* Hardcoding secrets or tokens
* Ignoring token expiration
* Using long-lived access tokens without refresh flow
* Not validating scopes or roles

---

## Exercises

1. Implement **refresh tokens** for `/login` endpoint
2. Add **role-based access** to `/admin` endpoints
3. Implement **token revocation** in Redis

---

## Mini-Project

**Secure Service API**

* Endpoints:

  * `/login` → JWT + refresh
  * `/admin` → role-restricted
  * `/refresh` → refresh access tokens
* Evaluate:

  * Refresh token logic: 30%
  * Role enforcement: 30%
  * Token revocation: 40%

---

## References

* [Flask-JWT-Extended Docs](https://flask-jwt-extended.readthedocs.io/)
* [Authlib OAuth2](https://docs.authlib.org/)
* [OAuth2 RFC 6749](https://www.rfc-editor.org/rfc/rfc6749)

````

---

## `10-api-monitoring.md` – Monitoring, Logging & Observability

```markdown
# Module 10 – API Monitoring, Logging & Observability

## Module Overview
This module teaches **how to monitor, log, and analyze API performance and errors** for production readiness.

**Goals:**
- Implement structured logging
- Monitor endpoint latency, error rates
- Integrate with Prometheus/Grafana
- Set up alerting for failures
- Understand observability best practices

---

## Lecture Content

### 1. Structured Logging
- Use JSON logs for easy ingestion
```python
import logging, json

logger = logging.getLogger("api")
logging.basicConfig(level=logging.INFO)

logger.info(json.dumps({"event": "user_created", "user_id": 123}))
````

### 2. Performance Monitoring

* Flask before_request / after_request timers
* Track latency, throughput
* Example:

```python
from flask import g, request
import time

@app.before_request
def start_timer():
    g.start = time.time()

@app.after_request
def log_duration(response):
    duration = time.time() - g.start
    logger.info(json.dumps({"path": request.path, "duration": duration}))
    return response
```

### 3. Integration with Prometheus

* Use `prometheus-flask-exporter`

```python
from prometheus_flask_exporter import PrometheusMetrics
metrics = PrometheusMetrics(app)
```

### 4. Error Tracking

* Track exceptions with Sentry or custom logging
* Example:

```python
try:
    risky_operation()
except Exception as e:
    logger.error(json.dumps({"error": str(e)}))
```

### 5. Common Mistakes

* Ignoring error logs
* Logging sensitive data
* No alerting for failures
* No metrics on performance

---

## Exercises

1. Add structured logging for all endpoints
2. Implement request duration monitoring
3. Integrate basic Prometheus metrics for `/users` and `/products`
4. Simulate a failure and ensure it is logged correctly

---

## Mini-Project

**Observability API**

* Implement logging, metrics, and error tracking for Mid-Course API
* Evaluate:

  * Logging format: 30%
  * Metrics collection: 30%
  * Error tracking: 40%

---

## References

* [Prometheus Flask Exporter](https://github.com/rycus86/prometheus_flask_exporter)
* [Sentry for Python](https://docs.sentry.io/platforms/python/flask/)
* [Structured Logging Best Practices](https://www.loggly.com/ultimate-guide/python-logging-basics/)

````

---

## `11-performance-scaling.md` – Performance Optimization & Caching

```markdown
# Module 11 – Performance Optimization & Caching

## Module Overview
Advanced scaling techniques: caching strategies, database optimization, async endpoints, and CDN integration.

**Goals:**
- Implement Redis/memcached caching
- Optimize database queries
- Use response compression and async endpoints
- Understand CDN and edge caching
- Load test APIs for performance

---

## Lecture Content

### 1. Redis Caching
- Cache expensive DB queries
```python
from flask_caching import Cache
cache = Cache(app, config={"CACHE_TYPE": "RedisCache"})
````

### 2. Database Optimization

* Use indexes, query optimization, batch operations
* Avoid N+1 queries with joins/eager loading

### 3. Response Compression

* `Flask-Compress` to gzip responses

### 4. Async Endpoints

* Flask + Celery for long-running tasks

```python
@app.route("/export")
def export():
    task = export_data.delay()
    return jsonify({"task_id": task.id})
```

### 5. Common Mistakes

* No caching → redundant queries
* Large payloads without compression
* Blocking synchronous operations
* Ignoring DB indexing

---

## Exercises

1. Cache `/products` endpoint using Redis
2. Add compression to large payload endpoints
3. Optimize `/users` query with eager loading

---

## Mini-Project

**Scalable API**

* Redis caching, compression, DB optimization
* Evaluate:

  * Caching correctness: 30%
  * DB optimization: 40%
  * Compression: 30%

---

## References

* [Flask-Caching](https://flask-caching.readthedocs.io/)
* [Flask-Compress](https://flask-compress.readthedocs.io/)
* [Celery + Flask](https://docs.celeryq.dev/en/stable/django/first-steps-with-flask.html)

````

---

## `12-multitenancy-advanced.md` – Multi-Tenant API Design & Versioning

```markdown
# Module 12 – Multi-Tenant API Design & Versioning

## Module Overview
Advanced multi-tenant and versioned API design for SaaS: isolation, scaling, and backward compatibility.

**Goals:**
- Multi-tenancy strategies (shared DB, schema-per-tenant, DB-per-tenant)
- Versioning endpoints (URI, headers)
- Tenant-aware authentication
- Backward compatibility for multiple tenants
- Scaling multi-tenant APIs

---

## Lecture Content

### 1. Multi-Tenant Patterns
| Pattern | Pros | Cons |
|---------|------|-----|
| DB-per-tenant | Strong isolation | High operational cost |
| Schema-per-tenant | Moderate isolation | More DB maintenance |
| Shared DB + tenant_id | Simple | Risk of data leakage |

### 2. Tenant-Aware JWT
- Include `tenant_id` in token claims
```python
identity = {"username": "alice", "tenant_id": 123}
access_token = create_access_token(identity=identity)
````

### 3. Versioned Endpoints

* Maintain multiple API versions for tenants
* Example: `/v1/tenant/<tenant_id>/users` and `/v2/...`

### 4. Common Mistakes

* Shared DB without strict isolation → data leaks
* Breaking old tenants with new API version
* Hardcoding tenant logic in endpoints

---

## Exercises

1. Implement multi-tenant `users` endpoint with header or subdomain routing
2. Include tenant_id in JWT and enforce access control
3. Version endpoints while keeping backward compatibility

---

## Mini-Project

**Multi-Tenant SaaS API**

* Tenants: `tenant1` and `tenant2`
* Versioned `/users` endpoint
* JWT authentication includes tenant_id
* Tenant isolation enforced

**Evaluation Criteria**

* Tenant isolation: 40%
* Versioned API: 30%
* Security: 30%

---

## References

* [Multi-Tenant SaaS Patterns](https://martinfowler.com/articles/multi-tenant.html)
* [JWT Best Practices](https://www.rfc-editor.org/rfc/rfc7519)
* [OWASP API Security](https://owasp.org/www-project-api-security/)

```
