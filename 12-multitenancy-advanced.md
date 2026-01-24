### `12-multitenancy-advanced.md`

```markdown
# Module 12 – Multi-Tenant API Design & Versioning

## Module Overview
Advanced multi-tenant and versioned API design for SaaS: isolation, scaling, and backward compatibility.

**Goals:**
- Multi-tenancy strategies (shared DB, schema-per-tenant, DB-per-tenant)  
- Versioning endpoints (URI, headers)  
- Tenant-aware authentication  
- Backward compatibility for multiple tenants  

---

## Lecture Content

### 1. Multi-Tenant Patterns
| Pattern | Pros | Cons |
|---------|------|-----|
| DB-per-tenant | Strong isolation | High operational cost |
| Schema-per-tenant | Moderate isolation | More DB maintenance |
| Shared DB + tenant_id | Simple | Risk of data leakage |

### 2. Tenant-Aware JWT
```python
identity = {"username": "alice", "tenant_id": 123}
access_token = create_access_token(identity=identity)
````

### 3. Versioned Endpoints

* Maintain multiple API versions for tenants
* Example: `/v1/tenant/<tenant_id>/users` and `/v2/...`

### 4. Common Mistakes

* Breaking old tenants with new API version
* Shared DB without strict isolation
* Hardcoding tenant logic in endpoints

---

## Exercises

1. Implement multi-tenant `users` endpoint with header/subdomain routing
2. Include tenant_id in JWT and enforce access control
3. Version endpoints while keeping backward compatibility

---

## Mini-Project

**Multi-Tenant SaaS API**

* Tenants: `tenant1` and `tenant2`
* Versioned `/users` endpoint
* JWT authentication includes tenant_id

**Evaluation:**

* Tenant isolation: 40%
* Versioned API: 30%
* Security: 30%

---

## References

* [Multi-Tenant SaaS Patterns](https://martinfowler.com/articles/multi-tenant.html)
* [JWT Best Practices](https://www.rfc-editor.org/rfc/rfc7519)
* [OWASP API Security](https://owasp.org/www-project-api-security/)

```