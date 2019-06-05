# Unsullied API

## Structure
- [ ] Personas
- [ ] Crowd sources/interface generation (?)
  - [ ] Custom worker interface endpoint/URL
  - [ ] AMT
  - [ ] App
- [ ] Tasks
  - [ ] Generation
  - [ ] Allocation
  - [ ] Aggregation
- [ ] Quality Control
- [ ] Result exposure (store in database, produce CSV, call webhook)

- [ ] Other stuff
  - [ ] Database support


## Examples
Query:
```graphql
mutation {
  login(email: "alice@prisma.io", password: "secret42") {
    token
    user {
      id
      name
    }
  }
}
```

Result:
```json
{
  "data": {
    "login": {
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJjandqdG5wZmNicnA2MGI2MTZ6anA0bmttIiwiaWF0IjoxNTU5Nzc1NTAyfQ.2cSGtRU9w67GKCasEw6jv2zhE3VPOdND3yElMtPKw4I",
      "user": {
        "id": "cjwjtnpfcbrp60b616zjp4nkm",
        "name": "Alice"
      }
    }
  }
}
```

## Docs
- [GraphQL, Prisma](README-GraphQL.md)
