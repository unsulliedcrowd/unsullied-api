import { Question, QuestionTemplate } from './micro-task';
import { RDFClass, Schema } from '..';

export class Task {
  schema: Schema;
  constructor(schema: Schema) {
    this.schema = schema;
  }

  toString() {
    return `${this.constructor.name}`;
  }
}

export class MacroTask extends Task {
  rdfClass: string;
  question: Question;

  constructor(schema: Schema, rdfClass: RDFClass) {
    super(schema);

    this.rdfClass = rdfClass;

    this.question = new Question(QuestionTemplate.FIND, [ this.rdfClass ]);
  }

  toString() {
    return `${super.toString()} <${this.rdfClass}>: '${this.question.toString()}'`;
  }
}

export class FindTask extends MacroTask {
  constructor(schema: Schema, rdfClass: RDFClass) {
    super(schema, rdfClass);
  }

}

export class FixTask extends MacroTask {
  constructor(schema: Schema, rdfClass: RDFClass) {
    super(schema, rdfClass);

    this.question = new Question(QuestionTemplate.FIX, [ this.rdfClass, "isFull" ]);
  }

}

export class VerifyTask extends MacroTask {
  constructor(schema: Schema, rdfClass: RDFClass) {
    super(schema, rdfClass);
  }
}
