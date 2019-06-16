import { BehaviorSubject } from 'rxjs';
import * as uuid from 'uuid';

import { Worker, Persona } from '..';

export type CrowdStats = {
  availableWorkersTotal: number
};

export module CrowdStats {
  export const INITIAL = {
    availableWorkersTotal: 0
  };
}

export type CrowdState = {
  stats: CrowdStats
  crowd: Worker[]
};

export module CrowdState {
  export const INITIAL = {
    stats: CrowdStats.INITIAL,
    crowd: []
  };

  export function addWorker(state: CrowdState, worker: Worker): CrowdState {
    console.log('Adding worker');
    return {
      ...state,
      stats: {
        ...state.stats,
        availableWorkersTotal: ++state.stats.availableWorkersTotal
      },
      crowd: [].concat(state.crowd, worker)
    };
  }
};

export class CrowdControl {
  subject: BehaviorSubject<CrowdState>;
  currentState: CrowdState;

  constructor() {
    this.currentState = CrowdState.INITIAL;
    this.subject = new BehaviorSubject(this.currentState);
  }

  registerWorker(_profile: Worker.Profile): Worker {
    const id = uuid.v4();
    const profile = {
      ..._profile,
      id,
    };

    // console.log('Persona', Persona);
    const persona = Persona.DEFAULT;
    const worker = new Worker(profile, persona);

    // TODO: Queue this
    this.subject.next(CrowdState.addWorker(this.currentState, worker));

    return worker;
  }

}

export module CrowdControl {

}
