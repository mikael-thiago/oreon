---
paths: apps/api/**/*
---

## Architecture
- The API utilizes concepts of DDD, CQRS and Clean Architecture
    - Domain logic validation must happen in entities
    - Do not throw errors for validation, use apps\api\src\domain\shared\result.ts instead
    - Use query interface + implementation to read data
    - Use entities to make domain modifications
    - Use repository as persistence pattern
    - Use Unit Of Work to work with different repositories at the same time
- Folder structure:
    - domain: Contains domain related files
    - application: Contains application specific related files
    - infra: Contains interface adapters and infrastructure details

## Decisions
- The API is migrating to use the Result pattern, that consists of return errors as values instead of throwing exceptions. The pattern is implemented at apps\api\src\domain\shared\result.ts.