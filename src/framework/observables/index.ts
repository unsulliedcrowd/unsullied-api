import { Observable, Subject, combineLatest, timer } from 'rxjs';
import { map, first } from 'rxjs/operators';

import {
  UnsulliedConfig,
  ConfigState,
  ConfigControl,
  CrowdState,
  CrowdControl,
  TaskState,
  TaskControl,
  KnowledgeState,
  KnowledgeControl,
  KnowledgeBase,
  Schema,
  Store,
  EphemeralStore,
  EntityData
} from '..';

export type UnsulliedState = {
  currentTime: number,
  config: ConfigState,
  crowd: CrowdState,
  tasks: TaskState,
  knowledge: KnowledgeState
};

export class UnsulliedControl {
  observable: Observable<UnsulliedState>;
  currentState: UnsulliedState;

  schema: Schema;
  store: Store<EntityData>;
  knowledgeBase: KnowledgeBase;

  timer: Observable<number>;
  configControl: ConfigControl;
  crowdControl: CrowdControl;
  taskControl: TaskControl;
  knowledgeControl: KnowledgeControl;

  constructor(config: UnsulliedConfig) {
    this.schema = Schema.load(config);
    this.store = new EphemeralStore(this.schema);
    this.knowledgeBase = new KnowledgeBase(this.schema, this.store);

    this.timer = timer(0, 1000).pipe(map(() => Date.now()));
    this.configControl = new ConfigControl(config);
    this.crowdControl = new CrowdControl(this.configControl);
    this.knowledgeControl = new KnowledgeControl(this.configControl, this.knowledgeBase);
    this.taskControl = new TaskControl(this.configControl, this.knowledgeControl, this.crowdControl);

    this.observable  = combineLatest(
      this.timer,
      this.configControl.subject,
      this.crowdControl.subject,
      this.taskControl.subject,
      this.knowledgeControl.subject,
    ).pipe(map((states) => {
      const [ currentTime, configState, crowdState, taskState, resultState ] = states;
      const newState = {
        currentTime,
        config: configState,
        crowd: crowdState,
        tasks: taskState,
        knowledge: resultState,
      };

      this.currentState = newState;

      return newState;
    }));

    this.observable.pipe(first()).subscribe(initialState => {
      console.log('Setting initial state', initialState);
      this.currentState = initialState
    });

    this.initialize();
  }

  initialize() {
    this.knowledgeControl.initialize();
    this.crowdControl.initialize();
    this.taskControl.initialize();
    // this.configControl.initialize();
  }


}

export module UnsulliedControl {

}

export * from './config';
export * from './crowd';
export * from './tasks';
export * from './knowledge';
