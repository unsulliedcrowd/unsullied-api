import { BehaviorSubject, combineLatest } from 'rxjs';
import { map, flatMap } from 'rxjs/operators';
import * as semtools from 'semantic-toolkit';
import * as _ from 'lodash';
import PQueue from 'p-queue';

const queue = new PQueue({
  concurrency: 1
});

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
  Worker,
  ConfigState,
  EntityData,
  TaskResult
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

  export function processKnowledgeState(taskState: TaskState, oldKnowledgeState: KnowledgeState, newKnowledgeState: KnowledgeState, currentConfigState: ConfigState, currentCrowdState: CrowdState): TaskState {
    // TODO: Generate new tasks here, complete old tasks
    console.log('Processing knowledge state (generating and aggregating tasks)...');

    console.log("Pending results:", newKnowledgeState.pendingResults);

    // const entityData = aggregateResults(newKnowledgeState.pendingResults);

    // TODO: Update knowledge base here


    console.log("Old known classes:", oldKnowledgeState.knownClasses);
    console.log("Known classes:", newKnowledgeState.knownClasses);
    const diff = _.difference(newKnowledgeState.knownClasses, oldKnowledgeState.knownClasses);
    console.log("Diff known classes:", diff);

    const findMicroTasks = newKnowledgeState.knownClasses.map(entityClass => {
      const localName = semtools.getLocalName(entityClass);
      const location = currentConfigState.taskGenerationConfig.initialLocation;

      let question;
      if (location != null) question = `Please upload an image of a ${localName} within the area ${location}`;
      else question = `Please upload an image of a ${localName}`;

      // TODO: Build composite tasks
      // question += ', along with a description'

      const microTask = MicroTask.questionForImage(question);
      return microTask;
    });

    const fixMicroTasks = newKnowledgeState.pendingResults.filter(result => {
      const { file } = result;
      return file != null;
    }).map(taskResult => {
      const image = (taskResult.file as any).filename;
      const question = `Please label the following image of a ThrashCan according to the following labels`;
      const microTask = MicroTask.questionForImageBoolean(image, question, "isFull");
      return microTask;
    });

    // const fixMicroTasks = newKnowledgeState.knownStaleEntities.map(entityClass => {
    //   const localName = semtools.getLocalName(entityClass);
    //   const location = currentConfigState.taskGenerationConfig.initialLocation;
    //
    //   let question;
    //   if (location != null) question = `Please upload an image of a ${localName} within the area ${location}`;
    //   else question = `Please upload an image of a ${localName}`;
    //
    //   // TODO: Build composite tasks
    //   // question += ', along with a description'
    //
    //   const microTask = MicroTask.questionForImage(question);
    //   return microTask;
    // });

    const findTasks = [];
    const passiveTasks = findTasks;
    const activeTasks = [];

    const microTasks = [
      // MicroTask.questionForLabel("This is a test question?", ["test1", "test2"])
      ...fixMicroTasks,
      ...findMicroTasks
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

  export function processCrowdState(taskState: TaskState, oldCrowdState: CrowdState, newCrowdState: CrowdState, currentConfigState: ConfigState, currentKnowledgeState: KnowledgeState, taskControl: TaskControl): TaskState {
    // TODO: Assign tasks here
    const availableTasks = taskState.microTasks;
    const { availableWorkers} = newCrowdState.crowd;
    console.log(`Processing crowd state with ${availableWorkers.length} available workers and ${availableTasks.length} available tasks (allocating tasks)...`);

    if (availableTasks.length === 0) return taskState;
    if (availableWorkers.length === 0) return taskState;

    // TODO: Make this make sense
    const [ firstTask ] = availableTasks;
    const [ lastWorker ] = availableWorkers.reverse();
    const newState = TaskState.assignTask(taskState, firstTask, lastWorker);


    return newState;
  }

  export function assignTask(taskState: TaskState, task: MicroTask, worker: Worker) {
    return {
      ...taskState,
      stats: {
        ...taskState.stats,
        availableTasksTotal: taskState.microTasks.length - 1,
      },
      microTasks: _.without(taskState.microTasks, task)
    };
  }

  export function completeTask(taskState: TaskState, task: MicroTask, worker: Worker, taskResult: TaskResult) {
    return {
      ...taskState,
      stats: {
        ...taskState.stats,
        availableTasksTotal: taskState.microTasks.length,
        completedTasksTotal: taskState.microTasks.length + 1,
      },
      microTasks: _.without(taskState.microTasks, task)
    };
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
    ).pipe(flatMap(async (states) => {
      const [ configState, knowledgeState, crowdState ] = states;

      if (knowledgeState != this.currentKnowledgeState) {
        const newState = TaskState.processKnowledgeState(this.currentState, this.currentKnowledgeState, knowledgeState, this.configControl.currentState, this.currentCrowdState);

        this.currentState = newState;
        this.currentKnowledgeState = knowledgeState;

        return newState;
      }

      if (crowdState != this.currentCrowdState) {
        // const newState = TaskState.processCrowdState(this.currentState, this.currentCrowdState, crowdState, this.configControl.currentState, this.currentKnowledgeState);
        const availableTasks = this.currentState.microTasks;
        const { availableWorkers} = crowdState.crowd;
        console.log(`Processing crowd state with ${availableWorkers.length} available workers and ${availableTasks.length} available tasks (allocating tasks)...`);

        if (availableTasks.length === 0) return this.currentState;
        if (availableWorkers.length === 0) return this.currentState;

        // TODO: Make this make sense
        const [ firstTask ] = availableTasks;
        const [ lastWorker ] = availableWorkers.reverse();
        // const newState = TaskState.assignTask(this.currentState, firstTask, lastWorker);
        // this.crowdControl.assignWorker(lastWorker, firstTask);
        // // lastWorker.assignTask(firstTask);
        //
        // this.currentState = newState;
        // this.currentCrowdState = crowdState;
        await this.assignTask(firstTask, lastWorker);

        return this.currentState;

      }

      return this.currentState;
    })).subscribe(this.subject);
  }

  async assignTask(task: MicroTask, worker: Worker) {
    const newState = TaskState.assignTask(this.currentState, task, worker);
    await this.crowdControl.assignWorker(worker, task);
    await worker.assignTask(task);
    this.currentState = newState;
    await queue.add(async () => this.subject.next(newState));
    // return task;
  }

  async completeTask(task: MicroTask, worker: Worker, taskResult: TaskResult) {
    const newState = TaskState.completeTask(this.currentState, task, worker, taskResult);
    await this.crowdControl.releaseWorker(worker);
    await worker.completeTask(taskResult);
    this.currentState = newState;
    await queue.add(async () => this.subject.next(newState));
    // return task;
  }

  async submitTaskResult(workerId: string, taskString: string, taskResultString: string, file?: string): Promise<TaskResult> {
    const taskResult: TaskResult = { workerId, taskString, taskResultString, file };

    await this.knowledgeControl.submitTaskResult(taskResult);

    const task = JSON.parse(taskString);
    const worker = this.crowdControl.getWorker(workerId);
    await this.completeTask(task, worker, taskResult);

    // TODO: Aggregate task results here

    // const newState = KnowledgeState.updateResults(this.currentState, taskResult);
    // this.currentState = newState;
    // await queue.add(async () => this.subject.next(newState));

    return taskResult;
  }

}

export module TaskControl {

}
