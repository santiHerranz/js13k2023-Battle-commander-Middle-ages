export interface State {
  Active: boolean
  onUpdate: (timeElapsed: number) => void;
  onEnter?: Function;
  onLeave?: Function;
}