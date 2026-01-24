### `10-api-monitoring.md`

````markdown
# Module 10 – Monitoring, Logging & Observability

## Module Overview
Learn how to **monitor, log, and observe** your API for production readiness.

**Goals:**
- Implement structured logging
- Monitor endpoint latency, error rates
- Integrate with Prometheus/Grafana
- Set up alerts for failures

---

## Lecture Content

### 1. Structured Logging
Use JSON logs for easy ingestion:
```python
import logging, json
logger = logging.getLogger("api")
logging.basicConfig(level=logging.INFO)

logger.info(json.dumps({"event": "user_created", "user_id": 123}))
````

### 2. Performance Monitoring

```python
from flask import g, request
import time

@app.before_request
def start_timer():
    g.start = time.time()

@app.after_request
def log_duration(response):
    duration = time.time() - g.start
    logger.info(json.dumps({"path": request.path, "duration": duration}))
    return response
```

### 3. Prometheus Integration

```python
from prometheus_flask_exporter import PrometheusMetrics
metrics = PrometheusMetrics(app)
```

### 4. Error Tracking

* Optional: Sentry for production exception monitoring

### 5. Common Mistakes

* Ignoring error logs
* Logging sensitive data
* No metrics or alerting

---

## Exercises

1. Add structured logging for all endpoints
2. Monitor request durations
3. Integrate Prometheus metrics for `/users` and `/products`
4. Simulate a failure and ensure it is logged

---

## Mini-Project

**Observability API**

* Implement logging, metrics, and error tracking for Mid-Course API
* Evaluation: Logging (30%), Metrics (30%), Error Tracking (40%)

---

## References

* [Prometheus Flask Exporter](https://github.com/rycus86/prometheus_flask_exporter)
* [Sentry Flask Integration](https://docs.sentry.io/platforms/python/flask/)

````
