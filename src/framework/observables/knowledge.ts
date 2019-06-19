import * as _ from 'lodash';
import { BehaviorSubject, combineLatest } from 'rxjs';

import { KnowledgeBase, RDFSubject, ConfigControl, TaskResult } from '..';
import { map } from 'rxjs/operators';
import PQueue from 'p-queue';

const queue = new PQueue({
  concurrency: 1
});

export type KnowledgeStats = {
  totalEntityTypes: number
};

export module KnowledgeStats {
  export const INITIAL = {
    totalEntityTypes: 0
  };
}

export type KnowledgeState = {
  stats: KnowledgeStats,
  knownClasses: RDFSubject[],
  pendingResults: TaskResult[],
  knownStaleEntities: RDFSubject[],
};

export module KnowledgeState {
  export const INITIAL = {
    stats: KnowledgeStats.INITIAL,
    knownClasses: [],
    pendingResults: [],
    knownStaleEntities: [],
  };

  export function updateKnownClasses(state: KnowledgeState, knownClasses: RDFSubject[]): KnowledgeState {
    return {
      ...state,
      stats: {
        ...state.stats,
        totalEntityTypes: knownClasses.length
      },
      knownClasses: knownClasses
    }
  }

  export function updateKnownStaleEntities(state: KnowledgeState, knownStaleEntities: RDFSubject[]): KnowledgeState {
    return {
      ...state,
      stats: {
        ...state.stats,
        totalEntityTypes: knownStaleEntities.length
      },
      knownStaleEntities: knownStaleEntities
    }
  }

  export function updateResults(state: KnowledgeState, result: TaskResult): KnowledgeState {
    return {
      ...state,
      pendingResults: [].concat(state.pendingResults, result)
    };
  }
};

export class KnowledgeControl {
  configControl: ConfigControl;
  knowledgeBase: KnowledgeBase;

  subject: BehaviorSubject<KnowledgeState>;
  currentState: KnowledgeState;

  constructor(configControl: ConfigControl, knowledgeBase: KnowledgeBase) {
    this.configControl = configControl;
    this.knowledgeBase = knowledgeBase;

    this.currentState = KnowledgeState.INITIAL;
    this.subject = new BehaviorSubject(this.currentState);
  }

  async initialize() {
    combineLatest(
      this.configControl.subject,
    ).pipe(map((states) => {
      const [ configState ] = states;

      return this.currentState;
    })).subscribe(this.subject);

    await this.updateCurrentClasses();
  }

  async updateCurrentClasses(): Promise<RDFSubject[]> {
    const newClasses = this.knowledgeBase.getClasses();

    const newState = KnowledgeState.updateKnownClasses(this.currentState, newClasses);
    this.currentState = newState;
    await queue.add(async () => this.subject.next(newState));

    return newClasses;
  }

  async updateStaleEntities(): Promise<RDFSubject[]> {
    const newClasses = this.knowledgeBase.getStaleEntities();

    const newState = KnowledgeState.updateKnownClasses(this.currentState, newClasses);
    this.currentState = newState;
    await queue.add(async () => this.subject.next(newState));

    return newClasses;
  }

  async submitTaskResult(taskResult: TaskResult): Promise<TaskResult> {
    const newState = KnowledgeState.updateResults(this.currentState, taskResult);
    this.currentState = newState;
    await queue.add(async () => this.subject.next(newState));

    return taskResult;
  }

}

export module KnowledgeControl {

}
