# Module 14 – Documentation & Deployment

## Module Overview
Your API works and is tested. Now you need to **document** it for developers and **deploy** it for users. This module covers Swagger/OpenAPI automation and Docker/Production setups.

**Goals:**
- Generate automated API Docs (**Swagger/OpenAPI**).
- Containerize your application using **Docker**.
- Set up a Production WSGI Server (**Gunicorn**).
- Configure a Reverse Proxy (**Nginx**).
- Understand CI/CD pipelines (GitHub Actions).

---

## Lecture Content

### 1. API Documentation (OpenAPI/Swagger)
Manual docs (`README.md`) get outdated. Use **OpenAPI** (formerly Swagger).
*   **Tools**: `flasgger` or `apispec`.
*   **Benefits**: Interactive UI (`/apidocs`), Client generation, Standard format.

### 2. Dockerizing Flask
"It works on my machine" is not an excuse.
*   **Dockerfile**: Recipe for your OS/Env.
*   **Image**: The compiled artifact.
*   **Container**: The running instance.

### 3. Production Serving (WSGI)
**NEVER** use `python app.py` (Werkzeug) in production. It is single-threaded and insecure.
*   Use **Gunicorn** or **uWSGI**.
*   They handle multiple workers, timeouts, and load balancing.

### 4. Reverse Proxy (Nginx)
Sit Nginx in front of Gunicorn.
*   Handles SSL/TLS (HTTPS).
*   Serves static files efficiently.
*   Buffers slow clients (Prevents "Slowloris" attacks).

---

## Flask Code Examples

### Adding Swagger (`flasgger`)
```python
from flask import Flask, jsonify
from flasgger import Swagger

app = Flask(__name__)
swagger = Swagger(app)

@app.route('/colors/<palette>')
def colors(palette):
    """
    Return a list of colors
    ---
    parameters:
      - name: palette
        in: path
        type: string
        enum: ['all', 'rgb', 'cmyk']
        required: true
    responses:
      200:
        description: A list of colors
    """
    return jsonify(["red", "green", "blue"])
```

### Dockerfile
```dockerfile
# 1. Base Image
FROM python:3.9-slim

# 2. Set work dir
WORKDIR /app

# 3. Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install gunicorn

# 4. Copy code
COPY . .

# 5. Run command (Gunicorn)
CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:8000", "app:app"]
```

### GitHub Actions (CI/CD)
`.github/workflows/test.yml`
```yaml
name: Run Tests
on: [push]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Set up Python
        uses: actions/setup-python@v2
        with:
          python-version: '3.9'
      - name: Install dependencies
        run: pip install -r requirements.txt
      - name: Run pytest
        run: pytest
```

---

## Practical Exercises

### Exercise 1 – Spec it Out
* Add `flasgger` to your API.
* Annotate 3 endpoints with proper docstrings (inputs, outputs, 404s).
* Visit `/apidocs` and test the "Try it out" button.

### Exercise 2 – Docker Run
* Create a `Dockerfile`.
* Build the image: `docker build -t my-flask-api .`
* Run it: `docker run -p 8000:8000 my-flask-api`.
* Verify you can access it from your browser.

### Exercise 3 – The Build Pipeline
* Create a GitHub Action that runs `pytest` automatically on every push.
* Push code that fails a test and verify the build fails.

---

## Mini-Project

**The Final Deployment**
* **Scenario**: You are releasing the "E-Commerce API" v1.0.
* **Requirements**:
    *   **Documentation**: Fully documented endpoints with Swagger.
    *   **Containerization**: A working `docker-compose.yml` that spins up the API + Redis + Postgres.
    *   **CI/CD**: A workflow that runs tests on push.
    *   **Production Config**: Gunicorn configured with 4 workers.

**Evaluation Criteria:**
* Documentation completeness: 30%
* Docker setup works "out of the box": 40%
* CI/CD pipeline correctness: 30%

---

## References
- [Flasgger Docs](https://github.com/flasgger/flasgger)
- [Docker Curriculum](https://docker-curriculum.com/)
- [Gunicorn Configuration](https://docs.gunicorn.org/en/stable/configure.html)
- [Nginx Proxy Guide](https://docs.nginx.com/nginx/admin-guide/web-server/reverse-proxy/)
