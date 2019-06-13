export type TaskGenerationConfig = {
  classesEnabled: string[],
};

export module TaskGenerationConfig {
  export const DEFAULT: TaskGenerationConfig = {
    classesEnabled: [],
  };
}



export type QuestionTemplate = string;


// Find: Identify entities unknown to the system
// Fix: Fill in the missing data for entities we do know about
// Verify: Verify the data of the entities we do know about


export type Question = {
  template: string,
  values: string[]
};

export module Question {

};

export * from './task';
export * from './generation';
export * from './allocation';
export * from './aggregation';

import * as TaskGeneration from './generation';
import * as TaskAllocation from './allocation';
import * as TaskAggregation from './aggregation';

export {
  TaskGeneration,
  TaskAllocation,
  TaskAggregation,
};
