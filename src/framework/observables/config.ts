import { BehaviorSubject } from 'rxjs';

import { UnsulliedConfig } from '..';

export type ConfigState = UnsulliedConfig;

export class ConfigControl {
  subject: BehaviorSubject<ConfigState>;
  currentState: ConfigState;

  constructor(initialConfig: ConfigState) {
    this.currentState = initialConfig;
    this.subject = new BehaviorSubject(this.currentState);
  }

  start() {

  }

}

export module ConfigControl {

}
