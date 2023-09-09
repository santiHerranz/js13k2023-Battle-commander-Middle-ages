import { Vector } from "@/core/vector";
import { EntityType } from "./EntityType";
import { Archer } from "./unit.archer";
import { PI } from "@/utils";

export class Cavalry extends Archer {


    constructor(position: Vector, sizeFactor: number, team: number) {
        super(position, sizeFactor, team, EntityType.Cavalry)

        this.loadProperties() 

        this.slowWhileInRange = false

    }

    drawChilds(ctx: CanvasRenderingContext2D, realSize: Vector): void {

        ctx.translate(this.Size.x *-.2 + (this._currentAnim == this._attackAnim?15:0) , 0+ this.Size.y*.1 );
        ctx.rotate(PI/2+(this._currentAnim == this._attackAnim?.1:0))
        ctx.lineWidth = 2;
        ctx.fillStyle = "#aaa";
        ctx.fillRect(0, 0, this.Size.x*.1, -this.Size.y*1.5);
        ctx.fillStyle = "#888";
        ctx.fillRect(this.Size.x*.1, 0, this.Size.x*.1, -this.Size.y*1.5);
    }



}