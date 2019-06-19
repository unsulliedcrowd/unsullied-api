import { Schema } from '../..';

export type QuestionTemplate = (...strings: string[]) => string;
export module QuestionTemplate {
  export const FIND = (entity: string) => `Do you know of any entities of type ${entity}?`;
  export const FIND_LOCATION = (entity: string, location: string) => `Do you know of any entities of type ${entity} at ${location}?`;

  export const FIX = (entity: string, propertyName: string) => `How would you label this ${entity} with regards to its state in terms of: ${propertyName}?`;

  export const VERIFY_SINGLE = (entity: string, propertyName: string, propertyValue: string) => `For this ${entity}, would you label the ${propertyName} as ${propertyValue}`;
}

export class Question {
  template: QuestionTemplate;
  args: string[];

  constructor(template: QuestionTemplate, args: string[] = []) {
    this.template = template;
    this.args = args;
  }

  toString() {
    return this.template(...this.args);
  }
}

export module Question {
}

export type MicroTask = {
  taskType: String;
  taskParams: String[];
  interfaceType: String;
  interfaceParams: String[];
  resultType: String;
  resultParams: String[];
};

export module MicroTask {
  export module TaskTypes {
    export const FIND = "FIND";
    export const FIX = "FIX";
    export const VERIFY = "VERIFY";
  }

  export module InterfaceTypes {
    export const QUESTION = "QUESTION";
    export const IMAGE = "IMAGE";
  }

  export module ResultTypes {
    export const PLAIN_TEXT = "PLAIN_TEXT";
    export const LABEL = "LABEL";
    export const BOOLEAN = "BOOLEAN";
    export const IMAGE = "IMAGE";
  }

  export function questionForImage(question: String): MicroTask {
    return {
      taskType: TaskTypes.FIND,
      taskParams: [],
      interfaceType: InterfaceTypes.QUESTION,
      interfaceParams: [ question ],
      resultType: ResultTypes.IMAGE,
      resultParams: [],
    };
  }

  export function questionForImageBoolean(image: any, question: String, propertyName: String): MicroTask {
    return {
      taskType: TaskTypes.FIX,
      taskParams: [],
      interfaceType: InterfaceTypes.IMAGE,
      interfaceParams: [ image, question ],
      resultType: ResultTypes.BOOLEAN,
      resultParams: [ propertyName ],
    };
  }
}

export * from './result';
