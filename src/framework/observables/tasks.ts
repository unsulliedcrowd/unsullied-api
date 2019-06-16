import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';

import {
  KnowledgeControl,
  KnowledgeState,
  FindTask,
  FixTask,
  VerifyTask,
  MicroTask,
} from '..';

export type TaskStats = {
  availableTasksTotal: number,
  findTasks: FindTask[],
  fixTasks: FixTask[],
  verifyTasks: VerifyTask[],
  microTasks: MicroTask[],
};

export module TaskStats {
  export const INITIAL = {
    availableTasksTotal: 0,
    findTasks: [],
    fixTasks: [],
    verifyTasks: [],
    microTasks: [],
  };
}

export type TaskState = {
  stats: TaskStats
};

export module TaskState {
  export const INITIAL = {
    stats: TaskStats.INITIAL
  };

  export function processKnowledgeState(taskState: TaskState, oldKnowledgeState: KnowledgeState, newKnowledgeState: KnowledgeState): TaskState {
    // TODO: Generate new tasks here, complete old tasks

    // 1. Find-Tasks

    // 2. Fix-Tasks

    // 3. Verify-Tasks

    // Determine all tasks that have received enough contributions to have a verify tasks generated

    return taskState;
  }
};

export class TaskControl {
  knowledgeControl: KnowledgeControl;

  subject: BehaviorSubject<TaskState>;
  microTasks: BehaviorSubject<MicroTask[]>;

  currentState: TaskState;
  currentKnowledgeState: KnowledgeState;

  constructor(knowledgeControl: KnowledgeControl) {
    this.knowledgeControl = knowledgeControl;

    this.currentState = TaskState.INITIAL;
    this.currentKnowledgeState = this.knowledgeControl.currentState;
    this.subject = new BehaviorSubject(this.currentState);
  }

  initialize() {
    this.knowledgeControl.subject.pipe(map((knowledgeState) => {
      const newState = TaskState.processKnowledgeState(this.currentState, this.currentKnowledgeState, knowledgeState);
      this.currentState = newState;
      this.currentKnowledgeState = knowledgeState;
      return newState;
    })).subscribe(this.subject);
  }

  async submitTaskResult(taskString: String, taskResultString: String) {
    return;
  }

}

export module TaskControl {

}
