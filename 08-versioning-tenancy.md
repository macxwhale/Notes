# Module 8 – API Versioning & Multi-Tenant Design

## Module Overview
This module teaches **how to manage API evolution** with versioning and design APIs for **multi-tenant SaaS applications**.  
By the end, you’ll understand strategies for backward compatibility and tenant isolation.

**Goals:**
- Apply API versioning strategies (URI, header, media type)
- Maintain backward compatibility across versions
- Design multi-tenant APIs with isolation and scalability
- Understand trade-offs in versioning and multi-tenancy
- Handle routing and schema evolution in Flask

---

## Lecture Content

### 1. API Versioning Strategies
1. **URI Versioning**  
   - Example: `/v1/users`, `/v2/users`  
   - Pros: Simple, clear  
   - Cons: Harder to deprecate endpoints

2. **Header Versioning**  
   - Example: `Accept: application/vnd.myapp.v1+json`  
   - Pros: Cleaner URLs  
   - Cons: Less discoverable

3. **Media Type Versioning**  
   - Uses content negotiation  
   - Pros: Flexible  
   - Cons: Complex client implementation

---

### 2. Backward Compatibility
- Avoid breaking existing clients
- Strategies:
  - Deprecate old endpoints gradually
  - Use feature flags
  - Provide migration guides
  - Introduce additive changes (new fields optional)

**Example:**  
```json
{
  "id": 1,
  "name": "Alice",
  "email": "alice@example.com",
  "phone": null  // new optional field
}
````

---

### 3. Multi-Tenant API Concepts

* Multi-tenancy: single API serves **multiple customers** (tenants)
* Isolation methods:

  * **Database-per-tenant** → best isolation, more operational overhead
  * **Schema-per-tenant** → moderate isolation, easier scaling
  * **Shared database + tenant_id** → simplest, careful authorization needed

**Example:** shared database with tenant_id

```
GET /users?tenant_id=123
```

---

### 4. Tenant Identification & Routing

* Identify tenant via:

  * Subdomain: `tenant1.api.com`
  * Header: `X-Tenant-ID: 123`
  * Query param: `?tenant_id=123`
* Enforce tenant isolation in queries and business logic

**Flask Example:**

```python
from flask import request, jsonify

@app.before_request
def set_tenant():
    g.tenant_id = request.headers.get("X-Tenant-ID")
    if not g.tenant_id:
        return jsonify({"error": "Tenant not specified"}), 400
```

---

### 5. Schema Evolution

* Additive changes preferred
* Avoid removing fields abruptly
* Use versioned serializers/schemas per API version

**Example with Marshmallow:**

```python
class UserSchemaV1(Schema):
    id = fields.Int()
    name = fields.Str()

class UserSchemaV2(Schema):
    id = fields.Int()
    name = fields.Str()
    email = fields.Email()  # new optional field
```

---

### 6. API Deprecation Strategy
When removing an old version (`v1`), communicate it clearly:
1.  **Sunset Header**: Date when the endpoint becomes unresponsive.
    `Sunset: Sat, 31 Dec 2023 23:59:59 GMT`
2.  **Deprecation Header**: Warn clients.
    `Deprecation: true`
3.  **Link Header**: Point to the new version.
    `Link: </v2/users>; rel="successor-version"`

---

### 7. Common Mistakes
* Breaking clients by changing fields silently
* Ignoring tenant isolation → data leaks
* Hardcoding version in logic (use routers/blueprints)
* Not providing migration/deprecation path

---

## Flask Code Examples

### URI Versioning with Blueprints

```python
from flask import Flask, Blueprint, jsonify

app = Flask(__name__)

v1 = Blueprint("v1", __name__)
v2 = Blueprint("v2", __name__)

@v1.route("/users", methods=["GET"])
def get_users_v1():
    return jsonify([{"id": 1, "name": "Alice"}])

@v2.route("/users", methods=["GET"])
def get_users_v2():
    return jsonify([{"id": 1, "name": "Alice", "email": "alice@example.com"}])

app.register_blueprint(v1, url_prefix="/v1")
app.register_blueprint(v2, url_prefix="/v2")
```

### Multi-Tenant Example

```python
from flask import g, request

@app.before_request
def get_tenant():
    g.tenant_id = request.headers.get("X-Tenant-ID")
    if not g.tenant_id:
        return jsonify({"error": "Tenant ID required"}), 400

@app.route("/users")
def get_users():
    tenant_id = g.tenant_id
    users = [u for u in all_users if u["tenant_id"] == tenant_id]
    return jsonify(users)
```

---

## Practical Exercises

### Exercise 1 – API Versioning

* Implement `/v1/users` and `/v2/users` endpoints
* Add a new optional field in v2
* Ensure clients using v1 continue to work

### Exercise 2 – Multi-Tenant Routing

* Implement header-based tenant identification
* Filter resources per tenant
* Return error if tenant header missing

### Exercise 3 – Schema Evolution

* Create Marshmallow schemas for v1 and v2
* Add optional fields in v2
* Maintain backward compatibility

---

## Exercise Solutions

**Blueprint Registration**

```python
app.register_blueprint(v1, url_prefix="/v1")
app.register_blueprint(v2, url_prefix="/v2")
```

**Tenant Filtering**

```python
@app.route("/users")
def get_users():
    tenant_id = g.tenant_id
    users = [u for u in all_users if u["tenant_id"] == tenant_id]
    return jsonify(users)
```

**Schema Example**

```python
class UserSchemaV1(Schema):
    id = fields.Int()
    name = fields.Str()

class UserSchemaV2(Schema):
    id = fields.Int()
    name = fields.Str()
    email = fields.Email()  # new optional field
```

---

## Quiz Questions

1. Name three API versioning strategies.
2. How would you handle adding a new field without breaking existing clients?
3. What are three approaches to multi-tenancy?
4. How do you enforce tenant isolation in a shared database?
5. Why is schema evolution important?

---

## Mini-Project

**Multi-Tenant Versioned API**

* Endpoints:

  * `/v1/users` → returns `id`, `name`
  * `/v2/users` → returns `id`, `name`, `email`
* Requirements:

  * Multi-tenant support via header `X-Tenant-ID`
  * Tenant isolation enforced in all queries
  * Backward-compatible schemas for v1 and v2

**Evaluation Criteria**

* Versioning correctness: 35%
* Tenant isolation: 35%
* Schema evolution & backward compatibility: 30%

---

## Interactive Elements

* **Discussion Prompt:** How would you deprecate `/v1` safely while supporting millions of clients?
* **Group Activity:** Implement a tenant-aware endpoint with at least 2 tenants and demonstrate isolation.

---

## References

* [API Versioning Strategies](https://www.baeldung.com/rest-versioning)
* [Multi-Tenant SaaS Architecture](https://martinfowler.com/articles/multi-tenant.html)
* [Marshmallow Schema Versioning](https://marshmallow.readthedocs.io/en/stable/)
* [OWASP Multi-Tenancy Risks](https://owasp.org/www-project-top-ten-2021/Top_10_2021_Appendix_TEN)