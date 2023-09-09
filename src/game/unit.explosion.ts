import { Vector } from "@/core/vector";
import Unit from "./unit";
import { EntityType as EntityType } from "./EntityType";
import { drawEngine } from "@/core/draw-engine";

export class Explosion extends Unit {

    lastPos: Vector;
    range: number;

    constructor(position: Vector, sizeFactor: number, team: number, range: number, owner: Unit) {
        super(position, sizeFactor, team, EntityType.Explosion)

        this.owner = owner

        this.lastPos = position.clone();
        this.range = range
    }

    _update(dt: any): void {

        this.Size.scale(1.1)
        if (this.Size.length() > this.range) this.destroy()

        super._update(dt)
    }


    draw(ctx: CanvasRenderingContext2D) {

        const thisPosition = this.Position.clone()//.add(new Vector(this.Radius, this.Radius).scale(.5));

        let color = 'white'
        drawEngine.context.globalAlpha = .2
        drawEngine.drawCircle(thisPosition.add(new Vector(0, -this._z)), this.Radius, { stroke: color, fill: color, lineWidth: 10 });
        drawEngine.context.globalAlpha = 1


        // drawEngine.drawText('' + this.healthPoints, 15, thisPosition.x, thisPosition.y); // + '/' + this.damagePoints
        super.draw(ctx)

    }

}