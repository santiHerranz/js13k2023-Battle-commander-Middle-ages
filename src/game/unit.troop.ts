import { Vector } from "@/core/vector";
import Unit from "./unit";
import { EntityType } from "./EntityType";
import { gamePresenter } from "./game-presenter";
import UnitStick from "./unit.stick";

export class Troop extends Unit {


    constructor(position: Vector, sizeFactor: number, team: number, type: number = EntityType.Troop) {
        super(position, sizeFactor, team, type)

        this.weapon = new UnitStick(
            new Vector(0, 0),
            new Vector(6, 30), this.Team
        );

        this.loadProperties()
        this.setSizes()

    }


    draw(ctx: CanvasRenderingContext2D, dir: boolean): void {

        gamePresenter.drawTroop(ctx, this, this.LooktoRight || dir)

        super.draw(ctx)
    }

    drawChilds(ctx: CanvasRenderingContext2D, realSize: Vector): void {

        ctx.translate(0 * .1, 0 + realSize.y * .3);

        // sword
        var anim = this._currentAnim._current;

        if (this.weapon && this._hasWeapon)
            this.weapon._draw(ctx, anim['s']);
    }


}