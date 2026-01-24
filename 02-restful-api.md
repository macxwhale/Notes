# Module 2 – RESTful API Design

## Module Overview
This module focuses on **modeling resources and applying REST constraints** effectively.  
By the end, you will understand how to design APIs that are intuitive, predictable, and maintainable.

**Goals:**
- Model resources and relationships properly
- Apply REST constraints intentionally
- Design clean, consistent URLs and payloads
- Avoid common REST anti-patterns

---

## Lecture Content

### 1. What is REST?
- **REST (Representational State Transfer)** is a set of constraints for networked systems.  
- Key constraints:
  - **Client-Server:** Separation of concerns
  - **Stateless:** Each request contains all necessary info
  - **Cacheable:** Responses can be cached
  - **Uniform Interface:** Standardized methods and conventions
  - **Layered System:** Client should not need to know server structure
  - **Code on Demand (optional)**

---

### 2. Resource Modeling
- Everything in REST is a **resource** (noun, not verb)
- Examples: `users`, `orders`, `products`
- Relationships can be represented via URLs or embedded resources

**Examples:**
```
GET /users
GET /users/123
GET /users/123/orders
```

---

### 3. URL Design Guidelines
- **Use Nouns**: Resources are things (`/products`), not actions (`/getProducts`).
- **Use Plural Names**: `/users`, `/orders`.
- **Use Hyphens for Readability**: `/user-profiles` (not `/user_profiles` or `/userProfiles`).
- **Use Lowercase Letters**: URLs are case-sensitive; keep it simple.
- **Limit Nesting Depth**: Avoid deep hierarchies (max 2 levels).
    - **Bad**: `/users/123/posts/55/comments/99`
    - **Good**: `/products/123/comments` then `/comments/99` directly.
- **Use Query Parameters**: For filtering (`?sort=price`), not resource identification.

**Bad:** `/getUserById/123`  
**Good:** `/users/123`

**Filtering Example:**  
```
GET /orders?status=shipped&sort=created_at
```

---

### 4. Pagination & Filtering
- **Pagination**: `limit` & `offset` or cursor-based
- **Filtering**: query parameters
- **Sorting**: `sort` query with ascending/descending

**Example:**
```
GET /products?category=electronics&limit=20&offset=40&sort=-price
````

---

### 5. HATEOAS (Hypermedia)
**Hypermedia as the Engine of Application State** means the API tells the client what they can do next via links.
*   **Without HATEOAS**: Client hardcodes URLs `/orders/{id}/pay`.
*   **With HATEOAS**: Client follows links returned in the response.

**Example Response:**
```json
{
  "id": 123,
  "status": "pending",
  "_links": {
    "self": {"href": "/orders/123"},
    "payment": {"href": "/orders/123/pay", "method": "POST"},
    "cancel": {"href": "/orders/123", "method": "DELETE"}
  }
}
```

---

### 6. Standardized JSON Responses (The Envelope Pattern)

To provide a professional experience, production APIs use a consistent "Envelope" to wrap every response. This ensures that metadata (pagination, rate limits, status) is always in a predictable location.

#### The "Tech Giant" Blueprint (Inspired by Google & Microsoft Graph)
This structure is considered a "Gold Standard" for production-grade APIs.

**1. Success Response Blueprint**
Used for all successful operations (GET, POST, PUT, PATCH).
```json
{
  "status": "success",
  "code": 200,
  "message": "Resource retrieved successfully",
  "data": {
    "item": {
       "id": "usr_12345",
       "name": "Alice Smith",
       "email": "alice@example.com"
    }
  },
  "meta": {
    "timestamp": "2023-10-27T10:00:00Z",
    "version": "v1.4",
    "request_id": "req_8899aabbcc"
  }
}
```

**2. Collection (List) Response Blueprint**
Includes standard pagination metadata.
```json
{
  "status": "success",
  "code": 200,
  "data": [
    { "id": 1, "name": "Item A" },
    { "id": 2, "name": "Item B" }
  ],
  "meta": {
    "pagination": {
      "total_items": 1250,
      "page_size": 10,
      "current_page": 1,
      "total_pages": 125,
      "next_page_url": "/api/v1/items?page=2"
    }
  }
}
```

**3. Error Response Blueprint**
Never return just a string. Use a structured error object.
```json
{
  "status": "error",
  "code": 400,
  "error": {
    "type": "validation_error",
    "message": "Invalid input provided.",
    "details": [
      {
        "field": "email",
        "issue": "must be a valid email address",
        "received": "invalid-email"
      },
      {
        "field": "password",
        "issue": "too short (minimum 8 characters)"
      }
    ],
    "help_url": "https://docs.api.com/errors/validation"
  }
}
```

#### Why Use This Pattern?
*   **Consistency**: Clients can write a single "Response Wrapper" class to parse every API call.
*   **Predictability**: Errors are always in the `error` key, data in `data`.
*   **Scalability**: You can add more metadata (like server performance or feature flags) to `meta` without breaking existing data parsing logic.

---

### 7. Response Examples by Verb

**1. GET (Retrieve)**
`200 OK`
Wrapped in success blueprint.

**2. POST (Create)**
`201 Created`
Returns the created resource with its new ID inside the `data` block.

**3. PUT (Full Update)**
`200 OK`
Returns the completely replaced resource inside `data`.

**4. PATCH (Partial Update)**
`200 OK`
Returns the updated resource (merged view) inside `data`.

**5. DELETE (Remove)**
`204 No Content`
*(Empty Envelope or No Body)* - Generally, a 204 has no body. If your standard requires an envelope, use a `200 OK` with `data: null`.

---

### 8. REST Anti-Patterns
- Using verbs in URLs (`/createUser`)
- Overloading a single endpoint for multiple resources
- Ignoring proper HTTP methods
- Returning inconsistent payloads

---

## Flask Code Examples

### Users API with Filtering & Pagination
```python
from flask import Flask, jsonify, request

