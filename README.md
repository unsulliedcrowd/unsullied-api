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

- Base schema abstraction on RDF (subject, predicate, object).
- Find-Task concerns finding new subjects.
- Fix-Task concerns finding missing object for related predicates.
- Verify-Task concerns verifying the current state of the object to be representative for the real world.

Needed:
- [ ] Generate a list of entity types that seem to have missing data. This can be used to generate new Find-Tasks. In order for the task to make sense, more than just a subject is needed, since a subject (id) contains no description of how to get more information about it. Rather, a description of the subject is required in terms of a name and location.
  - [ ] Expected amount of entities of each type?
- Generate a list of known subjects with missing objects based on the schema and existing data. This can be used to generate new Fix-Tasks.
- [ ] Verify-Tasks can be created in response to enough completed Fix-Tasks.

Questions for future work:
- How to find new predicates for existing Entity definitions, and by extension find new types of Entities? (i.e. crowdsourcing the schema)

Source of information (worker interface type): question (generic), upload image (image, time, location, potential labeling via image recognition),  

Task Pipeline Pattern (generation, aggregation): Find-Fix-Verify


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
