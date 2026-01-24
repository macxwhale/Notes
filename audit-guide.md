# LLM Audit & Fix Guide: Production-Grade APIs

This document provides a definitive list of pointwise instructions for an LLM to audit a Flask application and automatically fix inconsistencies.

## 1. Core Architecture Checks
*   **Application Factory**: Verify `create_app()` exists in `app/__init__.py`. Fix global `app` instances.
*   **Extensions Pattern**: Check for `app/extensions.py`. Ensure shared extension objects (db, migrate, jwt) are initialized there to prevent circular imports.
*   **Blueprint Organization**: Ensure every route belongs to a defined Blueprint. No routes should be defined using `@app.route` directly on the factory instance.
*   **Structured Configuration**: Verify a `Config` class hierarchy in `config.py`. Audit for hardcoded secrets and move them to `.env`.

## 2. API Design Consistency
*   **URL Naming Convention**: Audit all endpoint URLs.
    *   Use **nouns** only.
    *   Use **plural** resource names.
    *   Use **hyphens** (kebab-case), not underscores or camelCase.
    *   Force **lowercase**.
    *   *Example*: `/api/v1/user-profiles` (Correct) vs `/api/v1/getUser_Profile` (Incorrect).
*   **Nesting Depth**: Limit resource nesting to a maximum of **2 levels**. Suggest ID-based flat routes for deeper relationships.
*   **Verb Semantics**: Ensure `POST` creates, `PUT` replaces, `PATCH` modifies, and `GET` retrieves. Verify `DELETE` returns a `204 No Content`.

## 3. Data Validation & Contracts
*   **Mandatory Schemas**: Every route must have a Marshmallow schema for both input (`load`) and output (`dump`).
*   **Partial Updates**: Verify `PATCH` routes use `schema.load(json_data, partial=True)`.
*   **Custom Business Validation**: Check for uniqueness requirements (e.g., unique email) and ensure they are handled via `@validates` within the schema.

## 4. Standardized JSON Response (The Envelope Pattern)
*   **Standard Wrapper**: Every response (Success or Error) must use this structure:
    ```json
    {
      "status": "success | error",
      "code": 200,
      "data": { ... },
      "meta": { ... }
    }
    ```
*   **Error Detail Model**: Errors must not be plain strings. They must include a `type` and an array of `details`:
    ```json
    {
      "status": "error",
      "error": {
        "type": "validation_error",
        "message": "Instructions here",
        "details": [{"field": "x", "issue": "y"}]
      }
    }
    ```
*   **List Metadata**: All collections must return pagination metadata in the `meta.pagination` block.

## 5. Reliability & Security
*   **Password Safety**: Ensure `werkzeug.security.generate_password_hash` is used. Flag all `plain-text` or `simple-hash` storage.
*   **CORS Policy**: Verify `Flask-CORS` is active with restricted origins for production environments.
*   **Security Headers**: Check for `Flask-Talisman` or custom headers for HSTS and CSP.
*   **Database Efficiency**: Detect and fix **N+1 query patterns** using `joinedload`. Ensure indexes are defined for frequently filtered columns.

## 6. API Evolution
*   **Versioning**: All routes must be prefixed with a version (e.g., `/v1/`).
*   **Deprecation**: Use `Sunset` and `Deprecation` HTTP headers for legacy routes.
