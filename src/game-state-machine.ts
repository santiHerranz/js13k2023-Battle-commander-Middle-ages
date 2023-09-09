import { StateMachine } from './core/state-machine';
import { State } from './core/state';

export let gameStateMachine: StateMachine;

export function createGameStateMachine(initialState: State, ...initialArguments: any[]) {
  gameStateMachine = new StateMachine(initialState, ...initialArguments);
}
