import { BehaviorSubject, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';
import * as uuid from 'uuid';
import * as _ from 'lodash';

import { Worker, Persona, MicroTask, ConfigControl } from '..';

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
    const newState = {
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

    return newState;
  }

  // export function assignTasks(state: CrowdState): CrowdState {
  //   let newState = this.currentState;
  //
  //   let availableTasks = this.currenTaskState.microTasks;
  //   // while(newState.crowd.availableWorkers.length > 0) {
  //     let availableWorkers = newState.crowd.availableWorkers;
  //     const randomWorkerIndex = Math.round(Math.random() * (availableWorkers.length - 1));
  //     const randomWorker = availableWorkers[randomWorkerIndex];
  //
  //     const randomTaskIndex = Math.round(Math.random() * (availableTasks.length - 1));
  //     const randomTask = availableTasks[randomTaskIndex];
  //
  //     randomWorker.assignTask();
  //
  //     this.taskControl.assingTask(randomTask, randomWorker);
  //     newState = CrowdState.assignWorker(newState, randomWorker);
  //   // }
  //
  //   return newState;
  //
  // }

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
  configControl: ConfigControl;

  subject: BehaviorSubject<CrowdState>;
  currentState: CrowdState;

  constructor(configControl: ConfigControl) {
    this.configControl = configControl;
    this.currentState = CrowdState.INITIAL;
    this.subject = new BehaviorSubject(this.currentState);
  }

  initialize() {
    combineLatest(
      this.configControl.subject,
    ).pipe(map((states) => {
      const [ configState ] = states;

      return this.currentState;
    })).subscribe(this.subject);
  }

  // initialize() {
  //   this.taskControl.subject.pipe(map((taskState) => {
  //     const availableWorkers = this.currentState.crowd.availableWorkers;
  //
  //     let newState = this.currentState;
  //
  //     while(newState.crowd.availableWorkers.length > 0) {
  //       const randomWorkerIndex = Math.round(Math.random() * (availableWorkers.length - 1));
  //       const randomWorker = availableWorkers[randomWorkerIndex];
  //
  //       // randomWorker.assignTask(MicroTask.questionForLabel("This is a test question?", ["test1", "test2"]));
  //
  //       newState = CrowdState.assignWorker(newState, randomWorker);
  //     }
  //
  //     return newState;
  //     // const newState = CrowdState.processKnowledgeState(this.currentState, this.currentTaskState, taskState);
  //     // this.currentState = newState;
  //     // this.currentTaskState = taskState;
  //     // return newState;
  //   })).subscribe(this.subject);
  // }


  workerIsAvailable(id: string) {
    const result = this.getAvailableWorker(id);
    return result != undefined;
  }

  getAvailableWorker(id: string) {
    const result = _.find(this.currentState.crowd.availableWorkers, (worker) => {
      // console.log('Checking worker', worker);
      return worker.profile.id === id;
    });

    // console.log('Get available worker with id', id, ":", result);

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
