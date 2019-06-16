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

Task generation:
- Generate Find-Tasks based on entity types. (schema only)
- Generate Fix-Tasks based on existing entity instances. (some kind of DB needed, with potential seed data)
- Generate Verify-Tasks based on incoming results/known data.

- [ ] Add database (redis)
- [ ] Finish schema logic
- [ ] Generate Find and Fix tasks

- [ ] Build worker logic
- [ ] Assign tasks to workers
- [ ] Simulate worker results
- [ ] Build streaming logic

- [ ] Generate Verify-Tasks based on incoming results

Micro-task result types: plain text answer, labeling (with preset options, collaborative labeling tasks where crowd decides on top-k labels), provide an image, yes/no (boolean), number (int, real number), error (task can not be completed by worker, optional feedback)

Entity: ThrashCan -> Passive Find-Task, restrict 'location' property to range 'TU Delft campus', stale after 1 day, covers properties {name, location, image}, grouped to plain-text name and 'upload an image' task.

Property isFull: -> Active Fix-Task, boolean "label image" task, "Would you say this ThrashCan is full?" (split isSomething based on 'is' and lowercase all words)

Meta-properties: createdAt, updatedAt (managed by the system)

All properties covered!

Quality assurance: Verify-Tasks generated based on other tasks, 1 passive Find-Task, no verification i.e. every result is immediately accepted, 1 active Fix-Task, threshold 10, at least 10 workers must agree on the labeling


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
