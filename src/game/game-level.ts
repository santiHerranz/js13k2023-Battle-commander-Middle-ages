import { drawEngine } from "../core/draw-engine";
import { Vector } from "../core/vector";
import { Timer, randInt } from "@/utils";
import { EntityType, unitTypes } from "./EntityType";
import { themeDef, themeCollection } from "./game-map";



export interface LevelDefinition {
    playerTypes: number[];
    sizeFactor: number;
    enemyCount: number;
    enemyType: number;
    fogOfWar: boolean;
    theme: number
    highScore: number;
    stars: number
}

export class Level {

    levelIndex: number = 0

    playerPosition: Vector = new Vector(1, 1);
    playerInitCount: number = 0;

    enemyPosition: Vector = new Vector(1, 1);
    enemyInitCount: number = 0;
    enemyUnitType: number

    levelTimer: Timer;

    level: LevelDefinition[] = [];
    levelSizefactor: number;
    fogOfWar: boolean = false;
    theme: number;
    gold: number = 0;
    playerTypes: number[] = [];

    stars: number = 0;
    finalLevelIndex: number = 12;

    constructor() {
        this.enemyUnitType = unitTypes[0]
        this.levelSizefactor = 1.0

        this.levelTimer = new Timer(0)

        this.theme = randInt(0, themeCollection.length + 1)

        let dataTable = [
            [10, EntityType.Troop, themeDef.forest, 2, 0], // level 1
            [50, EntityType.Archer, themeDef.dessert, 1.5, 0], // level 2
            [100, EntityType.Knight, themeDef.forest, 1.5, 0], // level 3
            [20, EntityType.Artillery, themeDef.dessert, 1.5, 0], // level 4
            [30, EntityType.Cavalry, themeDef.snow, 1.2, 1], // level 5
            [100, EntityType.None, themeDef.forest, 1.5, 1], // level 6
            [120, EntityType.None, themeDef.forest, 1.3, 1], // level 7
            [140, EntityType.None, themeDef.forest, 1.2, 1], // level 8
            [180, EntityType.None, themeDef.forest, 1.1, 1], // level 9
            [200, EntityType.None, themeDef.forest, 1, 1], // level 10
            [240, EntityType.None, themeDef.forest, .9, 1], // level 11
            [300, EntityType.None, themeDef.forest, .8, 1], // level 12
            [500, EntityType.None, themeDef.dessert, .7, 0], // level 13
        ]

        dataTable.forEach((data, index) => {

            let types: number[] = []

            types.push(EntityType.Troop)
            types.push(EntityType.Testudo)
            types.push(EntityType.Archer)
            if (index > 0)
                types.push(EntityType.Knight)
            if (index > 0)
                types.push(EntityType.Artillery)
                if (index > 1)
                types.push(EntityType.Cavalry)

            let i = 0
            this.level.push({
                playerTypes: [...types],
                enemyCount: data[i++],
                enemyType: data[i++],
                theme: data[i++],
                sizeFactor: data[i++],
                fogOfWar: data[i++] == 1 ? true : false, //false, //
                stars: 0,
                highScore: 0
            })
        })

        this.init(this.levelIndex)

    }

    init(level: number) {


        this.playerPosition = new Vector(drawEngine.canvasWidth * 2 / 10, drawEngine.canvasHeight / 2)
        this.enemyPosition = new Vector(drawEngine.canvasWidth * .82, drawEngine.canvasHeight * .6)

        this.levelIndex = level

        const currentLevel = this.level[this.levelIndex];

        this.playerTypes = currentLevel.playerTypes

        this.theme = currentLevel.theme

        this.levelSizefactor = currentLevel.sizeFactor
        this.fogOfWar = currentLevel.fogOfWar

        this.enemyInitCount = currentLevel.enemyCount
        this.enemyUnitType = currentLevel.enemyType

        this.levelTimer = new Timer(60) // On minute safe end

        this.stars = 0

    }


    next() {
        this.levelIndex = (this.levelIndex + 1) % this.level.length
    }


}

export const gameLevel: Level = new Level()