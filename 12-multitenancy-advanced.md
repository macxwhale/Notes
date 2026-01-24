# Module 12 – Multi-Tenant API Design & Versioning

## Module Overview
Multi-tenancy is the architecture of SaaS. It means a single instance of your application serves multiple customers (tenants). This module covers advanced isolation techniques and safe API evolution (versioning) without breaking clients.

**Goals:**
- Implement **Tenant Isolation** strategies (Shared DB vs Isolated DB).
- Use **API Versioning** properly (URI vs Header).
- Securely handle **Tenant Context** in requests.
- Plan for **Database Migrations** in multi-tenant environments.

---

## Lecture Content

### 1. Multi-Tenant Strategies
How do you store data for different customers (Tenants)?

*   **Strategy A: Discriminator Column (Shared DB)**
    *   Add `tenant_id` column to *every* table.
    *   *Pros*: Cheap, easy to manage schema.
    *   *Cons*: weak isolation (developer error can leak data).
*   **Strategy B: Schema per Tenant**
    *   One DB, separate Schemas (`postgres_db.tenant_a`, `postgres_db.tenant_b`).
    *   *Pros*: Good isolation, easy backup/restore per tenant.
*   **Strategy C: Database per Tenant**
    *   Totally separate DB servers/files.
    *   *Pros*: Max isolation. *Cons*: Expensive maintenance.

### 2. Tenant Context & Security
Never trust the client to tell you their tenant ID in the body (e.g., `{"tenant_id": 1}`).
**Instead**:
1.  **Subdomains**: `tenant1.myapp.com`
2.  **Auth Token**: Embed `tenant_id` in the JWT signed by the server.

**Middleware Approach**:
Identify tenant *before* the request hits the controller. Store it in a global context (`g.tenant`).

### 3. API Versioning
APIs change. You can't break mobile apps that users haven't updated.

*   **URI Versioning**: `GET /v1/users`
    *   *Pros*: Explicit, easy to debug.
    *   *Cons*: Clutters code with `v1_controller`, `v2_controller`.
*   **Header Versioning**: `Accept: application/vnd.myapi.v2+json`
    *   *Pros*: Clean URLs.
    *   *Cons*: Harder to test in browser.

---

## Flask Code Examples

### Tenant Isolation Middleware (Shared DB)
```python
from flask import Flask, request, g, jsonify
from functools import wraps

app = Flask(__name__)

# Simulating a DB
db = {
    "tenant_a": ["User A1", "User A2"],
    "tenant_b": ["User B1"]
}

@app.before_request
def resolve_tenant():
    # 1. Try resolving from Host (tenant.app.com)
    host = request.headers.get("Host", "")
    if ".app.com" in host:
        g.tenant = host.split(".")[0]
        return

    # 2. Try resolving from Header (for testing)
    g.tenant = request.headers.get("X-Tenant-ID")
    
    if not g.tenant:
        return jsonify({"error": "No tenant specified"}), 400

def login_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        # Validate if user belongs to g.tenant here
        return f(*args, **kwargs)
    return decorated

@app.route('/users')
def get_users():
    # AUTOMATIC FILTERING
    # In a real ORM: User.query.filter_by(tenant_id=g.tenant).all()
    users = db.get(g.tenant, [])
    return jsonify({"tenant": g.tenant, "users": users})
```

### Versioning with Blueprints
```python
from flask import Blueprint

v1_bp = Blueprint('v1', __name__, url_prefix='/v1')
v2_bp = Blueprint('v2', __name__, url_prefix='/v2')

@v1_bp.route('/data')
def data_v1():
    return {"name": "Old Format"}

@v2_bp.route('/data')
def data_v2():
    return {"full_name": "New Format", "id": 123}

app.register_blueprint(v1_bp)
app.register_blueprint(v2_bp)
```

---

## Practical Exercises

### Exercise 1 – The Leaky Bucket
* Create an endpoint `GET /orders` that returns *all* orders in a mock list.
* Implement a middleware that populates `g.tenant_id`.
* Refactor `GET /orders` to return *only* orders matching `g.tenant_id`.

### Exercise 2 – Version Migration
* Create a `v1` endpoint returning `{"user": "Name"}`.
* Create a `v2` endpoint returning `{"first_name": "Name", "last_name": "Surname"}`.
* Write a test that proves both versions work simultaneously.

### Exercise 3 – Schema per Tenant (Conceptual)
* Write a small SQL script or SQLAlchemy Model definition showing how you would structure a `ForeignKey` that references a `Tenant` table vs. using Postgres Schemas.

---

## Mini-Project

**Multi-Tenant SaaS Platform**
* **Scenario**: A project management tool (like Jira) for multiple companies.
* **Requirements**:
    *   **Auth**: Users log in and receive a JWT containing their `tenant_id`.
    *   **Isolation**: User A (Company A) MUST NOT see User B's tickets.
    *   **Versioning**: `/v1/tickets` returns simple list. `/v2/tickets` supports pagination & sorting.
    *   **Admin**: Super-admin can query *all* tenants (special scope).
* **Tools**: Flask Blueprints, JWT, Middleware.

**Evaluation Criteria:**
* Tenant isolation is enforced centrally (middleware/decorator): 40%
* API Versioning is clean and separate: 30%
* Security (Admin access vs Tenant access): 30%

---

## References
- [Refactoring to Microservices (Multi-tenancy)](https://martinfowler.com/articles/microservices.html)
- [Building Multi-Tenant Apps with Flask](https://testdriven.io/blog/flask-multitenancy/)
- [PostgreSQL Schemas](https://www.postgresql.org/docs/current/ddl-schemas.html)