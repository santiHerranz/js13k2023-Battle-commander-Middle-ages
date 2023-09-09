import { Vector } from "@/core/vector";
import { GameObject } from "./game-object";

export class Particle extends GameObject {

    ttl: number;

    constructor(position: Vector, size = new Vector(4, 4), team: number ){
        super(position, size, team)
        this.ttl = 100
    }

    _update(dt: number): void {
        this.ttl -= 1
    }

    draw(ctx: CanvasRenderingContext2D): void {
        
        ctx.fillStyle = ['#333', 'rgb(255,0,0,.5)', 'rgb(0,0,255,.5)'][this.Team]
        ctx.beginPath()
        ctx.arc(this.Position.x, this.Position.y, Math.max(0, (100 - this.ttl))/100 * this.Radius, 0, 2 * Math.PI);
        ctx.fill();
    }



}