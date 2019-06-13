import { RDFClass, FindTask, FixTask, VerifyTask } from '..';

export function generateFindTask(rdfClass: RDFClass): FindTask {
  return new FindTask(rdfClass);
}

export function generateFixTask(rdfClass: RDFClass): FixTask {
  return new FixTask(rdfClass);
}

export function generateVerifyTask(rdfClass: RDFClass): VerifyTask {
  return new VerifyTask(rdfClass);
}
