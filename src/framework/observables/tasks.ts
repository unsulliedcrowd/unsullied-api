import { BehaviorSubject } from 'rxjs';


export type TaskStats = {
  availableTasksTotal: number
};

export module TaskStats {
  export const INITIAL = {
    availableTasksTotal: 0
  };
}

export type TaskState = {
  stats: TaskStats
};

export module TaskState {
  export const INITIAL = {
    stats: TaskStats.INITIAL
  };
};

export class TaskControl {
  subject: BehaviorSubject<TaskState>;
  currentState: TaskState;

  constructor() {
    this.currentState = TaskState.INITIAL;
    this.subject = new BehaviorSubject(this.currentState);
  }



}

export module TaskControl {

}
