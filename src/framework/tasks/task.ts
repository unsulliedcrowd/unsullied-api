import { RDFClass } from '..';

export class Task {
  constructor() {

  }
}

export class FindTask extends Task {
  rdfClass: string;

  constructor(rdfClass: RDFClass) {
    super();

    this.rdfClass = rdfClass;
  }
}

export class FixTask extends Task {
  rdfClass: string;

  constructor(rdfClass: RDFClass) {
    super();

    this.rdfClass = rdfClass;
  }
}

export class VerifyTask extends Task {
  rdfClass: string;

  constructor(rdfClass: RDFClass) {
    super();

    this.rdfClass = rdfClass;
  }
}

export type MicroTask = Task;
