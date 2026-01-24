### `03-flask-architecture.md`

````markdown
# Module 3 – Flask API Architecture

## Module Overview
This module focuses on **structuring Flask APIs for maintainability and scalability**.  
Proper architecture ensures your API can grow without becoming unmanageable.

**Goals:**
- Apply Flask application factories
- Organize blueprints effectively
- Separate configuration, models, and routes
- Implement environment-based settings

---

## Lecture Content

### 1. Flask Application Factory
- An **application factory** is a function that creates and configures a Flask app.
- Advantages:
  - Supports **multiple environments**
  - Enables **testing** with isolated app instances
  - Encourages **modular design**

**Example:**
```python
from flask import Flask

def create_app(config_name="development"):
    app = Flask(__name__)
    if config_name == "development":
        app.config.from_object("config.DevelopmentConfig")
    elif config_name == "production":
        app.config.from_object("config.ProductionConfig")
    
    # Register Blueprints here
    from .routes import main_bp
    app.register_blueprint(main_bp)
    
    return app
````

---

### 2. Blueprints

* Blueprints allow **modular route organization**
* Each module of your API can have its own blueprint

**Example:**

```python
from flask import Blueprint, jsonify

main_bp = Blueprint("main", __name__)

@main_bp.route("/health", methods=["GET"])
def health():
    return jsonify(status="ok"), 200
```

* Register in app factory:

```python
app.register_blueprint(main_bp, url_prefix="/api")
```

---

### 3. Project Structure

**Recommended Structure:**

```
my_flask_app/
├── app/
│   ├── __init__.py         # Application factory
│   ├── routes.py           # Blueprints & endpoints
│   ├── models.py           # Database models
│   ├── schemas.py          # Validation schemas
│   └── utils.py            # Helper functions
├── config.py               # Environment configurations
├── run.py                  # Entry point
└── requirements.txt
```

---

### 4. Configuration Management

* Use **Python classes** or `.env` files for environment-specific settings
* Example:

```python
class Config:
    SECRET_KEY = "default-secret"
    DEBUG = False

class DevelopmentConfig(Config):
    DEBUG = True
    DATABASE_URI = "sqlite:///dev.db"

class ProductionConfig(Config):
    DATABASE_URI = "postgresql://user:pass@prod-db:5432/db"
```

* Load config in factory:

```python
app.config.from_object("config.DevelopmentConfig")
```

---

### 5. Common Mistakes

* Monolithic `app.py` with hundreds of routes
* Hardcoding configuration values
* Not using blueprints → messy imports
* Forgetting to separate models and routes

---

## Flask Code Examples

### Minimal Factory + Blueprint

```python
# app/__init__.py
from flask import Flask
from .routes import main_bp

def create_app():
    app = Flask(__name__)
    app.register_blueprint(main_bp, url_prefix="/api")
    return app

# app/routes.py
from flask import Blueprint, jsonify

main_bp = Blueprint("main", __name__)

@main_bp.route("/health", methods=["GET"])
def health():
    return jsonify(status="ok")
```

### Running the App

```python
# run.py
from app import create_app

app = create_app()

if __name__ == "__main__":
    app.run(debug=True)
```

---

## Practical Exercises

### Exercise 1 – App Factory

* Refactor a single-file Flask app into an **application factory** pattern
* Test the app with development and production configs

### Exercise 2 – Blueprint Organization

* Split routes into at least two blueprints (`users`, `posts`)
* Register them under `/api/users` and `/api/posts`

### Exercise 3 – Environment Configs

* Create `.env` files for `development` and `production`
* Load secret keys and database URIs from `.env`

---

## Exercise Solutions

**App Factory**

```python
def create_app(config_name="development"):
    app = Flask(__name__)
    from .routes import main_bp
    app.register_blueprint(main_bp, url_prefix="/api")
    return app
```

**Blueprints Example**

```python
# app/users.py
from flask import Blueprint, jsonify

users_bp = Blueprint("users", __name__)

@users_bp.route("/", methods=["GET"])
def list_users():
    return jsonify([]), 200
```

```python
# In factory
app.register_blueprint(users_bp, url_prefix="/api/users")
```

**Environment Config Example**

```python
import os
from dotenv import load_dotenv
load_dotenv()

class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret")
```

---

## Quiz Questions

1. What is an application factory, and why use it?
2. How do blueprints help organize large APIs?
3. Why should configuration values not be hardcoded?
4. Explain the difference between environment-specific configs and default configs.
5. Give an example of a Flask project structure for a multi-module API.

---

## Mini-Project

**Refactor User API into Modular Architecture**

* Split into:

  * Factory (`create_app`)
  * Blueprints (`users`, `posts`)
  * Config classes for `dev` and `prod`
* Requirements:

  * Running in multiple environments
  * Modular route registration
  * Clean folder structure

**Evaluation Criteria**

* Correct use of factory: 40%
* Blueprints organization: 30%
* Config management & environment separation: 30%

---

## Interactive Elements

* **Discussion Prompt:** How would you structure a Flask API with **10+ microservices**?
* **Group Activity:** Take an existing monolithic Flask app and refactor it using **blueprints and factories**. Document your structure.

---

## References

* [Flask Application Factories](https://flask.palletsprojects.com/en/latest/patterns/appfactories/)
* [Flask Blueprints](https://flask.palletsprojects.com/en/latest/blueprints/)
* [12-Factor App Config](https://12factor.net/config)

```