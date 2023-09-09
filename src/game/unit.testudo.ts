import { Vector } from "@/core/vector";
import Unit from "./unit";
import { EntityType } from "./EntityType";
import { gamePresenter } from "./game-presenter";
import UnitStick from "./unit.stick";

export class Testudo  extends Unit {


    constructor(position: Vector, sizeFactor: number, team: number, type: number = EntityType.Testudo) {
        super(position, sizeFactor, team, type)

        this.loadProperties()
        this.setSizes()

    }

    draw(ctx: CanvasRenderingContext2D, dir: boolean): void {
        gamePresenter.drawEntity(ctx, <Testudo>this, this.LooktoRight || dir)
        super.draw(ctx)
    }

    drawChilds(ctx: CanvasRenderingContext2D, realSize: Vector): void {

        ctx.translate(this.Size.x *.2, 0 + realSize.y * .45);
        // ctx.rotate(.2)
        ctx.lineWidth = 2;
        ctx.fillStyle = "#aaa";
        ctx.fillRect(0, 0, this.Size.x*.3, -this.Size.y*1.2);
        ctx.fillStyle = "#888";
        ctx.fillRect(this.Size.x*.3, 0, this.Size.x*.3, -this.Size.y*1.2);
    }


}