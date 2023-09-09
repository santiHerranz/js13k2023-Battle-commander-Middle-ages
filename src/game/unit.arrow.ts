import { Vector } from "@/core/vector";
import Unit from "./unit";
import { EntityType as EntityType, getTeamColor } from "./EntityType";
import { drawEngine } from "@/core/draw-engine";
import { PI, randInt } from "@/utils";

export class Arrow extends Unit {

    startPosition: Vector
    targetPosition: Vector
    distance: number;
    height: number = 50


    constructor(position: Vector, sizeFactor: number, team: number, range: number, owner: Unit, targetPosition:Vector, type: number = EntityType.Arrow) {
        super(position, sizeFactor, team, type)
        this.owner = owner

        this.startPosition = position.clone()
        this.targetPosition = targetPosition
        this.distance = Vector.distance(this.targetPosition,this.startPosition)
    }

    _update(dt: number): void {
        let currentDistance = Vector.distance(this.Position,this.startPosition)

        // easy simulate parabolic
        this._z = Math.cos(-PI/2+ PI*(currentDistance/this.distance))*this.height

        if (this._z <= 0) {
            this.destroy()
            return
        }
    }

    // _update(dt: number) {
    //     if (this._z <= 0) {
    //         this.destroy()
    //         return
    //     }
    //     super._update(dt)
    // }

    draw(ctx: CanvasRenderingContext2D) {

        let color = getTeamColor(this.Team)

        const thisPosition = this.Position.clone().add(new Vector(this.Radius, this.Radius).scale(.5));

        drawEngine.drawCircle(thisPosition.clone().add(new Vector(2, 2)), this.Radius, { stroke: '#222', fill: '#222', lineWidth: 3 });
        drawEngine.drawCircle(thisPosition.add(new Vector(0, -this._z)), this.Radius, { stroke: color, fill: color, lineWidth: 3 });

        super.draw(ctx)
    }

}