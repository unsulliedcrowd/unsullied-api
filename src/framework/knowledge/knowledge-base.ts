import { Schema, Store, RDFSubject } from '..';

export type EntityData = Object & {
};

export class KnowledgeBase {
  schema: Schema;
  store: Store<EntityData>;
  seedData: EntityData[];

  constructor(schema: Schema, store: Store<EntityData>, initialData: EntityData[] = []) {
    this.schema = schema;
    this.store = store;
    this.seedData = initialData;
  }

  getClasses() {
    // console.log(this.schema);
    return this.schema.getClasses();
  }

  async seed() {
    return Promise.all(this.seedData.map(async (entityData) => {
      const subject = entityData["@id"];
      this.updateEntity(subject, entityData);
    }));
  }

  async getAllEntities(): Promise<EntityData[]> {
    return this.store.getAll();
  }

  async getEntity(subject: RDFSubject): Promise<EntityData> {
    const value = await this.store.get(subject);
    return value;
  }

  async updateEntity(subject: RDFSubject, entityData: EntityData): Promise<EntityData> {
    return this.store.set(subject, entityData);
  }
};

export module KnowledgeBase {

};
