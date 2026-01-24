# Module 4 – Data Validation, Errors & Serialization

## Module Overview
This module teaches **how to make your APIs safe, predictable, and maintainable** by handling input validation, error responses, and serialization consistently.

**Goals:**
- Validate input data with schemas
- Standardize error handling
- Serialize output consistently
- Avoid common mistakes in API payloads

---

## Lecture Content

### 1. Why Validation Matters
- Prevents **invalid or malicious data** from reaching business logic
- Protects the API from runtime errors
- Improves **user experience** with descriptive errors

**Example:**
```json
{
  "name": 123
}
````

If `name` should be a string, a validation schema will catch this.

---

### 2. Marshmallow Schemas

* Marshmallow is a Python library for **serialization/deserialization and validation**
* Define a schema for your resources

**Example:**

```python
from marshmallow import Schema, fields, validate

class UserSchema(Schema):
    id = fields.Int(dump_only=True)
    name = fields.Str(required=True, validate=validate.Length(min=1))
    email = fields.Email(required=True)
```

* `dump_only=True` → field only appears in output
* `required=True` → field must exist in input

---

### 3. Serialization & Deserialization

* **Serialization**: Python objects → JSON
* **Deserialization**: JSON → Python objects

**Example:**

```python
user_schema = UserSchema()
# Deserialize input
data = user_schema.load({"name": "Alice", "email": "alice@example.com"})
# Serialize output
json_data = user_schema.dump(data)
```

---

### 4. Error Handling

* Standardize error responses to make APIs predictable
* Example structure:

```json
{
  "error": "ValidationError",
  "message": "Name is required",
  "fields": {"name": ["Missing data for required field."]}
}
```

**Flask Integration:**

```python
from flask import Flask, request, jsonify
from marshmallow import ValidationError

app = Flask(__name__)
user_schema = UserSchema()

@app.errorhandler(ValidationError)
def handle_validation_error(e):
    return jsonify({
        "error": "ValidationError",
        "message": str(e),
        "fields": e.messages
    }), 400
```

---

### 5. Common Mistakes

* Returning raw exceptions to clients
* Ignoring required fields
* Inconsistent response formats
* Mixing serialization logic with business logic

---

## Flask Code Examples

### User API with Validation

```python
from flask import Flask, request, jsonify
from marshmallow import Schema, fields, validate, ValidationError

app = Flask(__name__)

class UserSchema(Schema):
    id = fields.Int(dump_only=True)
    name = fields.Str(required=True, validate=validate.Length(min=1))
    email = fields.Email(required=True)

user_schema = UserSchema()
users = []

@app.errorhandler(ValidationError)
def handle_validation_error(e):
    return jsonify({"error": "ValidationError", "message": str(e), "fields": e.messages}), 400

@app.route("/users", methods=["POST"])
def create_user():
    data = user_schema.load(request.json)
    user_id = len(users) + 1
    data["id"] = user_id
    users.append(data)
    return user_schema.dump(data), 201

@app.route("/users/<int:user_id>", methods=["GET"])
def get_user(user_id):
    user = next((u for u in users if u["id"] == user_id), None)
    if not user:
        return jsonify({"error": "NotFound", "message": "User not found"}), 404
    return user_schema.dump(user), 200
```

---

## Practical Exercises

### Exercise 1 – Input Validation

* Implement a **Product API**
* Use Marshmallow schemas to validate:

  * `name` (string, required)
  * `price` (float, >0)
  * `category` (optional string)

### Exercise 2 – Standardized Error Responses

* Create a global error handler
* Ensure all validation errors return:

```json
{
  "error": "ValidationError",
  "fields": { ... }
}
```

### Exercise 3 – Serialization

* Serialize **output consistently**
* Remove internal fields (e.g., database IDs) from response

---

## Exercise Solutions

**Product Schema**

```python
class ProductSchema(Schema):
    id = fields.Int(dump_only=True)
    name = fields.Str(required=True)
    price = fields.Float(required=True, validate=lambda p: p > 0)
    category = fields.Str()
```

**Error Handler**

```python
@app.errorhandler(ValidationError)
def handle_validation_error(e):
    return jsonify({"error": "ValidationError", "fields": e.messages}), 400
```

**Endpoint**

```python
@app.route("/products", methods=["POST"])
def create_product():
    data = product_schema.load(request.json)
    data["id"] = len(products) + 1
    products.append(data)
    return product_schema.dump(data), 201
```

---

## Quiz Questions

1. What is the difference between serialization and deserialization?
2. Why should error responses be standardized?
3. How does Marshmallow help enforce validation?
4. What is `dump_only` used for in schemas?
5. Name two common mistakes when handling API payloads.

---

## Mini-Project

**Product Management API**

* Endpoints:

  * `POST /products` → create product
  * `GET /products/<id>` → get product
  * `GET /products` → list products with optional filtering
* Requirements:

  * Input validation via Marshmallow
  * Consistent JSON error responses
  * Correct HTTP status codes
  * Serialized output with only allowed fields

**Evaluation Criteria**

* Validation correctness: 40%
* Error handling: 30%
* Serialization consistency: 30%

---

## Interactive Elements

* **Discussion Prompt:** How would you handle a situation where **partial data is valid but some fields fail validation**?
* **Group Activity:** Take an existing API and **add validation + structured error responses**.

---

## References

* [Marshmallow Docs](https://marshmallow.readthedocs.io/en/stable/)
* [Flask Error Handling](https://flask.palletsprojects.com/en/latest/errorhandling/)
* [API Design – Consistent Error Responses](https://cloud.google.com/apis/design/errors)