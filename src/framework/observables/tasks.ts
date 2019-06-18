import { BehaviorSubject, combineLatest } from 'rxjs';
import { map } from 'rxjs/operators';

import {
  KnowledgeControl,
  KnowledgeState,
  MacroTask,
  FindTask,
  FixTask,
  VerifyTask,
  MicroTask,
  ConfigControl,
  CrowdControl,
  CrowdState,
  Worker
} from '..';

export type TaskStats = {
  availableTasksTotal: number,
  // findTasks: FindTask[],
  // fixTasks: FixTask[],
  // verifyTasks: VerifyTask[],
};

export module TaskStats {
  export const INITIAL = {
    availableTasksTotal: 0,
  };
}

export type TaskState = {
  stats: TaskStats,
  activeTasks: MacroTask[],
  passiveTasks: MacroTask[],
  microTasks: MicroTask[],
};

export module TaskState {
  export const INITIAL = {
    stats: TaskStats.INITIAL,
    activeTasks: [],
    passiveTasks: [],
    microTasks: [],
  };

  export function processKnowledgeState(taskState: TaskState, oldKnowledgeState: KnowledgeState, newKnowledgeState: KnowledgeState): TaskState {
    // TODO: Generate new tasks here, complete old tasks
    console.log('Processing knowledge state (generating and aggregating tasks)...');

    const findTasks = [];
    const passiveTasks = findTasks;
    const activeTasks = [];
    const microTasks = [
      MicroTask.questionForLabel("This is a test question?", ["test1", "test2"])
    ];

    return {
      stats: {
        availableTasksTotal: microTasks.length
      },
      activeTasks,
      passiveTasks,
      microTasks,
    }

    // 1. Find-Tasks

    // 2. Fix-Tasks

    // 3. Verify-Tasks

    // Determine all tasks that have received enough contributions to have a verify tasks generated

    return taskState;
  }

  export function processCrowdState(taskState: TaskState, oldCrowdState: CrowdState, newCrowdState: CrowdState): TaskState {
    // TODO: Assign tasks here
    const availableTasks = taskState.microTasks;
    const { availableWorkers} = newCrowdState.crowd;
    console.log(`Processing crowd state with ${availableWorkers.length} available workers and ${availableTasks.length} available tasks (allocating tasks)...`);

    if (availableTasks.length === 0) return taskState;
    if (availableWorkers.length === 0) return taskState;

    // TODO: Make this make sense
    const [ firstTask ] = availableTasks;
    const [ firstWorker ] = availableWorkers;
    const newState = TaskState.assignTask(taskState, firstTask, firstWorker);
    firstWorker.assignTask(firstTask);

    return newState;
  }

  export function assignTask(taskState: TaskState, task: MicroTask, worker: Worker) {
    return taskState;
  }
};

export class TaskControl {
  configControl: ConfigControl;
  knowledgeControl: KnowledgeControl;
  crowdControl: CrowdControl;

  subject: BehaviorSubject<TaskState>;
  microTasks: BehaviorSubject<MicroTask[]>;

  currentState: TaskState;
  currentKnowledgeState: KnowledgeState;
  currentCrowdState: CrowdState;

  constructor(configControl: ConfigControl, knowledgeControl: KnowledgeControl, crowdControl: CrowdControl) {
    this.configControl = configControl;
    this.knowledgeControl = knowledgeControl;
    this.crowdControl = crowdControl;

    this.currentState = TaskState.INITIAL;
    this.currentKnowledgeState = this.knowledgeControl.currentState;
    this.currentCrowdState = this.crowdControl.currentState;
    this.subject = new BehaviorSubject(this.currentState);

  }

  initialize() {
    combineLatest(
      this.configControl.subject,
      this.knowledgeControl.subject,
      this.crowdControl.subject,
    ).pipe(map((states) => {
      const [ configState, knowledgeState, crowdState ] = states;

      if (knowledgeState != this.currentKnowledgeState) {
        const newState = TaskState.processKnowledgeState(this.currentState, this.currentKnowledgeState, knowledgeState);

        this.currentState = newState;
        this.currentKnowledgeState = knowledgeState;

        return newState;
      }

      if (crowdState != this.currentCrowdState) {
        const newState = TaskState.processCrowdState(this.currentState, this.currentCrowdState, crowdState);

        this.currentState = newState;
        this.currentCrowdState = crowdState;

        return newState;

      }

      return this.currentState;
    })).subscribe(this.subject);
  }

  async submitTaskResult(taskString: String, taskResultString: String) {
    return;
  }

  assignTask(task: MicroTask, worker: Worker) {
    const newState = TaskState.assignTask(this.currentState, task, worker);
    this.subject.next(newState);
    // return task;
  }

}

export module TaskControl {

}
