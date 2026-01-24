# Module 10 – Monitoring, Logging & Observability

## Module Overview
Building an API is only the first step. To ensure it runs reliably in production, you need **observability**. This module covers how to generate structured logs, collect metrics, and track errors to debug issues effectively.

**Goals:**
- Implement **Structured Logging** (JSON) for easy parsing.
- Collect **APM Metrics** (Latency, Throughput, Error Rates).
- Integrate **Prometheus** for metrics scraping.
- Set up **distributed tracing** (concepts & basics).
- Track errors using **Sentry**.

---

## Lecture Content

### 1. Structured Logging vs. Plain Text
Production logs should be machine-readable. Plain text logs are hard to prefix/query.
**Bad:**
`[INFO] User 123 logged in at 10:00 AM`
**Good (JSON):**
`{"level": "info", "event": "user_login", "user_id": 123, "timestamp": "2023-10-01T10:00:00Z"}`

**Python Implementation:**
Use `python-json-logger` or a custom formatter.

```python
import logging
from pythonjsonlogger import jsonlogger

logger = logging.getLogger()
logHandler = logging.StreamHandler()
formatter = jsonlogger.JsonFormatter('%(timestamp)s %(level)s %(name)s %(message)s')
logHandler.setFormatter(formatter)
logger.addHandler(logHandler)
logger.setLevel(logging.INFO)

logger.info("User created", extra={"user_id": 123, "ip": "192.168.1.1"})
```

### 2. The Three Pillars of Observability
1.  **Logs**: Discrete events (e.g., "Error: DB connection failed").
2.  **Metrics**: Aggregates over time (e.g., "Avg Latency: 45ms").
3.  **Traces**: Lifecycle of a request across services.

### 3. Prometheus Metrics with Flask
Prometheus pulls metrics from your app. You need to expose a `/metrics` endpoint.

**Key Metrics to Measure:**
- **Request Count**: Total number of requests (by status code).
- **Request Latency**: How long requests take (histogram).
- **Resource Usage**: CPU, Memory.

**Code Example:**
```python
from flask import Flask
from prometheus_flask_exporter import PrometheusMetrics

app = Flask(__name__)
metrics = PrometheusMetrics(app)

@app.route('/order')
@metrics.counter('order_created', 'Number of orders created')
def create_order():
    return "Order created"
```

### 4. Error Tracking with Sentry
Don't rely on logs for crashes. Use Sentry for real-time alerting.

```python
import sentry_sdk
from sentry_sdk.integrations.flask import FlaskIntegration

sentry_sdk.init(
    dsn="your_dsn_here",
    integrations=[FlaskIntegration()]
)
```
Sentry automatically captures unhandled exceptions and includes stack traces, local variables, and user context.

---

## Flask Code Examples

### Complete Observability Setup

```python
import logging
import time
from flask import Flask, request, g
from pythonjsonlogger import jsonlogger
from prometheus_flask_exporter import PrometheusMetrics

app = Flask(__name__)
metrics = PrometheusMetrics(app)

# Setup JSON Logger
logHandler = logging.StreamHandler()
formatter = jsonlogger.JsonFormatter('%(asctime)s %(levelname)s %(message)s')
logHandler.setFormatter(formatter)
logger = logging.getLogger("api")
logger.addHandler(logHandler)
logger.setLevel(logging.INFO)

@app.before_request
def start_timer():
    g.start = time.time()

@app.after_request
def log_request(response):
    if request.path == "/metrics":
        return response
    
    duration = time.time() - g.start
    
    logger.info("Request finished", extra={
        "path": request.path,
        "method": request.method,
        "status": response.status_code,
        "duration": duration,
        "ip": request.remote_addr
    })
    return response

@app.route("/hello")
def hello():
    return "Hello World"
```

---

## Practical Exercises

### Exercise 1 – JSON Logging
* Configure the standard Python `logging` library to output JSON.
* Log a "user_login" event with `user_id` and `ip_address` fields.

### Exercise 2 – Prometheus Integration
* Install `prometheus-flask-exporter`.
* Expose the `/metrics` endpoint.
* Run a load test (using `curl` or `k6`) and verify metrics change.

### Exercise 3 – Custom Metrics
* Add a custom counter metric for "critical_errors".
* Increment it only when a 500 error occurs.

---

## Mini-Project

**Observable API**
* **Scenario**: You are building a payment processing API.
* **Requirements**:
    * Log every payment attempt (JSON) with `amount` and `currency`.
    * Monitor "Payment Success Rate" using Prometheus gauges or counters.
    * Alert (simulate via log) if payment takes > 2 seconds.
    * Track standard Flask metrics (latency/throughput).

**Evaluation Criteria:**
* Logs are machine-readable and contain context: 40%
* Metrics endpoint works and shows custom metrics: 40%
* Code structure and meaningful event names: 20%

---

## References
- [The 3 Pillars of Observability](https://www.oreilly.com/library/view/distributed-systems-observability/9781492033431/ch04.html)
- [Prometheus Flask Exporter](https://github.com/rycus86/prometheus_flask_exporter)
- [Python JSON Logger](https://github.com/madzak/python-json-logger)
