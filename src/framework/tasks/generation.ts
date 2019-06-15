import { RDFClass, FindTask, FixTask, VerifyTask, Schema } from '..';

export function generateFindTask(schema: Schema, rdfClass: RDFClass): FindTask {
  return new FindTask(schema, rdfClass);
}

export function generateFixTask(schema: Schema, rdfClass: RDFClass): FixTask {
  return new FixTask(schema, rdfClass);
}

export function generateVerifyTask(schema: Schema, rdfClass: RDFClass): VerifyTask {
  return new VerifyTask(schema, rdfClass);
}
