import { drawEngine } from "@/core/draw-engine";
import { Vector } from "@/core/vector"
import { Circle } from "@/quadtree/Circle";
import { Indexable, NodeGeometry } from "@/quadtree/types";

export class GameObject implements Indexable {

    Active: boolean = true;

    Team: number

    Size: Vector

    Position: Vector
    Velocity: Vector
    Acceleration: Vector
    Mass: number

    _z: number = 0;
    _zv: number = 0;   // z velocity
    _zgrav: number = 9.8; // gravity


    public _rotation: number = 0;

    public _lifeSpan: number = -1;
    public _age: number = 0;

    public _opacity: number = 1;

    healthPointsMax: number = 100
    healthPoints: number = 100
    armorPointsMax: number = 0
    armorPoints: number = 0
    attackDamagePoints: number = 0;

    constructor(position: Vector, size: Vector, team: number) {

        this.Position = position.clone()
        this.Size = size.clone()
        this.Velocity = new Vector(0, 0)
        this.Acceleration = new Vector(0, 0)
        this.Mass = 1

        this.Team = team

    }

    qtIndex(node: NodeGeometry) {
        return Circle.prototype.qtIndex.call({
            x: this.Position.x,
            y: this.Position.y,
            r: this.Radius,
        }, node);
    }

    get Radius() {
        return this.Size.length()
    }
    set Radius(value) {
        let side = Math.sqrt(value * value)
        this.Size = new Vector(side, side)
    }

    _update(dt: number) {

        // gravity
        this._zv -= this._zgrav * 1 / dt;
        this._z = Math.max(0, this._z + this._zv); // 

        if (this._z < 1) {
            this._zv = 0;
        }

    }

    draw(ctx: CanvasRenderingContext2D) {

        // if (debug.showObjectInfo || debug.showQuadtree) {
            // drawEngine.drawCircle(this.Position, this.Radius, {stroke: ['','#f00','#00f'][this.Team], fill: 'transparent'}); // this.Size.length()
        // }        

    }

    destroy() {
        this.Active = false
    }


}