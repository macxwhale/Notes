# API Design Course Glossary

| Term | Definition | Module Introduced |
|------|------------|-----------------|
| API | Application Programming Interface; a set of endpoints that allow applications to communicate | 1 |
| REST | Representational State Transfer; an architectural style for APIs | 1 |
| Endpoint | A URL exposed by an API to handle requests | 1 |
| Blueprint | Flask modular routing component | 2 |
| Schema | Structure for request/response validation and serialization | 3 |
| Marshmallow | Python library for schema validation | 3 |
| ValidationError | Error raised when input fails schema validation | 3 |
| JWT | JSON Web Token, used for authentication | 5 |
| OAuth2 | Authorization framework for secure delegated access | 9 |
| Access Token | Short-lived token used to access protected resources | 5,9 |
| Refresh Token | Long-lived token to renew access tokens | 9 |
| Role-Based Access | Authorization mechanism based on user roles | 5,9 |
| Scope | Fine-grained permissions attached to tokens | 5,9 |
| Caching | Storing frequently accessed data to improve performance | 7,11 |
| Redis | In-memory key-value store used for caching | 7,11 |
| Compression | Reducing response payload size (gzip, brotli) | 7,11 |
| Multi-Tenancy | Single API serving multiple clients/organizations | 8,12 |
| Versioning | Maintaining multiple versions of an API | 8,12 |
| Observability | Ability to monitor and understand API behavior | 10 |
| Prometheus | Open-source metrics and monitoring system | 10 |
| Sentry | Error tracking and logging tool | 10 |
| Pagination | Limiting the number of items returned in responses | 7,11 |
| N+1 Query | Performance anti-pattern in databases | 7,11 |
| Backward Compatibility | Ensuring old clients continue to work after updates | 8,12 |
| API Gateway | Service that routes, authenticates, and throttles requests | Expert Concept |
| Rate Limiting | Limiting requests per user/tenant to prevent abuse | Expert Concept |
