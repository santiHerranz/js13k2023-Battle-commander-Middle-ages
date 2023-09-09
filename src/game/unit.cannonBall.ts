import { Vector } from "@/core/vector";
import { Arrow } from "./unit.arrow";
import { Explosion } from "./unit.explosion";
import { drawEngine } from "@/core/draw-engine";
import { EntityType } from "./EntityType";
import Unit from "./unit";
import { PI, randInt } from "@/utils";

export class CannonBall extends Arrow {



    constructor(position: Vector, sizeFactor: number, team: number, owner: Unit, targetPosition:Vector, height:number = 100) {
        super(position, sizeFactor, team, EntityType.CannonBall, owner, targetPosition, EntityType.CannonBall)
        
        this.height = height

    }



    explodeHandler(explosion: Explosion) {};

    explode(position: Vector) {}

    destroy(): void {
        this.explode(this.Position)
        super.destroy()
    }

    draw(ctx: CanvasRenderingContext2D): void {
        super.draw(ctx)

        this.targetPosition && drawEngine.drawText('🎯', 30, this.targetPosition.x, this.targetPosition.y); 

    }
}