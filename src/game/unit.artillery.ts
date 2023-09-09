import { Vector } from "@/core/vector";
import { Archer } from "./unit.archer";
import { EntityType, Team } from "./EntityType";
import { drawEngine } from "@/core/draw-engine";
import { gamePresenter } from "./game-presenter";

export class Artillery extends Archer {

    constructor(position: Vector, sizeFactor: number, team: number) {
        super(position, sizeFactor, team, EntityType.Artillery)

        // force image
        this.getImage(EntityType.Artillery, (team == Team.Bravo))

        this.loadProperties() 

        this.bulletSpeed= 10;
        

    }

    // // Artillery targets the farest enemy in range
    // targetCriteria = (a: { distance: number; },b: { distance: number; }) => b.distance - a.distance;

    draw(ctx: CanvasRenderingContext2D, dir?: boolean): void {
        super.draw(ctx, dir)
        
        gamePresenter.drawEntity(ctx, <Artillery>this, this.LooktoRight || dir!)

        // this.targetPosition && drawEngine.drawLine(this.Position, this.targetPosition);
        
        // if (this.Team == Team.Alpha)
        // drawEngine.drawCircle(this.Position, this.shootRange, {stroke: ['','#f00','#00f'][this.Team], fill: 'transparent', lineWidth: 3}); // this.Size.length()

        let value = this.shootCoolDownTimer.p100()
        if (this.showBars && value < 1)
        this.drawBar(ctx, +this.Radius * 1, value * 100, 100, "#0f0", true)

    }

    drawChilds(ctx: CanvasRenderingContext2D, realSize: Vector): void {

        ctx.translate(this.Size.x *.2, 0 + realSize.y * .4);
        ctx.rotate(.4)
        ctx.lineWidth = 2;
        ctx.fillStyle = "#aaa";
        ctx.fillRect(0, 0, this.Size.x *.2, -this.Size.y*1.1);
        ctx.fillStyle = "#888";
        ctx.fillRect(this.Size.x*.2, 0, this.Size.x*.1, -this.Size.y*1.1);
    }

    shootCoolDown = () => { return this.shootCoolDownValue } // rand(6, 8);

    // calculateShoot(targetPosition: Vector) {

    //     const direction = -Math.atan2(this.Position.x - targetPosition.x, this.Position.y - targetPosition.y) - Math.PI / 2;
    //     const velocity = new Vector(1, 0).rotate(direction).scale(this.bulletSpeed);

    //     return {velocity}
    // }


    
}