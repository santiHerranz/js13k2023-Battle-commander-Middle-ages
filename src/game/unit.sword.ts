import { Vector } from "@/core/vector"
import BodyPart from "./BodyPart"


class UnitSword extends BodyPart {

  public _length: number = 0

  constructor(position: Vector, size: Vector, team: number) {
    super(position, size, team)
    this._length = size.y
  }

  _update(dt: any): void {
    // Block super call
    // super._update(dt) 
  }

  _draw(ctx: CanvasRenderingContext2D, offsets = { _position: new Vector(0, 0), r: 0 }) {

    ctx.save();
    ctx.lineWidth = 1;
    ctx.globalAlpha = this._opacity;

    ctx.translate(
      this.Position.x + offsets._position.x,
      this.Position.y + offsets._position.y
      // -this._verticalOffset
    );

    ctx.rotate(this._rotation + offsets.r );

    // TODO attack
    // ctx.rotate(time*20);

    // blade blue
    ctx.lineWidth = 2;
    ctx.fillStyle = "#ccf";
    ctx.fillRect(0, 5, this._size.x / 2, this._length);
    ctx.fillStyle = "#ddf";
    ctx.fillRect(this._size.x / 2, 5, this._size.x / 2, this._length);
    // hilt
    ctx.fillStyle = "#963";
    ctx.fillRect(0, 5, this._size.x, 5);
    // handle
    ctx.fillStyle = "#333";
    ctx.fillRect(this._size.x / 4, 0, this._size.x / 2, 5);

    ctx.restore();

  }
}

export default UnitSword;
