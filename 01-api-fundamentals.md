### `01-api-fundamentals.md`

```markdown
# Module 1 – API Fundamentals & HTTP

## Module Overview
This module covers the **core building blocks of APIs**. Understanding these concepts is crucial before designing RESTful or production-grade APIs.

**Goals:**
- Understand HTTP protocol fundamentals
- Correctly use HTTP methods and status codes
- Learn request-response structure
- Identify common mistakes in API design

---

## Lecture Content

### 1. HTTP Basics
- HTTP is an **application protocol** built on TCP/IP.
- APIs are interfaces using HTTP to communicate between clients and servers.
- **Request** → **Response** cycle is key.

#### Request Structure
```

METHOD /resource HTTP/1.1
Host: example.com
Content-Type: application/json
Authorization: Bearer <token>

```

#### Response Structure
```

HTTP/1.1 200 OK
Content-Type: application/json
{
"data": { ... }
}

````

---

### 2. HTTP Methods
| Method | Description | Idempotent? |
|--------|------------|------------|
| GET    | Retrieve resource | Yes |
| POST   | Create resource | No |
| PUT    | Replace resource | Yes |
| PATCH  | Update resource | No (partial) |
| DELETE | Remove resource | Yes |

**Idempotency:** Repeating the same request has the same effect on the server.

---

### 3. Status Codes
- **2xx:** Success
- **4xx:** Client error
- **5xx:** Server error

| Code | Meaning | Use Case |
|------|--------|---------|
| 200 | OK | Successful GET/PUT |
| 201 | Created | Successful POST |
| 204 | No Content | Successful DELETE |
| 400 | Bad Request | Validation failure |
| 401 | Unauthorized | Missing/invalid auth |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource not found |
| 500 | Internal Server Error | Unexpected failure |

---

### 4. Common Mistakes & Anti-Patterns
- Always returning `200 OK` even on errors
- Using verbs in URLs (`/getUsers`)
- Ignoring HTTP methods
- Returning inconsistent payloads

---

## Flask Code Examples

### Health Check Endpoint
```python
from flask import Flask, jsonify

app = Flask(__name__)

@app.route("/health", methods=["GET"])
def health():
    return jsonify(status="ok"), 200

if __name__ == "__main__":
    app.run(debug=True)
````

### CRUD Skeleton

```python
from flask import Flask, jsonify, request

app = Flask(__name__)
users = {}

@app.route("/users", methods=["POST"])
def create_user():
    data = request.json
    user_id = len(users) + 1
    users[user_id] = data
    return jsonify(id=user_id, **data), 201

@app.route("/users/<int:user_id>", methods=["GET"])
def get_user(user_id):
    user = users.get(user_id)
    if not user:
        return jsonify(error="User not found"), 404
    return jsonify(id=user_id, **user), 200
```

---

## Practical Exercises

### Exercise 1 – Health Endpoint

* Build a `/health` endpoint returning status `ok`.
* Use HTTP `200`.

### Exercise 2 – User CRUD

* Implement `POST /users` and `GET /users/<id>` using Flask.
* Return proper status codes (`201`, `404`).

### Exercise 3 – Idempotency Check

* Implement `PUT /users/<id>` to update a user.
* Confirm repeated requests do not create duplicates.

---

## Exercise Solutions

**Health Endpoint**

```python
@app.route("/health", methods=["GET"])
def health():
    return jsonify(status="ok"), 200
```

**POST /users**

```python
@app.route("/users", methods=["POST"])
def create_user():
    data = request.json
    user_id = len(users) + 1
    users[user_id] = data
    return jsonify(id=user_id, **data), 201
```

**GET /users/<id>**

```python
@app.route("/users/<int:user_id>", methods=["GET"])
def get_user(user_id):
    user = users.get(user_id)
    if not user:
        return jsonify(error="User not found"), 404
    return jsonify(id=user_id, **user), 200
```

---

## Quiz Questions

1. What is idempotency in HTTP methods? Give an example.
2. When should you return `201 Created` vs `200 OK`?
3. What is the difference between `PUT` and `PATCH`?
4. Which HTTP status code indicates “resource not found”?
5. Why should verbs be avoided in REST URLs?

---

## Mini-Project

**User Management API Skeleton**

* Endpoints:

  * `POST /users` → create user
  * `GET /users/<id>` → get user
  * `PUT /users/<id>` → update user
  * `DELETE /users/<id>` → remove user
* Requirements:

  * Proper HTTP methods
  * Correct status codes
  * JSON responses

**Evaluation Criteria**

* Correctness of HTTP methods & status codes: 40%
* Code organization: 30%
* Error handling: 30%

---

## Interactive Elements

* **Discussion Prompt:** Which HTTP method is often misused in production APIs, and why?
* **Group Activity:** Review an open-source Flask API. Identify **at least 3 areas violating HTTP semantics**.

---

## References

* [Flask Documentation](https://flask.palletsprojects.com/)
* [RFC 9110 – HTTP Semantics](https://www.rfc-editor.org/rfc/rfc9110)
* [REST Constraints Overview](https://restfulapi.net/)

```
