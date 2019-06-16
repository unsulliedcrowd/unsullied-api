import { BehaviorSubject } from 'rxjs';
import * as uuid from 'uuid';
import * as _ from 'lodash';

import { Worker, Persona, MicroTask } from '..';

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
  crowd: {
    availableWorkers: Worker[],
    engagedWorkers: Worker[],
  }
};

export module CrowdState {
  export const INITIAL = {
    stats: CrowdStats.INITIAL,
    crowd: {
      availableWorkers: [],
      engagedWorkers: []
    }
  };

  export function addWorker(state: CrowdState, worker: Worker): CrowdState {
    console.log('Adding worker');
    return {
      ...state,
      stats: {
        ...state.stats,
        availableWorkersTotal: ++state.stats.availableWorkersTotal
      },
      crowd: {
        availableWorkers: [].concat(state.crowd.availableWorkers, worker),
        engagedWorkers: state.crowd.engagedWorkers
      }
    };
  }

  export function assignWorker(state: CrowdState, worker: Worker) {
    return {
      ...state,
      crowd: {
        availableWorkers: _.without(state.crowd.availableWorkers, worker),
        engagedWorkers: [].concat(state.crowd.engagedWorkers, worker),
      }
    }
  }
};

export class CrowdControl {
  subject: BehaviorSubject<CrowdState>;
  currentState: CrowdState;

  constructor() {
    this.currentState = CrowdState.INITIAL;
    this.subject = new BehaviorSubject(this.currentState);
  }

  workerIsAvailable(id: string) {
    const result = this.getAvailableWorker(id);
    return result != undefined;
  }

  getAvailableWorker(id: string) {
    const result = _.find(this.currentState.crowd.availableWorkers, (worker) => {
      console.log('Checking worker', worker);
      return worker.profile.id === id;
    });

    console.log('Get available worker with id', id, ":", result);

    return result;
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
    const newState = CrowdState.addWorker(this.currentState, worker);
    this.subject.next(newState);
    this.currentState = newState;

    return worker;
  }

  assignWorker(worker: Worker, microTask: MicroTask): Worker {
    const _worker = worker.assignTask(microTask);

    // TODO: Queue this
    const newState = CrowdState.assignWorker(this.currentState, worker);
    this.subject.next(newState);
    this.currentState = newState;

    return _worker;
  }

}

export module CrowdControl {

}
