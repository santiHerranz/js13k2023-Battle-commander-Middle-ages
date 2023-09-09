import { Vector } from "./core/vector";
import { time } from "./index";


/**
 * 
 * @param pt Interactive to canvas
 * @returns 
 */
export var i2c = (pt: Vector, size: Vector) => {
    var cartPt = new Vector(0, 0);
    cartPt.x = pt.x * size.x;
    cartPt.y = pt.y * size.y ;
    return cartPt;
  };
  
  /**
   * Canvas to Interactive
   * @param pt 
   * @returns 
   */
  export var c2i = (pt: Vector, size: Vector) => {
    var map = new Vector(0,0);
    map.x = pt.x / size.x;
    map.y = pt.y / size.y;
    return map;
  };
  

  export  function randInt( min=0, max=0 ) {
    return Math.floor(Math.random() * (max - min) + min);
  };


  export  var rand = ( min=1, max=0 ) => {
    return Math.random() * ( max - min ) + min;
  }

 export const PI = Math.PI

  
const ASSERT = (value:boolean) => {}

const clamp = (v: number, max = 1, min = 0) => (ASSERT(max > min), v < min ? min : v > max ? max : v);
const percent = (v: number, max = 1, min = 0) => max - min ? clamp((v - min) / (max - min)) : 0;


class Timer {
    time: number | undefined;
  setTime: number | undefined;

    constructor(timeLeft: number | undefined) {
        this.time = timeLeft == undefined ? undefined : time + timeLeft;
        this.setTime = timeLeft;
    }

    set(timeLeft = 0) {
        this.time = time + timeLeft;
        this.setTime = timeLeft;
    }
    unset() {
        this.time = undefined;
    }
    isSet() {
        return this.time != undefined;
    }
    active() {
      if (this.time == undefined) return false
        return time <= this.time;
    } // is set and has no time left
    elapsed() {
      if (this.time == undefined) return false
        return time > this.time;
    } // is set and has time left
    get() {
      if (this.time == undefined) return 0
        return this.isSet() ? time - this.time : 0;
    }
    p100() {
      if (this.time == undefined) return 0
        return this.isSet() ? percent(this.time - time, 0, this.setTime) : 0;
    }
}

export { Timer }