---
paths: apps/api/**/*
---

## Testing
- Do not use dumb mocks for unit testing, it reduce the test reliability. instead, try create a mock the really implements some correct logic, or, prefer integration tests
- Write integration tests for the most critical paths. For it, uses testcontainers for what is needed.
- Do not focus on coverage, but on ensure the most critical business rules
- All the tests must be inside apps/api/src/tests
- The folder structure inside apps/api/src/tests must match the tested file relative path
- The test suites descriptions must be in pt-BR