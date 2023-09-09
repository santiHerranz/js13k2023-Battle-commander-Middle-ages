import { Vector } from "@/core/vector";
import TileMap from "./tilemap";
import { drawEngine } from "@/core/draw-engine";
import { GameTile } from "./game-tile";

export const themeDef = { forest: 0, dessert: 1, other: 2, snow: 3} //, sea: 2 
export const themeCollection = [themeDef.forest, themeDef.dessert, themeDef.other, themeDef.snow] //, themeDef.sea

export class GameMap {

    tileMap: TileMap;
    imageCache: any;
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
    }

    drawTileMap(ctx: CanvasRenderingContext2D, blurValue = 15) {

        var w = drawEngine.canvasWidth, h = drawEngine.canvasHeight;
        if (!this.imageCache) {

            var palette = [
                ["#fff", "#28691e", "#38792e", "#48893e", "#564d40"],    // forest
                ["#F0E2AE", "#F2CA9D", "#E7A885", "#CE8A7A", "#C37F7C"], // dessert
                ["#FE6927", "#FFD85F", "#FEE8AA", "#FCEC9C", "#FFE293"], // other
                ["#fff", "#ddd", "#bbb", "#999", "#777"], // snow
                // ["#A28654", "#1ba5e1", "#e5d9c2", "#48893e", "#564d40"], // sea
            ]

            var colors = palette[this.theme]

            let ctx = c2d.cloneNode().getContext('2d');
            this.tileMap._map.forEach(row => {
                row.forEach((tile: GameTile) => {
                    ctx.fillStyle = colors[tile._tileType]
                    ctx.beginPath()
                    ctx.rect(tile._position.x, tile._position.y, tile._tileSize.x, tile._tileSize.y)
                    ctx.fill()

                })

            })

            this.imageCache = ctx
        } else {
            var x = w / 2, y = h / 2

            // Aplicar efecto de desenfoque
            ctx.filter = 'contrast(120%) brightness(150%) saturated(200%)';
            ctx.filter = 'blur(' + blurValue + 'px)';
            ctx.globalAlpha = .8

            ctx.drawImage(this.imageCache.canvas, x - w / 2, y - h / 2);

            // Limpiar el efecto de desenfoque
            ctx.filter = 'none';
            ctx.globalAlpha = 1

        }

    }


}