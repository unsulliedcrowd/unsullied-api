import { BehaviorSubject } from 'rxjs';

import { KnowledgeBase } from '..';

export type KnowledgeStats = {
  totalKnowledges: number
};

export module KnowledgeStats {
  export const INITIAL = {
    totalKnowledges: 0
  };
}

export type KnowledgeState = {
  stats: KnowledgeStats
};

export module KnowledgeState {
  export const INITIAL = {
    stats: KnowledgeStats.INITIAL
  };
};

export class KnowledgeControl {
  knowledgeBase: KnowledgeBase;

  subject: BehaviorSubject<KnowledgeState>;
  currentState: KnowledgeState;

  constructor(knowledgeBase: KnowledgeBase) {
    this.knowledgeBase = knowledgeBase;

    this.currentState = KnowledgeState.INITIAL;
    this.subject = new BehaviorSubject(this.currentState);
  }

  

}

export module KnowledgeControl {

}
