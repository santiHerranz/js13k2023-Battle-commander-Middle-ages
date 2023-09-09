import { State } from './state';

export class StateMachine {
  private currentState: State;

  constructor(initialState: State, ...enterArgs: any) {
    this.currentState = initialState;
    this.currentState.onEnter?.(...enterArgs);
    setTimeout(() => {
      this.currentState.Active = true
    }, 200);
  }

  setState(newState: State, ...enterArgs: any) {
    this.currentState.Active = false
    this.currentState.onLeave?.();
    this.currentState = newState;
    this.currentState.onEnter?.(...enterArgs);
    setTimeout(() => {
      this.currentState.Active = true
    }, 200);
    
  }

  getState() {
    return this.currentState;
  }
}
