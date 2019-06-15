import { Persona, Task } from '..';

export class Worker {
  state: Worker.State = Worker.State.INITIAL;
  profile: Worker.Profile;
  persona: Persona;

  constructor(profile: Worker.Profile, persona: Persona) {
    this.profile = profile;
    this.persona = persona;
  }
}

export module Worker {
  export type Profile = {

  };

  export module Profile {

  };

  export type State = {
    isOnline: boolean,
    isWorkingOnTask: boolean,
    currentTask: Task
  };

  export module State {
    export const INITIAL = {
      isOnline: false,
      isWorkingOnTask: false,
      currentTask: null
    };

  }


};
