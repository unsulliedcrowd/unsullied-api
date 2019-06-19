import * as _ from 'lodash';
import { BehaviorSubject, combineLatest } from 'rxjs';

import { KnowledgeBase, RDFSubject, ConfigControl, TaskResult } from '..';
import { map } from 'rxjs/operators';

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

  initialize() {
    combineLatest(
      this.configControl.subject,
    ).pipe(map((states) => {
      const [ configState ] = states;

      return this.currentState;
    })).subscribe(this.subject);

    this.updateCurrentClasses();
  }

  updateCurrentClasses(): RDFSubject[] {
    const newClasses = this.knowledgeBase.getClasses();

    const newState = KnowledgeState.updateKnownClasses(this.currentState, newClasses);
    this.subject.next(newState);
    this.currentState = newState;

    return newClasses;
  }

  updateStaleEntities(): RDFSubject[] {
    const newClasses = this.knowledgeBase.getStaleEntities();

    const newState = KnowledgeState.updateKnownClasses(this.currentState, newClasses);
    this.subject.next(newState);
    this.currentState = newState;

    return newClasses;
  }

  submitTaskResult(taskString: String, taskResultString: String, file?: String): TaskResult {
    const taskResult: TaskResult = { taskString, taskResultString, file };

    const newState = KnowledgeState.updateResults(this.currentState, taskResult);
    this.subject.next(newState);
    this.currentState = newState;

    return taskResult;
  }

}

export module KnowledgeControl {

}
