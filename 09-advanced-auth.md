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
