# Module 13 – Testing Strategies

## Module Overview
Production APIs must be tested. Relying on manual clicks or Postman isn't enough. This module covers **Automated Testing** strategies to ensure your code doesn't break when you deploy.

**Goals:**
- Understand the **Testing Pyramid** (Unit vs Integration vs E2E).
- Master **pytest** for Python testing.
- Write **Unit Tests** for business logic.
- Write **Integration Tests** for Flask API endpoints.
- Learn to **Mock** external services (Payment Gateways, Email APIs).

---

## Lecture Content

### 1. The Pyramid
*   **Unit Tests** (70%): Test a single function/class in isolation. Fast (<1ms).
*   **Integration Tests** (20%): Test API endpoints + Database. Slower (100ms+).
*   **E2E Tests** (10%): Test full user flow (Selenium/Playwright). Slowest.

### 2. Pytest Basics
`pytest` is the standard in Python.
*   Auto-discovery: Finds files named `test_*.py`.
*   Fixtures: Setup/Teardown logic (DB creation, auth tokens).
*   `assert`: Simple assertion logic.

### 3. Testing Flask Apps
Key concept: **Test Client**.
Flask provides a virtual client to send requests without running a real server.
```python
def test_home(client):
    response = client.get("/")
    assert response.status_code == 200
```

### 4. Mocking External Services
Never call Stripe/Twilio in tests! Use `unittest.mock`.
*   **Why?** Speed, Cost, Reliability (what if Stripe is down?).

---

## Flask Code Examples

### Test Configuration (`conftest.py`)
This file contains "fixtures" shared across tests.
```python
import pytest
from app import create_app, db

@pytest.fixture
def app():
    app = create_app("testing")
    with app.app_context():
        db.create_all()
        yield app
        db.drop_all()

@pytest.fixture
def client(app):
    return app.test_client()
```

### Writing a Unit Test
Tests pure logic, no DB needed.
```python
from app.utils import calculate_discount

def test_calculate_discount():
    price = 100
    expected = 90
    assert calculate_discount(price, 0.10) == expected
```

### Writing an Integration Test
Tests the route, DB, and serialization.
```python
def test_create_user(client):
    payload = {"username": "testuser", "email": "test@test.com"}
    response = client.post("/users", json=payload)
    
    assert response.status_code == 201
    assert response.json["id"] is not None
```

### Mocking Example
```python
from unittest.mock import patch

@patch("app.services.payment_gateway.charge_card")
def test_payment(mock_charge, client):
    # Setup the mock to return success
    mock_charge.return_value = {"status": "success", "tx_id": "123"}
    
    response = client.post("/pay", json={"amount": 50})
    
    assert response.status_code == 200
    # Verify mock was called
    mock_charge.assert_called_once()
```

---

## Practical Exercises

### Exercise 1 – TDD (Test Driven Development)
* Write a test for a function `is_valid_email(email)` **before** implementing it.
* Run tests (they fail).
* Implement the function.
* Run tests (they pass).

### Exercise 2 – Authentication Tests
* Write a test that verifies `GET /protected` returns **401 Unauthorized** without a token.
* Write a test that generates a token (via fixture) and verifies **200 OK**.

### Exercise 3 – Database Rollbacks
* Ensure your tests don't leave data behind. Use a fixture to clear the DB after every test.

---

## Mini-Project

**Test Suite for E-Commerce API**
* **Scenario**: You inherited the "Product Catalog" API from Module 11 but it has *zero* tests.
* **Requirements**:
    *   Setup `pytest`.
    *   Write 5 Unit Tests for helper functions.
    *   Write 3 Integration Tests for API endpoints (`GET /products`, `POST /products`).
    *   Achieve >80% code coverage (check with `pytest-cov`).
*   **Bonus**: Mock a redis cache hit/miss.

**Evaluation Criteria:**
* Test structure (fixtures, separation of concerns): 30%
* Coverage (Happy path + Edge cases): 40%
* Correct use of Mocks: 30%

---

## References
- [Pytest Documentation](https://docs.pytest.org/)
- [Flask Testing Guide](https://flask.palletsprojects.com/en/latest/testing/)
- [Mocking in Python](https://realpython.com/python-mock-library/)
