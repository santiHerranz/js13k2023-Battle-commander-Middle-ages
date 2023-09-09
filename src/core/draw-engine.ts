import { Vector } from "./vector";
import { GameObject } from "../game/game-object";
import { EntityType } from "@/game/EntityType";
import { transparent } from "@/index";

class DrawEngine {



  context: CanvasRenderingContext2D;

  contextFogOfWar: CanvasRenderingContext2D;
  contextDeath: any;
  contextBlood: any;


  fogMemory: any[] = []

  constructor() {
    this.context = c2d.getContext('2d');
    // this.contextDeath = c2d.cloneNode().getContext('2d');
    // this.contextBlood = c2d.cloneNode().getContext('2d');
    this.contextFogOfWar = c2d.getContext('2d');

  }

  get canvasWidth() {
    return this.context.canvas.width;
  }
  get canvasHeight() {
    return this.context.canvas.height;
  }

  init() {
    this.contextDeath = c2d.cloneNode().getContext('2d');
    this.contextBlood = c2d.cloneNode().getContext('2d');
  }

  drawItems(items: any, ctx: CanvasRenderingContext2D = drawEngine.context) {
    items
      .sort((a: GameObject, b: GameObject) => { return -((b.Position.y + b._z) * 10000 + b.Position.x) + ((a.Position.y + a._z) * 10000 + a.Position.x) })
      .forEach((item: any) => {
        item.draw(ctx)
      })
  }

  drawText(text: string, fontSize: number, x: number, y: number, color = 'white', textAlign: 'center' | 'left' | 'right' = 'center') {
    const context = this.context;

    context.font = `${fontSize}px Impact, sans-serif-black`;
    context.textAlign = textAlign;
    context.strokeStyle = 'black';
    context.lineWidth = 7;
    context.miterLimit = 2
    context.strokeText(text, x, y);
    context.fillStyle = color;
    context.fillText(text, x, y);
  }

  drawImage(image: any, x: number, y: number) {
    const context = this.context;

    context.imageSmoothingEnabled = false;
    context.drawImage(image, x, y - 8, 64, 64);

  }



  drawRectangle(position: Vector, size: Vector, options = { stroke: '', fill: '' }) {
    const ctx = this.context;

    ctx.beginPath();

    ctx.strokeStyle = options.stroke
    ctx.lineWidth = 3;
    ctx.rect(position.x, position.y, size.x, size.y);
    ctx.stroke();

    if (options.fill != '') {
      ctx.fillStyle = options.fill
      ctx.rect(position.x, position.y, size.x, size.y);
      ctx.fill();
    }
  }

  drawCircle(position: Vector, size: number = 10, options = { stroke: '', fill: '', lineWidth : 3 }) {
    const ctx = this.context;

    ctx.beginPath();

    ctx.strokeStyle = options.stroke
    ctx.lineWidth = options.lineWidth;
    ctx.arc(position.x, position.y, size / 2, 0, 2 * Math.PI);
    ctx.stroke();

    if (options.fill != '') {
      ctx.fillStyle = options.fill
      ctx.arc(position.x, position.y, size / 2, 0, 2 * Math.PI);
      ctx.fill();
    }
  }



  drawLine(position: Vector, destination: Vector, options = { stroke: `rgba(127,255,212,0.85)`, fill: '' }) {
    const ctx = this.context;

    ctx.beginPath();
    ctx.strokeStyle = options.stroke //`rgba(127,255,212,0.85)`;
    ctx.lineWidth = 3;
    ctx.moveTo(position.x, position.y);
    ctx.lineTo(destination.x, destination.y);
    ctx.stroke();
  }


  drawBar(x: number, y: number, valueToShow: number, valueMax: number, Size = 400, color = '#ff0', background = '#ff0', lineWidth = 8, flip:boolean = true) {
    const ctx = this.context;

    let value = (valueMax - valueToShow) / valueMax

    ctx.save()
    ctx.translate(x, y)
    // ctx.scale((flip ? -1 : 1), 0)
    x = 0, y = 0

    ctx.beginPath()
    ctx.strokeStyle = background
    ctx.lineWidth = lineWidth
    ctx.moveTo(x - Size / 2, y)
    ctx.lineTo(x + Size / 2, y)
    ctx.stroke()

    ctx.beginPath()
    ctx.strokeStyle = color
    ctx.lineWidth = lineWidth
    if (flip) {
      ctx.moveTo(x + Size / 2, y)
      ctx.lineTo(x + Size / 2 - Size * value, y)
    } else {
      ctx.moveTo(x - Size / 2, y)
      ctx.lineTo(x - Size / 2 + Size * value, y)
    }
    ctx.stroke()

    ctx.restore()
  }



  drawQuadtree(node: any, ctx: CanvasRenderingContext2D) {
    //no subnodes? draw the current node
    if (node.nodes.length === 0) {
      ctx.strokeStyle = `rgba(127,255,212,0.25)`;
      ctx.strokeRect(node.bounds.x, node.bounds.y, node.bounds.width, node.bounds.height);
      //has subnodes? drawQuadtree them!
    } else {
      for (let i = 0; i < node.nodes.length; i = i + 1) {
        this.drawQuadtree(node.nodes[i], ctx);
      }
    }
  }




  /**
   * 
   * @param points 
   */
  drawDynamicFogOfWar(points: Vector[]) {

    // fog hole radius
    let size = 800

    // reduce points to matrix width 100
    points = points.map(m => { return new Vector(100 * Math.floor(m.x / 100), 100 * Math.floor(m.y / 100)) })

    // get unique points
    const uniquePoints = [...new Map(points.map(item => [item['key'], item])).values()];

    // store unique points of frame in memory
    this.fogMemory.push(uniquePoints)
    if (this.fogMemory.length > 100)
      this.fogMemory = this.fogMemory.slice(-1)

    // get All points from memory
    const lastFramesPoints = this.fogMemory.flat()

    // get unique memory points
    const memoryUniquePoints = [...new Map(lastFramesPoints.map(item => [item['key'], item])).values()];

    let ctx = c2d.cloneNode().getContext('2d');
    this.contextFogOfWar = ctx

    ctx.fillStyle = 'rgb(0,0,0,.95)'

    memoryUniquePoints
      .forEach(point => {
        ctx.beginPath();
        ctx.arc(point.x, point.y, size / 2, 0, 2 * Math.PI);
        ctx.fill();
      })

    ctx.filter = "blur(10px)";

    this.context.globalCompositeOperation = 'destination-in';
    this.context.drawImage(ctx.canvas, 0, 0);
    this.context.globalCompositeOperation = 'source-over';

  }





}

export const drawEngine = new DrawEngine();
