import { Vector } from "@/core/vector";
import { GameObject } from "./game-object";


class BodyPart extends GameObject {

  public _sizeRef: Vector;
  
  public _size: Vector;
  public _shouldRenderShadow: boolean = false;

  constructor(position: Vector, size: Vector, team: number) {
    super(position, size, team);
    this._size = this._sizeRef = size;
  }

  // _update(dt: number) {

  //   var timeLeft = this._lifeSpan - this._age;
  //   if (this._lifeSpan !== -1 && timeLeft < this._lifeSpan * 0.1) {
  //     this._opacity = timeLeft / (this._lifeSpan * 0.1);
  //   }

  //   super._update(dt);
  // }

}

export default BodyPart;
