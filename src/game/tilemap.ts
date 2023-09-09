import { GameTile } from "./game-tile";
import { mkSimplexNoise } from "../core/simplex-noise";
import { Vector } from "../core/vector";


class TileMap {

  public _map: GameTile[][] = [];

  public _mapDim: Vector;
  public _tileSize: Vector;

  constructor(dim: Vector = new Vector(60, 60), size: Vector = new Vector(5, 5), seed = 81962) {

    let a = mkSimplexNoise(() => seed)


    // setMapDim(dim)
    this._mapDim = dim
    this._tileSize = size

    const TILE_HEIGHT = 0

    for (var i = dim.y; i--;) {
      var tileMapRow: GameTile[] = [];
      for (var j = dim.x; j--;) {

        var tile: GameTile;

        // let seed = 81962 //rndRng(0, 99999) //
        var p =     a.noise2D(i/20, j/20)     //perlinOctave(i/20, j/20, seed, .28, 10);

        var tileType = 0;

        if (p < 0) {
          tileType = 1; // water
        } else if (p < 0.35) {
          tileType = 2; // sand
        } else if (p < 0.94) {
          tileType = 3; // dirt
        } else if (p < 1) {
          tileType = 4; // grass
        }

        tile = new GameTile(j, i, TILE_HEIGHT, tileType, this._tileSize); // height 20

        //TODO this._addChild(tile);
        tileMapRow.push(tile);
      }

      this._map.push(tileMapRow.reverse());
    }

    this._map.reverse();
  }

}

export default TileMap;
