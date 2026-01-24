### `06-security.md`

````markdown
# Module 6 – API Security & Threat Modeling

## Module Overview
This module teaches **how to secure APIs against common attacks** and how to model threats for a robust design.  
By the end, you’ll be able to identify, prevent, and mitigate security risks in Flask APIs.

**Goals:**
- Understand common API security threats (OWASP Top 10)
- Apply input validation and sanitization
- Implement rate limiting and throttling
- Perform basic threat modeling
- Enforce security best practices in Flask

---

## Lecture Content

### 1. Common API Security Threats
Referencing **OWASP API Security Top 10**:

| Threat | Description |
|--------|------------|
| Broken Object Level Authorization | Accessing resources not owned by the user |
| Broken User Authentication | Weak or missing authentication mechanisms |
| Excessive Data Exposure | Returning sensitive data unnecessarily |
| Lack of Rate Limiting | Allows brute-force or denial-of-service attacks |
| Mass Assignment | Updating fields users shouldn’t access |
| Injection | SQL, NoSQL, command injection |
| Security Misconfiguration | Default credentials, verbose errors |
| Improper Assets Management | Exposing deprecated or unprotected endpoints |
| Insufficient Logging & Monitoring | Hard to detect attacks |
| Improper Transport Security | Lack of HTTPS or insecure channels |

---

### 2. Input Validation & Sanitization
- Never trust user input
- Validate all payloads (already covered with Marshmallow)
- Sanitize strings to prevent injection attacks

**Example: SQL Injection Prevention**
```python
# Bad
cursor.execute(f"SELECT * FROM users WHERE name='{name}'")

# Good
cursor.execute("SELECT * FROM users WHERE name=%s", (name,))
````

---

### 3. Rate Limiting & Throttling

* Prevent abuse or brute-force attacks
* Flask example using `Flask-Limiter`:

```python
from flask import Flask
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

app = Flask(__name__)
limiter = Limiter(app, key_func=get_remote_address)

@app.route("/login", methods=["POST"])
@limiter.limit("5 per minute")
def login():
    return "Login endpoint"
```

---

### 4. Threat Modeling

* Identify sensitive assets (user data, payments)
* Identify threats (unauthorized access, injection)
* Rank risks by **likelihood and impact**
* Mitigation planning (rate limiting, logging, auth checks)

**Example:**
Asset: `/admin` endpoint
Threat: Unauthorized access → Mitigation: JWT + role check + logging

---

### 5. Secure Transport & Headers

* Always use HTTPS
* Set security headers (CSP, HSTS)
* Example with Flask-Talisman:

```python
from flask_talisman import Talisman

Talisman(app)
```

---

### 6. Common Mistakes

* Ignoring rate limiting
* Exposing internal errors in responses
* Over-permissive CORS
* Returning raw stack traces
* Not rotating secrets

---

## Flask Code Examples

### Rate-Limited Login Endpoint

```python
from flask import Flask, jsonify, request
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

app = Flask(__name__)
limiter = Limiter(app, key_func=get_remote_address)

@app.route("/login", methods=["POST"])
@limiter.limit("5 per minute")
def login():
    return jsonify({"msg": "Attempted login"}), 200
```

### Secure Headers with Flask-Talisman

```python
from flask_talisman import Talisman
Talisman(app, content_security_policy=None)
```

### Sanitizing Input Example

```python
import bleach

@app.route("/comment", methods=["POST"])
def comment():
    text = bleach.clean(request.json.get("text", ""))
    # store sanitized text in database
    return jsonify({"comment": text}), 201
```

---

## Practical Exercises

### Exercise 1 – Rate Limiting

* Protect the `/login` and `/signup` endpoints
* Limit to **5 requests per minute per IP**

### Exercise 2 – Input Sanitization

* Implement endpoint `/comment` accepting user comments
* Sanitize input to prevent XSS or injection

### Exercise 3 – Threat Modeling

* Map all endpoints of your API
* Identify **top 3 security risks**
* Propose mitigation strategies

---

## Exercise Solutions

**Rate Limiting**

```python
@limiter.limit("5 per minute")
def login():
    return jsonify({"msg": "Login attempt"}), 200
```

**Input Sanitization**

```python
import bleach
text = bleach.clean(request.json.get("text", ""))
```

**Threat Model Example**

| Endpoint  | Asset            | Threat              | Mitigation         |
| --------- | ---------------- | ------------------- | ------------------ |
| /admin    | Admin operations | Unauthorized access | JWT + role check   |
| /login    | User accounts    | Brute-force         | Rate limiting      |
| /comments | User content     | XSS injection       | Input sanitization |

---

## Quiz Questions

1. Name three common API security threats according to OWASP.
2. Why is rate limiting important?
3. How does input sanitization help prevent attacks?
4. Explain the difference between authentication and authorization in the context of security.
5. What is the purpose of Flask-Talisman?

---

## Mini-Project

**Secure API Implementation**

* Add security to an existing User/Blog API:

  * Rate limit login/signup
  * Sanitize all user inputs
  * Add JWT authentication and role checks
  * Enable HTTPS (Flask-Talisman)
  * Document threat modeling decisions

**Evaluation Criteria**

* Rate limiting correctness: 25%
* Input sanitization: 25%
* Authentication & role checks: 25%
* Threat modeling documentation: 25%

---

## Interactive Elements

* **Discussion Prompt:** Which API endpoint is most critical to secure first, and why?
* **Group Activity:** Conduct a **mini security audit** on an existing API and present findings.

---

## References

* [OWASP API Security Top 10](https://owasp.org/www-project-api-security/)
* [Flask-Limiter](https://flask-limiter.readthedocs.io/)
* [Flask-Talisman](https://github.com/GoogleCloudPlatform/flask-talisman)
* [Input Sanitization with Bleach](https://bleach.readthedocs.io/)
* [OWASP Threat Modeling](https://owasp.org/www-community/Threat_Modeling)

```