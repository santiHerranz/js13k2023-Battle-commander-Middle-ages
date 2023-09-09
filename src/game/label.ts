import { Vector } from "@/core/vector";
import { GameObject } from "./game-object";
import { drawEngine } from "@/core/draw-engine";

export class Label extends GameObject {
    
    text: string;
    life: number;
    color: string;

    constructor(text:string, position: Vector, size: Vector, team: number, color: string = '#fff') {
        super(position, size, team)

        this._zv = 4
        this._zgrav = 0.98
        this.text = text;
        this.life = 50;

        this.color = color
    }

    _update(dt: number) {

        if (this.life == 0) {
            this.destroy()
            return
        }
        super._update(dt)
        this.life -= 1;
    }

    draw(ctx: CanvasRenderingContext2D) {

        drawEngine.drawText(this.text, this.Radius, this.Position.x, this.Position.y - this._z, this.color);
        // drawEngine.drawCircle(this.Position, this.Radius, {stroke: ['','#f00','#00f'][this.Team], fill: 'transparent'}); // this.Size.length()

    }

}