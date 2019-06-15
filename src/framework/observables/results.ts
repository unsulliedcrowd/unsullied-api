import { BehaviorSubject } from 'rxjs';


export type ResultStats = {
  totalResults: number
};

export module ResultStats {
  export const INITIAL = {
    totalResults: 0
  };
}

export type ResultState = {
  stats: ResultStats
};

export module ResultState {
  export const INITIAL = {
    stats: ResultStats.INITIAL
  };
};

export class ResultControl {
  subject: BehaviorSubject<ResultState>;
  currentState: ResultState;

  constructor() {
    this.currentState = ResultState.INITIAL;
    this.subject = new BehaviorSubject(this.currentState);
  }



}

export module ResultControl {

}
