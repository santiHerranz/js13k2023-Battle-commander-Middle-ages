import { time } from "@/index";
import { Vector } from "@/core/vector";
import { drawEngine } from "@/core/draw-engine";
import Unit from "./unit";
import { Troop } from "./unit.troop";
import { Knight } from "./unit.knight";
import { Archer } from "./unit.archer";
import { Artillery } from "./unit.artillery";
import { Testudo } from "./unit.testudo";

class GamePresenter {

    constructor() {
    }

    // Draw calls
    drawTroop(context: CanvasRenderingContext2D, unit: Troop, dir: boolean) {
        this.drawBase(context, unit, dir);
        this.drawDeath(drawEngine.contextDeath, unit, dir)
    }

    drawEntity(context: CanvasRenderingContext2D, unit: Unit, dir: boolean) {

        this.drawBase(context, unit, dir);
        this.drawDeath(drawEngine.contextDeath, unit, dir)

    }



    drawBase(context: CanvasRenderingContext2D, unit: Unit, dir: boolean, anim: number = 1) {

        // Shadow
        context.fillStyle = "rgba(0,0,0,.5)"
        context.beginPath()
        if (unit._z > 0)
        context.ellipse(unit.Position.x, unit.Position.y + unit.Radius * 2 / 3, (unit.Size.x / 2) / Math.max(1, unit._z / 10), (unit.Size.x / 4) / Math.max(1, unit._z / 10), 0, 0, Math.PI * 2)
        else
        context.ellipse(unit.Position.x, unit.Position.y + unit.Radius * 2 / 3, (unit.Size.x / 2), (unit.Size.x / 4), 0, 0, Math.PI * 2)

        context.fill()

        let renderSize = unit.Size.clone().scale(2);
        const circlePosition = unit.Position.clone().add(new Vector(0, -unit._z))
        const rectPosition = circlePosition.add(renderSize.clone().scale(-.5)); //+ Math.abs(Math.sin(time*10)*10)

        let realSize = unit.imageSize.clone().scale(renderSize.x / 32)//.scale(10);

        context.save();
        context.translate(rectPosition.x + realSize.x / 2, rectPosition.y + realSize.y / 2);

        dir && context.scale(-1, 1);

        //  drawEngine.drawRectangle(new Vector(-realSize.x / 2, -realSize.y / 2), renderSize, { stroke: color, fill: 'blue' });

        context.imageSmoothingEnabled = false;
        context.drawImage(unit.image, 0, 0, unit.imageSize.x, unit.imageSize.y, -realSize.x / 2, -realSize.y / 2, realSize.y, realSize.y);

        unit.drawChilds(context, realSize)

        context.restore()


        // attackRange
        // context.lineWidth = 1
        // context.strokeStyle = "rgba(255,255,255,.3)"
        // context.beginPath()
        // context.ellipse(unit.Position.x, unit.Position.y , unit.Radius * unit.attackRange, unit.Radius * unit.attackRange, 0, 0, Math.PI*2)
        // context.stroke()

        // // attackRangeMinimun
        // context.lineWidth = 1
        // context.strokeStyle = "rgba(255,255,255,.3)"
        // context.beginPath()
        // context.ellipse(unit.Position.x, unit.Position.y , unit.attackRangeMinimun, unit.attackRangeMinimun, 0, 0, Math.PI*2)
        // context.stroke()

    }

    drawDeath(context: CanvasRenderingContext2D, unit: Unit, dir: boolean) {

        if (unit.healthPoints < 1) {

            let renderSize = unit.Size.clone().scale(2);
            const rectPosition = unit.Position.clone().add(new Vector(0, -unit._z)).add(renderSize.clone().scale(-.5));
            let realSize = unit.imageSize.clone().scale(renderSize.x / 32);

            context.save();
            context.translate(rectPosition.x + realSize.x / 2, rectPosition.y + realSize.y / 2);

            dir && context.scale(-1, 1);

            context.rotate(Math.PI / 2)

            context.font = `${unit.Radius * .8}px Impact, sans-serif-black`;
            context.textBaseline = 'middle'
            context.textAlign = 'center'
            context.strokeText("💀", 0, 0);
            context.restore()
        }

    }


}

export const gamePresenter = new GamePresenter();
