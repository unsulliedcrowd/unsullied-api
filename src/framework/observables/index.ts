import { Observable, Subject, combineLatest, timer } from 'rxjs';
import { map, first } from 'rxjs/operators';

import { UnsulliedConfig, ConfigState, ConfigControl, CrowdState, CrowdControl, TaskState, TaskControl, ResultState, ResultControl } from '..';

export type UnsulliedState = {
  currentTime: number,
  config: ConfigState,
  crowd: CrowdState,
  tasks: TaskState,
  results: ResultState
};

export class UnsulliedControl {
  observable: Observable<UnsulliedState>;
  currentState: UnsulliedState;

  timer: Observable<number>
  configControl: ConfigControl;
  crowdControl: CrowdControl;
  taskControl: TaskControl;
  resultControl: ResultControl;

  constructor(config: UnsulliedConfig) {
    this.timer = timer(0, 1000).pipe(map(() => Date.now()));
    this.configControl = new ConfigControl(config);
    this.crowdControl = new CrowdControl();
    this.taskControl = new TaskControl();
    this.resultControl = new ResultControl();

    this.observable  = combineLatest(
      this.timer,
      this.configControl.subject,
      this.crowdControl.subject,
      this.taskControl.subject,
      this.resultControl.subject,
    ).pipe(map((states) => {
      const [ currentTime, configState, crowdState, taskState, resultState ] = states;
      const newState = {
        currentTime,
        config: configState,
        crowd: crowdState,
        tasks: taskState,
        results: resultState,
      };

      this.currentState = newState;

      return newState;
    }));

    this.observable.pipe(first()).subscribe(initialState => {
      console.log('Setting initial state', initialState);
      this.currentState = initialState
    });
  }



}

export module UnsulliedControl {

}

export * from './config';
export * from './crowd';
export * from './tasks';
export * from './results';
