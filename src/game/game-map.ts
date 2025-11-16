import { Vector } from "@/core/vector";
import TileMap from "./tilemap";
import { drawEngine } from "@/core/draw-engine";
import { GameTile } from "./game-tile";

export const themeDef = { forest: 0, dessert: 1, other: 2, snow: 3} //, sea: 2 
export const themeCollection = [themeDef.forest, themeDef.dessert, themeDef.other, themeDef.snow] //, themeDef.sea

export class GameMap {

    tileMap: TileMap;
    imageCache: any;
    blurredCache: any;
    theme: number = 0;

    dim: Vector
    size: Vector
    seed: number

    constructor(dim: Vector = new Vector(60, 60), size: Vector = new Vector(5, 5), seed = 81962, theme = themeDef.forest) {

        this.dim = dim
        this.size = size
        this.seed = seed
        this.theme = theme

        this.tileMap = new TileMap(dim, size, seed);
    }

    Init() {
        this.tileMap = new TileMap(this.dim, this.size, this.seed);
        this.imageCache = undefined
        this.blurredCache = undefined
    }

    drawTileMap(ctx: CanvasRenderingContext2D, blurValue = 15) {

        var w = drawEngine.canvasWidth, h = drawEngine.canvasHeight;
        if (!this.imageCache) {

            var palette = [
                ["#fff", "#1a4f15", "#2a5f1f", "#3a6f2a", "#564d40"],    // forest (darker greens)
                ["#F0E2AE", "#F2CA9D", "#E7A885", "#CE8A7A", "#C37F7C"], // dessert
                ["#FE6927", "#FFD85F", "#FEE8AA", "#FCEC9C", "#FFE293"], // other
                ["#fff", "#ddd", "#bbb", "#999", "#777"], // snow
                // ["#A28654", "#1ba5e1", "#e5d9c2", "#48893e", "#564d40"], // sea
            ]

            var colors = palette[this.theme]

            let tempCtx = c2d.cloneNode().getContext('2d');
            this.tileMap._map.forEach(row => {
                row.forEach((tile: GameTile) => {
                    tempCtx.fillStyle = colors[tile._tileType]
                    tempCtx.beginPath()
                    tempCtx.rect(tile._position.x, tile._position.y, tile._tileSize.x, tile._tileSize.y)
                    tempCtx.fill()

                })

            })

            this.imageCache = tempCtx

            // Pre-render blurred version once
            let blurCtx = c2d.cloneNode().getContext('2d');
            blurCtx.filter = 'contrast(110%) brightness(120%) saturate(150%) blur(' + blurValue + 'px)';
            blurCtx.globalAlpha = .8
            blurCtx.drawImage(this.imageCache.canvas, 0, 0);
            blurCtx.filter = 'none';
            blurCtx.globalAlpha = 1
            this.blurredCache = blurCtx
        }

        // Use pre-rendered blurred cache (no filter operations per frame)
        var x = w / 2, y = h / 2
        ctx.drawImage(this.blurredCache.canvas, x - w / 2, y - h / 2);

    }


}