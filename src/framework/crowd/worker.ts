import { Subject, BehaviorSubject } from 'rxjs';

import { Persona, MicroTask, TaskResult } from '..';
import PQueue from 'p-queue';

const queue = new PQueue({
  concurrency: 1
});

export class Worker {
  subject: Subject<Worker.State>;
  currentState: Worker.State;
  profile: Worker.Profile;
  persona: Persona;

  constructor(profile: Worker.Profile, persona: Persona) {
    this.profile = profile;
    this.persona = persona;
    this.currentState = Worker.State.INITIAL;
    this.subject = new BehaviorSubject(this.currentState);
  }

  async assignTask(task: MicroTask): Promise<Worker> {
    const newState = Worker.State.assignTask(this.currentState, task);
    this.currentState = newState;
    await queue.add(async () => this.subject.next(newState));
    return this;
  }

  async completeTask(result: TaskResult): Promise<Worker> {
    const newState = Worker.State.completeTask(this.currentState, result);
    this.currentState = newState;
    await queue.add(async () => this.subject.next(newState));
    return this;
  }
}

export module Worker {
  export type Profile = {
    id?: string,
    name?: string
  };

  export module Profile {

  };

  export type State = {
    isOnline: boolean,
    isWorkingOnTask: boolean,
    currentTask: MicroTask
  };

  export module State {
    export const INITIAL = {
      isOnline: false,
      isWorkingOnTask: false,
      currentTask: null
    };

    export function assignTask(state: State, task: MicroTask): State {
      return {
        ...state,
        isOnline: true,
        isWorkingOnTask: true,
        currentTask: task
      }
    }

    export function completeTask(state: State, result: TaskResult): State {
      return {
        ...state,
        isOnline: true,
        isWorkingOnTask: false,
        currentTask: null
      }
    }

  }


};
