import * as _ from 'lodash';
import { BehaviorSubject, combineLatest } from 'rxjs';

import { KnowledgeBase, RDFSubject, ConfigControl } from '..';
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
};

export module KnowledgeState {
  export const INITIAL = {
    stats: KnowledgeStats.INITIAL,
    knownClasses: []
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



}

export module KnowledgeControl {

}
