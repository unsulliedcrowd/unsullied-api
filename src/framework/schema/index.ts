import { TaskGenerationConfig, TaskGeneration, Task } from '..';

export type RDFClass = string;
export type RDFSubject = string;
export type RDFPredicate = string;
export type RDFObject = string;

export type SchemaConfig = {
  taskGenerationConfig: TaskGenerationConfig
};

export class Schema {
  config: SchemaConfig

  constructor(config) {
    this.config = config;
  }

  generateTasks(): Task[] {
    const enabledClasses = Schema.getClasses(this, this.config.taskGenerationConfig);
    return enabledClasses.map(enabledClass => {
      return TaskGeneration.generateFindTask(enabledClass);
    });
  }
};

export module Schema {
  export function load(config: SchemaConfig): Schema {
    return new Schema(config);
  }

  export function getClasses(schema: Schema, config: TaskGenerationConfig): RDFClass[] {
    // TODO: Take into account inheritance
    return [].concat(config.classesEnabled).map((enabledClass: string) => {
      return enabledClass;
    });
  }

  export function getSubjects(): RDFSubject[] {
    return [];
  }
}


// export function loadSchema(schemaString: string): Schema {
//   return Schema.fromString(string);
// }

// export function saveSchema(schema: Schema) {
//
// }
