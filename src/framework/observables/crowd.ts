import { BehaviorSubject } from 'rxjs';


export type CrowdStats = {
  availableWorkersTotal: number
};

export module CrowdStats {
  export const INITIAL = {
    availableWorkersTotal: 0
  };
}

export type CrowdState = {
  stats: CrowdStats
};

export module CrowdState {
  export const INITIAL = {
    stats: CrowdStats.INITIAL
  };
};

export class CrowdControl {
  subject: BehaviorSubject<CrowdState>;
  currentState: CrowdState;

  constructor() {
    this.currentState = CrowdState.INITIAL;
    this.subject = new BehaviorSubject(this.currentState);
  }



}

export module CrowdControl {

}
