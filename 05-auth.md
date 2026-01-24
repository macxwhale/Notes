# Module 5 – Authentication & Authorization

## Module Overview
This module teaches **how to secure APIs** using authentication and authorization mechanisms.  
You’ll learn how to verify identities, control access, and manage tokens securely.

**Goals:**
- Implement JWT-based authentication
- Understand OAuth2 flows
- Apply role-based authorization
- Secure sensitive endpoints
- Understand token lifecycle and best practices

---

## Lecture Content

### 1. Authentication vs Authorization
| Concept | Description |
|---------|------------|
| Authentication | Verify the user’s identity (Who are you?) |
| Authorization | Control what the user can do (Are you allowed?) |

- Authentication → login, token issuance
- Authorization → role checking, permissions

---

### 2. JWT (JSON Web Tokens)
- Stateless token-based authentication
- Token contains payload (claims) and signature
- Example payload:
```json
{
  "sub": "12345",
  "name": "Alice",
  "role": "admin",
  "exp": 1700000000
}
````

* Advantages:

  * Scalable (no server session storage)
  * Can include roles/claims
* Risks:

  * Token leakage → account compromise
  * No automatic revocation (needs blacklist or short TTL)

---

### 3. Implementing JWT in Flask

**Using `flask-jwt-extended`**

```python
from flask import Flask, jsonify, request
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity

app = Flask(__name__)
app.config["JWT_SECRET_KEY"] = "super-secret"
jwt = JWTManager(app)

# Login endpoint
@app.route("/login", methods=["POST"])
def login():
    username = request.json.get("username")
    password = request.json.get("password")
    if username != "admin" or password != "pass":
        return jsonify({"msg": "Bad credentials"}), 401
    access_token = create_access_token(identity={"username": username, "role": "admin"})
    return jsonify(access_token=access_token), 200

# Protected endpoint
@app.route("/protected", methods=["GET"])
@jwt_required()
def protected():
    current_user = get_jwt_identity()
    return jsonify(logged_in_as=current_user), 200
```

---

### 4. Role-Based Authorization

* Add role checks in endpoints

```python
@app.route("/admin", methods=["GET"])
@jwt_required()
def admin_route():
    user = get_jwt_identity()
    if user["role"] != "admin":
        return jsonify({"msg": "Forbidden"}), 403
    return jsonify({"msg": "Welcome, admin"}), 200
```

---

### 5. OAuth2 Basics

* OAuth2: industry-standard delegation protocol
* Common flows:

  * **Authorization Code Flow** → secure server-to-server or web app
  * **Implicit Flow** → client-side web apps
  * **Client Credentials** → service-to-service
  * **Resource Owner Password Credentials** → legacy apps
* Use OAuth2 libraries like `Authlib` in Flask

---

### 6. Token Lifecycle & Security

* Short-lived access tokens + refresh tokens
* Store sensitive data securely (env variables)
* Use HTTPS always
* Rotate secrets when compromised

---

### 7. Password Hashing Best Practices
**NEVER store plain text passwords.**
Use a strong hashing algorithm like `bcrypt`, `Argon2`, or `pbkdf2`.

**Flask Example (Werkzeug):**
```python
from werkzeug.security import generate_password_hash, check_password_hash

# 1. Hashing (Registration)
password_hash = generate_password_hash("my_password")

# 2. Verifying (Login)
is_valid = check_password_hash(password_hash, "my_password")
```

---

### 8. Common Mistakes
* Hardcoding secrets
* Storing passwords in plain text
* Exposing endpoints without authorization
* Not verifying roles or scopes
* Ignoring token expiration

---

## Practical Exercises

### Exercise 1 – JWT Authentication

* Implement login endpoint
* Issue JWT access token
* Protect a `/profile` endpoint

### Exercise 2 – Role-Based Access

* Add `admin` role
* Protect `/admin` endpoint so only `admin` can access

### Exercise 3 – Refresh Tokens

* Implement refresh token endpoint
* Ensure old tokens expire

---

## Exercise Solutions

**JWT Login Example**

```python
@app.route("/login", methods=["POST"])
def login():
    username = request.json.get("username")
    password = request.json.get("password")
    if username != "admin" or password != "pass":
        return jsonify({"msg": "Bad credentials"}), 401
    access_token = create_access_token(identity={"username": username, "role": "admin"})
    return jsonify(access_token=access_token)
```

**Protected Endpoint**

```python
@app.route("/admin", methods=["GET"])
@jwt_required()
def admin_route():
    user = get_jwt_identity()
    if user["role"] != "admin":
        return jsonify({"msg": "Forbidden"}), 403
    return jsonify({"msg": "Welcome, admin"}), 200
```

---

## Quiz Questions

1. What is the difference between authentication and authorization?
2. Why are JWTs considered stateless?
3. Name one security risk of JWTs and how to mitigate it.
4. How would you restrict an endpoint to a specific user role?
5. What is the purpose of refresh tokens?

---

## Mini-Project

**Secure User API**

* Endpoints:

  * `POST /login` → issue JWT
  * `GET /profile` → protected user profile
  * `GET /admin` → admin-only access
* Requirements:

  * JWT authentication
  * Role-based authorization
  * Token expiration handling

**Evaluation Criteria**

* JWT implementation correctness: 40%
* Role-based access: 30%
* Security best practices: 30%

---

## Interactive Elements

* **Discussion Prompt:** What are the trade-offs between **session-based auth** vs **JWT-based auth**?
* **Group Activity:** Implement **two protected endpoints**, one for admin and one for regular users, and demonstrate unauthorized access.

---

## References

* [Flask-JWT-Extended Docs](https://flask-jwt-extended.readthedocs.io/)
* [OAuth2 Overview](https://oauth.net/2/)
* [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
* [JWT Best Practices](https://www.rfc-editor.org/rfc/rfc7519)