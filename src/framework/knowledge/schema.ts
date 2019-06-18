import * as path from 'path';
import * as fs from 'fs';
import * as N3 from 'n3';
import * as rdf from 'rdf';

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

  getClasses() {
    return Schema.getClasses(this, this.config.taskGenerationConfig);
  }

  generateTasks(): Task[] {
    const enabledClasses = this.getClasses();
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
    const parser = new N3.Parser();
    const triples: Array<N3.Triple> = <any>parser.parse(turtle, null); // Explicitly pass null as a callback to satisfy the types

    const graph = triples.reduce((graph, triple) => {
      const { subject, predicate, object } = triple;
      // console.log('Parsed:', subject.id, predicate.id, object.id);
      graph.add(rdf.environment.createTriple(subject.id, predicate.id, object.id));
      return graph;
    }, new rdf.Graph);


    // console.log('Schema config:', config);
    // const schemaFile = path.join(__dirname, "../../../src/examples/thrash-cans/schema.ttl");
    // console.log(schemaFile, config.schemaFile);
    // console.log(__dirname);
    // console.log('Turle:', turtle);

    return new Schema(config, graph);
  }

  export function getClasses(schema: Schema, config: TaskGenerationConfig): RDFClass[] {
    const graph = schema.graph.match(null, "http://www.w3.org/1999/02/22-rdf-syntax-ns#type", "http://www.w3.org/2002/07/owl#Class");
    const classes = Object.keys(graph.indexSOP);
    // console.log(classes)
    return classes;
    // .map(t => t.subject);

    // TODO: Take into account inheritance
    // return [].concat(config.classesEnabled).map((enabledClass: string) => {
    //   return enabledClass;
    // });
  }

  export function getSubjects(): RDFSubject[] {
    return [];
  }
}