app = Flask(__name__)

users = [
    {"id": 1, "name": "Alice"},
    {"id": 2, "name": "Bob"},
    {"id": 3, "name": "Charlie"},
]

@app.route("/users", methods=["GET"])
def list_users():
    limit = int(request.args.get("limit", 10))
    offset = int(request.args.get("offset", 0))
    return jsonify(users[offset:offset+limit]), 200

@app.route("/users/<int:user_id>", methods=["GET"])
def get_user(user_id):
    user = next((u for u in users if u["id"] == user_id), None)
    if not user:
        return jsonify(error="User not found"), 404
    return jsonify(user), 200
````

---

## Practical Exercises

### Exercise 1 – Resource Modeling

* Design a **Blog API** with:

  * Posts
  * Comments
  * Users
* Identify relationships and proper endpoints

### Exercise 2 – Filtering & Pagination

* Add query parameters to the `/users` endpoint:

  * `?limit=5&offset=0`
  * Filter by `name` query parameter

### Exercise 3 – REST Anti-Patterns

* Review an existing API (real or mock)
* Identify **at least 3 anti-patterns** and redesign URLs

---

## Exercise Solutions

**Blog API Example Endpoints**

```
GET /posts
GET /posts/<id>
POST /posts
GET /posts/<id>/comments
POST /posts/<id>/comments
GET /users
GET /users/<id>
```

**Filtering Example**

```python
@app.route("/users", methods=["GET"])
def list_users():
    limit = int(request.args.get("limit", 10))
    offset = int(request.args.get("offset", 0))
    name_filter = request.args.get("name")
    filtered_users = users
    if name_filter:
        filtered_users = [u for u in users if name_filter.lower() in u["name"].lower()]
    return jsonify(filtered_users[offset:offset+limit]), 200
```

---

## Quiz Questions

1. What is a resource in REST?
2. Why should URLs use nouns instead of verbs?
3. Explain the difference between **offset-based** and **cursor-based pagination**.
4. List two common REST anti-patterns.
5. How do query parameters help maintain REST constraints?

---

## Mini-Project

**Blog API – RESTful Implementation**

* Endpoints:

  * `GET /posts`
  * `POST /posts`
  * `GET /posts/<id>`
  * `GET /posts/<id>/comments`
  * `POST /posts/<id>/comments`
* Requirements:

  * Correct HTTP methods
  * Noun-based URL design
  * Pagination & filtering on collections
  * Proper status codes

**Evaluation Criteria**

* REST compliance: 40%
* URL design & naming: 30%
* Error handling: 30%

---

## Interactive Elements

* **Discussion Prompt:** How would you model a many-to-many relationship in a REST API (e.g., users ↔ groups)?
* **Group Activity:** Take an existing REST API and **refactor URLs and endpoints** to follow best practices.

---

## References

* [REST Constraints Overview](https://restfulapi.net/)
* [OpenAPI Specification](https://spec.openapis.org/oas/latest.html)
* [Flask Official Documentation](https://flask.palletsprojects.com/)
