import * as path from 'path';
import * as fs from 'fs';

import * as RDFTools from 'rdf-tools';
import * as semtools from 'semantic-toolkit';

import { TaskGenerationConfig, TaskGeneration, Task } from '..';

export type RDFClass = string;
export type RDFSubject = string;
export type RDFPredicate = string;
export type RDFObject = string;

export type SchemaConfig = {
  schemaFile: string,
  taskGenerationConfig: TaskGenerationConfig,
};

export class Schema {
  config: SchemaConfig
  graph: any;

  constructor(config, graph) {
    this.config = config;
    this.graph = graph;
  }

  async initialize() {

  }

  generateTasks(): Task[] {
    const enabledClasses = Schema.getClasses(this, this.config.taskGenerationConfig);
    const findTasks =  enabledClasses.map(enabledClass => {
      return TaskGeneration.generateFindTask(this, enabledClass);
    });

    return [
      ...findTasks
    ];
  }
};

export module Schema {
  export function load(config: SchemaConfig): Schema {
    const turtle = fs.readFileSync(config.schemaFile).toString();
    const graph = RDFTools.getRDFGraph(turtle);

    // console.log('Schema config:', config);
    // const schemaFile = path.join(__dirname, "../../../src/examples/thrash-cans/schema.ttl");
    // console.log(schemaFile, config.schemaFile);
    // console.log(__dirname);
    // console.log('Turle:', turtle);

    return new Schema(config, graph);
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
