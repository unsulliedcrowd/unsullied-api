import { Subject, BehaviorSubject } from 'rxjs';

import { Persona, MicroTask } from '..';

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

    this.assignTask(MicroTask.questionForLabel("This is a test question?", ["test1", "test2"]))
  }

  assignTask(task: MicroTask): Worker {
    const newState = Worker.State.assignTask(this.currentState, task);
    this.subject.next(newState);
    this.currentState = newState;
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

  }


};
