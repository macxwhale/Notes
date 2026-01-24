### `final-capstone-project.md`

```markdown
# Final Capstone Project – Production-Grade Multi-Tenant API

## Project Overview
This project consolidates **all course modules (1–12)** into a single, production-ready API system.  
Learners will implement **authentication, versioning, multi-tenancy, caching, performance optimization, monitoring, and error handling** using Flask.

**Project Goal:** Build a **multi-tenant SaaS API** for **users, products, and orders**, with proper security, performance, and monitoring.

---

## Project Requirements

### Endpoints

#### Users
- `POST /api/v1/users` → create user
- `GET /api/v1/users/<id>` → retrieve user
- `GET /api/v1/users` → list users

#### Products
- `POST /api/v1/products` → create product
- `GET /api/v1/products/<id>` → retrieve product
- `GET /api/v1/products` → list products

#### Orders
- `POST /api/v1/orders` → create order
- `GET /api/v1/orders/<id>` → retrieve order
- `GET /api/v1/orders` → list orders

---

## Advanced Features

### 1. Multi-Tenancy
- Each tenant isolated using:
  - Header: `X-Tenant-ID`
  - Optional subdomain support
- Tenant-aware JWT tokens (`tenant_id` in claims)

### 2. Authentication & Authorization
- JWT access + refresh tokens
- Role-based access (`admin`, `user`)
- Scopes per endpoint (`read:users`, `write:orders`)

### 3. Versioning
- URI versioning (`/v1`, `/v2`)
- Schema evolution: v2 adds optional fields
- Backward compatibility with v1

### 4. Performance & Caching
- Redis caching for `/products` and `/orders`
- Response compression with `Flask-Compress`
- Database query optimization (indexes, eager loading)
- Pagination for collection endpoints

### 5. Monitoring & Logging
- Structured logging (JSON)
- Request duration logging
- Prometheus metrics for request counts, latency, and errors
- Optional Sentry integration for error tracking

### 6. Input Validation & Error Handling
- Marshmallow schemas for all endpoints
- Structured error responses:
  - `ValidationError` → 400
  - `NotFound` → 404
  - `Unauthorized` → 401
  - `Forbidden` → 403

---

## Project Structure
```

final_capstone_api/
├── app/
│   ├── **init**.py          # Application factory
│   ├── users/
│   │   ├── routes.py
│   │   ├── schemas.py
│   │   └── models.py
│   ├── products/
│   │   ├── routes.py
│   │   ├── schemas.py
│   │   └── models.py
│   ├── orders/
│   │   ├── routes.py
│   │   ├── schemas.py
│   │   └── models.py
│   ├── auth/
│   │   ├── routes.py
│   │   └── utils.py
│   └── utils.py
├── config.py
├── requirements.txt
├── run.py
└── .env

````

---

## Practical Exercises

1. Implement tenant-aware endpoints for **users, products, and orders**
2. Add JWT authentication + refresh tokens
3. Enforce role-based access and scopes
4. Implement caching and compression
5. Enable structured logging and Prometheus metrics
6. Add versioned schemas (v1, v2)
7. Test endpoints using Postman / pytest

---

## Project Solutions (Example Snippets)

### Multi-Tenant JWT
```python
identity = {"username": "alice", "tenant_id": 123, "role": "admin"}
access_token = create_access_token(identity=identity)
````

### Redis Caching Example

```python
from flask_caching import Cache
cache = Cache(app, config={"CACHE_TYPE": "RedisCache", "CACHE_REDIS_URL": "redis://localhost:6379/0"})

@app.route("/products")
@cache.cached(timeout=120, query_string=True)
def list_products():
    products = Product.query.all()
    return ProductSchema(many=True).dump(products)
```

### Role-Based Decorator

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

### Prometheus Metrics

```python
from prometheus_flask_exporter import PrometheusMetrics
metrics = PrometheusMetrics(app)
```

---

## Evaluation Criteria

| Criterion                           | Weight |
| ----------------------------------- | ------ |
| Multi-tenancy implementation        | 20%    |
| Authentication & role enforcement   | 20%    |
| Versioning & backward compatibility | 15%    |
| Performance optimization & caching  | 15%    |
| Structured logging & metrics        | 15%    |
| Validation & error handling         | 15%    |

---

## Interactive Elements

* **Discussion Prompt:** How would you design this API to handle **100k+ tenants** in production?
* **Group Activity:** Split tenants into test groups, simulate data leaks, and verify isolation.
* **Challenge:** Add **rate limiting per tenant** to prevent abuse.

---

## References

* [Flask-JWT-Extended](https://flask-jwt-extended.readthedocs.io/)
* [Flask-Caching](https://flask-caching.readthedocs.io/)
* [Flask-Compress](https://flask-compress.readthedocs.io/)
* [Prometheus Flask Exporter](https://github.com/rycus86/prometheus_flask_exporter)
* [OWASP API Security](https://owasp.org/www-project-api-security/)
* [Multi-Tenant SaaS Patterns](https://martinfowler.com/articles/multi-tenant.html)
* [Marshmallow Schema Versioning](https://marshmallow.readthedocs.io/en/stable/)

```