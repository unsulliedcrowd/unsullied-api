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

export class Question {
  template: Question.Template;
  args: string[];

  constructor(template: Question.Template, args: string[] = []) {
    this.template = template;
    this.args = args;
  }

  toString() {
    return this.template(...this.args);
  }
}

export module Question {
  export type Template = (...strings: string[]) => string;
  export module Template {
    export const FIND = (entity: string) => `Do you know of any entities of type ${entity}?`;
    export const FIND_LOCATION = (entity: string, location: string) => `Do you know of any entities of type ${entity} at ${location}?`;

    export const FIX = (entity: string, propertyName: string) => `How would you label this ${entity} with regards to its state in terms of: ${propertyName}?`;

    export const VERIFY_SINGLE = (entity: string, propertyName: string, propertyValue: string) => `For this ${entity}, would you label the ${propertyName} as ${propertyValue}`;
  }
}

export class MicroTask extends Task {
  constructor(schema: Schema) {
    super(schema);
  }
}

export class MacroTask extends Task {
  rdfClass: string;
  question: Question;

  constructor(schema: Schema, rdfClass: RDFClass) {
    super(schema);

    this.rdfClass = rdfClass;

    this.question = new Question(Question.Template.FIND, [ this.rdfClass ]);
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

    this.question = new Question(Question.Template.FIX, [ this.rdfClass, "isFull" ]);
  }

}

export class VerifyTask extends MacroTask {
  constructor(schema: Schema, rdfClass: RDFClass) {
    super(schema, rdfClass);
  }
}
