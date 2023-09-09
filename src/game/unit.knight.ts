import { Vector } from "@/core/vector";
import { EntityType } from "./EntityType";
import { gamePresenter } from "./game-presenter";
import UnitSword from "./unit.sword";
import { Troop } from "./unit.troop";

export class Knight extends Troop {


    constructor(position: Vector, sizeFactor: number, team: number) {
        super(position, sizeFactor, team, EntityType.Knight)

        this.loadProperties() 

        this.weapon = new UnitSword(
            new Vector(0, 0),
            new Vector(10, 30), this.Team
        );
    }

    draw(ctx: CanvasRenderingContext2D, dir: boolean = false): void {
            super.draw(ctx, this.LooktoRight || dir)
            gamePresenter.drawEntity(ctx, <Knight>this, this.LooktoRight || dir)

    }

}