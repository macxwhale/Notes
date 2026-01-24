### `mid-course-project.md`

```markdown
# Mid-Course Project – User & Product Management API

## Project Overview
This project consolidates knowledge from **Modules 1–4**:
- Flask fundamentals and app architecture
- Blueprints and modular design
- Input validation and serialization
- Error handling

**Goal:** Build a **production-ready API** for managing users and products with proper validation, structured errors, and modular architecture.

---

## Requirements

### Endpoints
1. **Users**
   - `POST /api/users` → create user
   - `GET /api/users/<id>` → get user by ID
   - `GET /api/users` → list users

2. **Products**
   - `POST /api/products` → create product
   - `GET /api/products/<id>` → get product by ID
   - `GET /api/products` → list products

### Features
- **Application factory pattern**
- **Blueprints** for `users` and `products`
- **Marshmallow schemas** for validation and serialization
- **Structured error handling** for:
  - Validation errors
  - Not found resources
- Configurable **development and production environments** via `config.py` or `.env`

---

## Project Structure
```

mid_course_api/
├── app/
│   ├── **init**.py          # Application factory
│   ├── users/
│   │   ├── **init**.py
│   │   ├── routes.py
│   │   ├── schemas.py
│   │   └── models.py
│   ├── products/
│   │   ├── **init**.py
│   │   ├── routes.py
│   │   ├── schemas.py
│   │   └── models.py
│   └── utils.py
├── config.py                # Development & production configs
├── run.py                   # Entry point
├── requirements.txt
└── .env                     # Optional environment variables

````

---

## Detailed Features

### 1. Users Module
**Schema:**
```python
class UserSchema(Schema):
    id = fields.Int(dump_only=True)
    name = fields.Str(required=True)
    email = fields.Email(required=True)
````

**Validation:** required fields, proper email format

### 2. Products Module

**Schema:**

```python
class ProductSchema(Schema):
    id = fields.Int(dump_only=True)
    name = fields.Str(required=True)
    price = fields.Float(required=True, validate=lambda p: p > 0)
    category = fields.Str()
```

**Validation:** required fields, positive price

### 3. Error Handling

* Global error handler for `ValidationError`:

```python
@app.errorhandler(ValidationError)
def handle_validation_error(e):
    return jsonify({"error": "ValidationError", "fields": e.messages}), 400
```

* 404 for missing resources:

```python
return jsonify({"error": "NotFound", "message": "User not found"}), 404
```

### 4. Config Management

* `DevelopmentConfig` → SQLite, debug=True
* `ProductionConfig` → PostgreSQL, debug=False

---

## Practical Exercises

1. Refactor the API into **modular blueprints**
2. Implement **input validation with Marshmallow**
3. Add **structured error responses**
4. Test endpoints using **Postman or curl**

---

## Project Solutions (Example Snippets)

**App Factory**

```python
from flask import Flask

def create_app(config_name="development"):
    app = Flask(__name__)
    if config_name == "production":
        app.config.from_object("config.ProductionConfig")
    else:
        app.config.from_object("config.DevelopmentConfig")

    # Register blueprints
    from app.users.routes import users_bp
    from app.products.routes import products_bp
    app.register_blueprint(users_bp, url_prefix="/api/users")
    app.register_blueprint(products_bp, url_prefix="/api/products")

    return app
```

**User Blueprint**

```python
from flask import Blueprint, request, jsonify
from marshmallow import ValidationError
from .schemas import UserSchema

users_bp = Blueprint("users", __name__)
users = []

@users_bp.route("/", methods=["POST"])
def create_user():
    schema = UserSchema()
    data = schema.load(request.json)
    data["id"] = len(users) + 1
    users.append(data)
    return schema.dump(data), 201

@users_bp.route("/<int:user_id>", methods=["GET"])
def get_user(user_id):
    schema = UserSchema()
    user = next((u for u in users if u["id"] == user_id), None)
    if not user:
        return jsonify({"error": "NotFound", "message": "User not found"}), 404
    return schema.dump(user), 200
```

**Product Blueprint**

```python
from flask import Blueprint, request, jsonify
from .schemas import ProductSchema

products_bp = Blueprint("products", __name__)
products = []

@products_bp.route("/", methods=["POST"])
def create_product():
    schema = ProductSchema()
    data = schema.load(request.json)
    data["id"] = len(products) + 1
    products.append(data)
    return schema.dump(data), 201
```

---

## Evaluation Criteria

| Criterion                          | Weight |
| ---------------------------------- | ------ |
| Application factory implementation | 20%    |
| Blueprint modularization           | 20%    |
| Input validation correctness       | 20%    |
| Structured error handling          | 20%    |
| Environment/config separation      | 20%    |

---

## Interactive Elements

* **Discussion Prompt:** How would you extend this API to support authentication without breaking existing endpoints?
* **Group Activity:** Pair up and review each other’s schema validation and error handling.

---

## References

* [Flask Blueprints](https://flask.palletsprojects.com/en/latest/blueprints/)
* [Marshmallow Schemas](https://marshmallow.readthedocs.io/)
* [Flask Error Handling](https://flask.palletsprojects.com/en/latest/errorhandling/)
* [12-Factor App Config](https://12factor.net/config)

```