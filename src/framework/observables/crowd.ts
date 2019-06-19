import { BehaviorSubject, combineLatest, ReplaySubject, asapScheduler } from 'rxjs';
import { map } from 'rxjs/operators';
import * as uuid from 'uuid';
import * as _ from 'lodash';
import PQueue from 'p-queue';

import { Worker, Persona, MicroTask, ConfigControl } from '..';

const queue = new PQueue({
  concurrency: 1
});

export type CrowdStats = {
  seenWorkersTotal: number
  availableWorkersTotal: number
};

export module CrowdStats {
  export const INITIAL = {
    seenWorkersTotal: 0,
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
        seenWorkersTotal: state.stats.seenWorkersTotal + 1,
        availableWorkersTotal: state.stats.availableWorkersTotal + 1,
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
    const newState = {
      ...state,
      stats: {
        ...state.stats,
        availableWorkersTotal: (state.stats.availableWorkersTotal - 1)
      },
      crowd: {
        availableWorkers: _.without(state.crowd.availableWorkers, worker),
        engagedWorkers: [].concat(state.crowd.engagedWorkers, worker),
      }
    }

    console.log('Assigning worker...');
    return newState;
  }

  export function releaseWorker(state: CrowdState, worker: Worker) {
    const newState = {
      ...state,
      stats: {
        ...state.stats,
        availableWorkersTotal: (state.stats.availableWorkersTotal + 1)
      },
      crowd: {
        availableWorkers: [].concat(state.crowd.availableWorkers, worker),
        engagedWorkers: _.without(state.crowd.engagedWorkers, worker),
      }
    }

    console.log('Releasing worker...');
    return newState;
  }
};

export class CrowdControl {
  configControl: ConfigControl;

  subject: ReplaySubject<CrowdState>;
  currentState: CrowdState;

  constructor(configControl: ConfigControl) {
    this.configControl = configControl;
    this.currentState = CrowdState.INITIAL;
    this.subject = new ReplaySubject(1, undefined, asapScheduler);
    this.subject.next(this.currentState);
  }

  initialize() {
    // combineLatest(
    //   this.configControl.subject,
    // ).pipe(map((states) => {
    //   const [ configState ] = states;
    //
    //   return this.currentState;
    // })).subscribe(this.subject);
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


  workerExists(id: string) {
    const result = this.getWorker(id);
    return result != undefined;
  }

  getWorker(id: string) {
    let result = _.find(this.currentState.crowd.availableWorkers, (worker) => {
      // console.log('Checking worker', worker);
      return worker.profile.id === id;
    });

    if (result) return result;

    result = _.find(this.currentState.crowd.engagedWorkers, (worker) => {
      // console.log('Checking worker', worker);
      return worker.profile.id === id;
    });

    // console.log('Get available worker with id', id, ":", result);

    return result;
  }

  async registerWorker(_profile: Worker.Profile): Promise<Worker> {
    console.log("Registering worker")
    const id = uuid.v4();
    const profile = {
      ..._profile,
      id,
    };

    // console.log('Persona', Persona);
    const persona = Persona.DEFAULT;
    const worker = new Worker(profile, persona);

    const newState = CrowdState.addWorker(this.currentState, worker);
    this.currentState = newState;
    await queue.add(async () => this.subject.next(newState));

    return worker;
  }

  async assignWorker(worker: Worker, microTask: MicroTask): Promise<Worker> {
    console.log("CrowdControl assigning worker")
    // const _worker = await worker.assignTask(microTask);

    const newState = CrowdState.assignWorker(this.currentState, worker);
    this.currentState = newState;
    await queue.add(async () => this.subject.next(newState));

    return worker;
  }

  async releaseWorker(worker: Worker): Promise<Worker> {
    const newState = CrowdState.releaseWorker(this.currentState, worker);
    console.log("CrowdControl releasing worker", newState)
    this.currentState = newState;
    await queue.add(async () => this.subject.next(newState));

    return worker;
  }

}

export module CrowdControl {

}
