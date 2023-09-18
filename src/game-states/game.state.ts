import { State } from '@/core/state';
import { drawEngine } from '@/core/draw-engine';
import { inputKeyboard } from '@/core/input-keyboard';
import { gameStateMachine } from '@/game-state-machine';
import { menuState } from '@/game-states/menu.state';
import Unit from '@/game/unit';
import { Army, EntityType, Team, unitNames, unitTypes } from "@/game/EntityType";
import { Quadtree } from '@/quadtree/Quadtree';
import { Vector } from '@/core/vector';
import { inputMouse } from '@/core/input-mouse';
import { Button } from '@/core/button';
import { PI, Timer, rand, randInt } from '@/utils';
import { GameResult, GameResultData, summaryState } from './summary.state';
import { GameObject } from '@/game/game-object';
import { Particle } from '@/game/game-particle';
// import { Tree } from '@/game/tree';


import { Archer } from '@/game/unit.archer';
import { Troop } from '@/game/unit.troop';
import { Knight } from '@/game/unit.knight';
import { Artillery } from '@/game/unit.artillery';

import { sound } from '@/core/sound';
import { SND_ARROW_SHOOT, SND_BATTLE_BEGIN, SND_EXPLOSION, SND_UNIT_PLACE } from '@/game/game-sound';

import { Explosion } from '@/game/unit.explosion';
import { Circle } from '@/quadtree/Circle';
import { Line } from '@/quadtree/Line';
import { Rectangle } from '@/quadtree/Rectangle';
import { Indexable } from '@/quadtree/types';
import { gameDatabase } from '@/game-database';
import { createArrow, createCannonBall } from '@/game/game-weapons';
import { enemyTargetDesignation, manageUnitsCollision } from '@/game/game-manager';
import { Level, gameLevel } from '@/game/game-level';
import { GameMap } from '@/game/game-map';
import { campaingState } from './campaign.state';
import { transparent } from '@/index';
import { Label } from '@/game/label';
import { Testudo } from '@/game/unit.testudo';
import { Cavalry } from '@/game/unit.cavalry';



export const enum GameMode {
  easy = 1,
  medium = 2,
  hard = 3
}


export const enum BattleStatus {
  prepare = 1,
  figth = 2,
  ended = 3
}


class GameState implements State {


  Active: boolean = false;


  collisionTree: Quadtree<Rectangle<void> | Circle<void> | Line<void> | Indexable>

  private _currentUnitSize: Vector | undefined
  private _currentUnitType: number = EntityType.Troop


  gameObjects: GameObject[] = []
  units: Unit[] = []
  projectiles: GameObject[] = []
  labels: GameObject[] = []

  buttons: Button[] = []
  placeButtons: Button[] = []

  btnFigth!: Button;
  btnClear!: Button;

  btnTroop!: Button;
  btnTestudo!: Button;
  btnArcher!: Button;
  btnKnight!: Button;
  btnArtillery!: Button;
  btnCavalry!: Button;
  btnGold!: Button;


  blood: Particle[] = []

  gameData: GameResultData = {
    result: 0,
    teamAlphaBeginCount: 0,
    teamBravoBeginCount: 0,

    teamAlphaEndCount: 0,
    teamBravoEndCount: 0,

    teamAlphaCost: 0,
    teamBravoCost: 0,

    kills: { alpha: 0, bravo: 0 },
  };

  level: Level;

  // Map
  gameMap: GameMap
  defMapDim: Vector = new Vector(1, 1);
  defTileSize: Vector = new Vector(1, 1); // Tile Size
  seed: number = Math.random() //.601 // 

  removeUnitRadiusAvailable: number[] = [1, 2]
  removeUnitRadiusIndex: number = 0
  removeUnitRadius: number = this.removeUnitRadiusAvailable[this.removeUnitRadiusIndex];

  private battleStatus = BattleStatus.prepare;

  playerBankGold: number = 0;
  playerBattleGold: number = 0;


  drawTimer: Timer | undefined;

  lastDeathPosition: Vector | undefined


  kills: { alpha: number, bravo: number } = { alpha: 0, bravo: 0 }

  gameMode = GameMode.easy;

  constructor() {

    this.collisionTree = new Quadtree({
      width: drawEngine.canvasWidth,
      height: drawEngine.canvasHeight,
      maxObjects: 3
    });

    this.level = gameLevel;
    this.gameMap = new GameMap(new Vector(8, 8), new Vector(8, 8), this.seed, this.level.theme);
  }

  // Unit Type
  public get currentUnitType(): number {
    return this._currentUnitType;
  }
  public set currentUnitType(value: number) {
    this._currentUnitType = value;
    this._currentUnitSize = undefined
  }

  // Unit Size
  get currentUnitSize() {
    if (this._currentUnitSize == undefined)
      this._currentUnitSize = gameDatabase.getUnitSize(this.currentUnitType).scale(this.level.levelSizefactor)
    return this._currentUnitSize
  }


  get teamAlpha() {
    return this.units.filter(f => f.Team == Team.Alpha)
  }
  get teamBravo() {
    return this.units.filter(f => f.Team == Team.Bravo)
  }
  get bulletsAlpha() {
    return this.projectiles.filter(f => f.Team == Team.Alpha)
  }






  resetGame() {


    this.units = []

    this.level.levelTimer.unset()

    this.battleStatus = BattleStatus.prepare

    this.gameObjects = []
    this.units = []
    this.projectiles = []
    this.blood = []

    // Everyone quiet
    this.units.forEach(unit => {
      unit.VisionRange = 0
    })

    this.currentUnitType = EntityType.Troop

    this.gameData.teamAlphaCost = 0
    this.gameData.teamBravoCost = 0

    this.kills.alpha = this.kills.bravo = 0


  }


  init(level: number) {


    this.resetGame()

    this.level.init(level)

    this.gameMap.Init()


    this.defTileSize = new Vector(40, 44)
    this.defMapDim = new Vector(48, 25)
    this.gameMap = new GameMap(this.defMapDim, this.defTileSize, this.seed, this.level.theme);

    drawEngine.init()

    // Butons
    this.createGameButtons();

    // FEATURE:  hide button units not in level
    let levelUnitTypes = this.level.playerTypes
    unitTypes.forEach(unitType => {

      if (!levelUnitTypes.includes(unitType)) {
        if (unitType == EntityType.Troop) this.btnTroop.enabled = false
        if (unitType == EntityType.Testudo) this.btnTestudo.enabled = false
        if (unitType == EntityType.Archer) this.btnArcher.enabled = false
        if (unitType == EntityType.Knight) this.btnKnight.enabled = false
        if (unitType == EntityType.Artillery) this.btnArtillery.enabled = false
        if (unitType == EntityType.Cavalry) this.btnCavalry.enabled = false
      }
    })


    // let bossFactor = 1
    // if (this.level.levelIndex == this.level.finalBossIndex) {
    //   bossFactor = 2
    // }

    if (this.level.enemyUnitType == EntityType.None) {
      // Enemy spawn 

      let count: number = this.level.enemyInitCount
      let position: Vector = this.level.enemyPosition

      let type: number = EntityType.Archer

      let size: Vector = gameDatabase.getUnitSize(type).scale(this.level.levelSizefactor)

      let p = new Vector(0, 0);
      let ref = new Vector(1, 1).scale(size.length()*this.level.levelSizefactor);

      const enemyTypes = [
        EntityType.Troop,
        EntityType.Archer,
        EntityType.Knight
      ];

      for (let index = 0; index < count; index++) {

        type = enemyTypes[randInt(0, enemyTypes.length)]

        let enemy = this.newUnit(position.clone().add(ref).add(p), this.level.levelSizefactor, Team.Bravo, type); // 

        this.units.push(enemy);
        p = Vector.rand().scale(randInt(20,500)*this.level.levelSizefactor);
      }

    } else {
      // Enemy spawn in formation
      this.spawnInFormation(this.level.enemyInitCount, Team.Bravo, this.level.enemyPosition, this.level.levelSizefactor, this.level.enemyUnitType, this.level.levelIndex == 3?2.5:1);

    }

    // get enemy cost
    this.gameData.teamBravoCost = 0
    this.teamBravo.forEach(unit => {
      this.gameData.teamBravoCost += gameDatabase.getDataValues(unit.type).cost;
    })

    this.playerBattleGold = this.gameData.teamBravoCost

    // game dificulty
    if (this.gameMode == GameMode.easy)
      this.playerBattleGold = Math.floor(this.playerBattleGold * 1.5)
    else if (this.gameMode == GameMode.medium)
      this.playerBattleGold = Math.floor(this.playerBattleGold * 1.25)

    this.calculatePlayerCost();

    // transaction
    // this.playerBattleGold = this.playerBankGold
    // this.playerBankGold = 0

    // if (this.playerBattleGold < this.level.gold)
    // this.playerBattleGold = this.level.gold

    // this.playerBattleGold = 50000


    console.log('added ' + this.playerBattleGold + ' to Battle Gold')
    this.calculateUnitsAvailable()

  }



  fight() {



    // initial game data
    this.gameData.result = GameResult.tie
    this.gameData.teamAlphaBeginCount = this.teamAlpha.length
    this.gameData.teamBravoBeginCount = this.teamBravo.length

    this.level.levelTimer = new Timer(60) // 60*3

    this.units.forEach(unit => {

      // let team = mode == GameMode.attack ? Team.Alpha : Team.Bravo
      // let range = unit.Team == team ? drawEngine.canvasWidth : drawEngine.canvasWidth / 2
      // if (mode == GameMode.allAttack) range = drawEngine.canvasWidth
      unit.setActive(drawEngine.canvasWidth)
    })


  }

  next() {
    this.level.next()
    this.seed = Math.random()
    this.init(this.level.levelIndex)
  }

  changeTheme() {
    this.seed = Math.random()
    this.init(this.level.levelIndex)
  }

  onEnter() {



    // Bind methods with
    // inputMouse.clickAction = () => this.clickAction(inputMouse.pointer.Position)
    inputMouse.eventMouseMove = () => { this.mouseMove(); }
    inputMouse.eventMouseDown = () => { this.mouseDown(); }
    inputMouse.eventMouseUp = () => { this.mouseUp(); }
    inputMouse.eventContextmenu = () => { this.contextmenu(); }
    inputMouse.eventMouseScroll = () => { this.mouseScroll(); }

  }


  onLeave() {
    inputMouse.eventMouseMove = () => { }
  }

  private spawnInFormation(count: number, team: number, position: Vector, sizeFactor: number, type: number, spaceFactor: number = 1) {

    let size: Vector = gameDatabase.getUnitSize(type).scale(sizeFactor*spaceFactor)

    let side = Math.sqrt(count);

    let ref = new Vector([0, -1, -2][team] * side / 2, -side / 2).scale(size.length());
    // ref.add(new Vector(-side*size.x, -side*size.y))
    let p = new Vector(0, 0); // new Vector(rand(10, 200), 0).rotate(rand(0, Math.PI * 2))
    let row = 0, col = 0;
    for (let index = 0; index < count; index++) {

      let enemy = this.newUnit(position.clone().add(ref).add(p), sizeFactor, team, type); // 

      this.units.push(enemy);
      if (++col >= side) {
        col = 0, row++;
      }
      p = new Vector(col * size.length(), row * size.length());
    }
  }


  onUpdate(dt: number) {

    if (this.level.levelIndex == this.level.finalLevelIndex) {
      if (this.units.length < 1000 && this.playerBattleGold < 100000) 
      this.playerBattleGold += 10
    }

    this.gameObjects = [...this.units, ...this.projectiles] //

    // destroy unhealth game objects
    this.gameObjects.forEach((item: GameObject) => {
      if (item.healthPoints < 1) item.destroy()
    })

    // Remove death stuff
    this.units = this.units.filter((f: Unit) => { return f.Active && f.healthPoints > 0 });
    this.projectiles = this.projectiles.filter((f: GameObject) => { return f.Active && f.healthPoints > 0 });
    this.labels = this.labels.filter((f: GameObject) => { return f.Active });
    this.blood = this.blood.filter((f: Particle) => { return f.Active && f.ttl > 0 });


    // Updates


    // Update particles
    this.blood.forEach((item: Particle) => {
      item._update(dt)
    })

    // Update buttons
    this.buttons.forEach((button: Button) => {
      button.selected = false
      if (button.unit && button.unit.type == this.currentUnitType) button.selected = true
      button._update(dt)
    })


    // Enemy target designation
    enemyTargetDesignation(this.units);


    // Keep units quite during prepare status
    this.units.forEach((item: Unit) => {
      if (this.battleStatus != BattleStatus.prepare)
        item._update(dt)
      else
        item._currentAnim._update(dt);
    })


    // Update game objects


    this.projectiles.forEach((item: GameObject) => {
      item._update(dt)
    })

    this.labels.forEach((item: GameObject) => {
      item._update(dt)
    })

    // Projectile Physics for every frame
    this.projectiles.forEach((projectile: GameObject) => {
      projectile.Velocity.add(projectile.Acceleration);
      projectile.Position.add(projectile.Velocity);

      // No Drag for projectile
      // Arrow.Velocity.scale(0.99);

      // reset acceleration
      projectile.Acceleration.scale(0);
    })


    // Add Units and projectiles to the quadtree collision
    this.gameObjects = [...this.units, ...this.projectiles] //

    this.collisionTree.clear()
    this.gameObjects
      .forEach(item => {
        if (this.battleStatus == BattleStatus.prepare && item instanceof Unit) return
        this.collisionTree.insert(item);
      })


    // Unit Physics for every frame
    manageUnitsCollision(this.units, dt, Math.min(1, 1 / this.level.levelSizefactor));


    // DRAW SCENE

    this.gameMap.drawTileMap(drawEngine.context, 15)


    // Team middle lines
    let x = drawEngine.canvasWidth / 2 - 2
    drawEngine.drawLine(new Vector(x, 0), new Vector(x, drawEngine.canvasHeight), { stroke: 'red', fill: '' })
    x = x + 4
    drawEngine.drawLine(new Vector(x, 0), new Vector(x, drawEngine.canvasHeight), { stroke: 'blue', fill: '' })


    // Blood and death layer
    drawEngine.drawItems(this.blood, drawEngine.contextBlood)
    drawEngine.context.globalAlpha = .2
    drawEngine.context.drawImage(drawEngine.contextBlood.canvas, 0, 0);
    drawEngine.context.globalAlpha = .4
    drawEngine.context.drawImage(drawEngine.contextDeath.canvas, 0, 0);
    drawEngine.context.globalAlpha = 1


    drawEngine.drawItems([...this.units, ...this.projectiles, ...this.labels])



    // Fog of war
    if (this.level.fogOfWar && (this.battleStatus != BattleStatus.ended || this.teamAlpha.length == 0 || this.teamBravo.length == 0)) {

      let fogData = [...this.teamAlpha, ...this.bulletsAlpha]

      const points = fogData.map(unit => unit.Position.clone());
      drawEngine.drawDynamicFogOfWar(points)
    }



    this.drawUI();

    this.drawPointer()


    this.battleEnd();


    // if (debug.showQuadtree) {
    //   drawEngine.context.beginPath()
    //   drawEngine.drawQuadtree(this.collisionTree, drawEngine.context);
    // }


    if (inputKeyboard.isEscape) {
      gameStateMachine.setState(menuState);
    }

  }












  endCondition(): number {

    let result = 0

    if (!this.drawTimer?.isSet() && (this.teamBravo.length == 0 || this.teamAlpha.length == 0)) {
      this.drawTimer = new Timer(1.5)

      // Jump
      this.units
        .forEach(unit => {
          unit.winner = true;
        });
    }

    if ((this.drawTimer && this.drawTimer.elapsed()) || this.level.levelTimer.elapsed()) {
      this.drawTimer && this.drawTimer.unset()

      if (this.teamBravo.length == 0 && this.teamAlpha.length == 0) {
        result = GameResult.tie
      }
      else if (this.teamBravo.length == 0 && this.teamAlpha.length > 0) {
        result = GameResult.win
      }
      else if (this.teamAlpha.length == 0 || this.level.levelTimer.get() > 0) {
        result = GameResult.loose
      }

    }


    return result
  }


  private battleEnd() {

    if (this.battleStatus == BattleStatus.figth) {

      let result = this.endCondition()

      if (result != 0) {

        this.battleStatus = BattleStatus.ended;

        this.gameData.result = result
        this.gameData.teamAlphaEndCount = this.teamAlpha.length;
        this.gameData.teamBravoEndCount = this.teamBravo.length;
        this.gameData.kills = this.kills

        gameLevel.level[gameLevel.levelIndex].stars = this.level.stars


        campaingState.levelUnlock = (this.level.levelIndex + 1) + 1;

        summaryState.setGameResult(this.gameData);

        setTimeout(() => {
          gameStateMachine.setState(summaryState);
        }, 2000);


      }
    }
  }





  private newBlood(position: Vector, size: Vector, team: number) {

    let p = new Particle(position.clone(), size.clone(), team);
    this.blood.push(p);
  }











  drawPointer() {

    // drawEngine.drawCircle(inputMouse.pointer.Position, 32);

    if (this.isPlaceUnitAllowed(inputMouse.pointer.Position)) {

      let size = gameDatabase.getUnitSize(this.currentUnitType).scale(this.level.levelSizefactor)
      // let size: Vector =   this.currentUnitSize.clone()//.scale(1.5)
      // drawEngine.drawRectangle(inputMouse.pointer.Position.clone().add(size.clone().scale(-.5)), size, { stroke: 'transparent', fill: 'rgb(255,0,0,.3)' });


      let { gridPosition } = this.isPlaceFree(inputMouse.pointer.Position, size.length());

      let matrixPosition: { point: Vector, size2: number }[] = this.getMatrix(gridPosition, size, this.removeUnitRadiusIndex)

      matrixPosition.forEach((item, index) => {

        let { freePlace } = this.isPlaceFree(item.point, size.length());

        drawEngine.drawCircle(item.point, Math.floor(size.length()), { stroke: transparent, fill: ['rgb(0,255,0,.3)', 'rgb(255,0,0,.3)'][freePlace ? 0 : 1], lineWidth: 3 });
        // drawEngine.drawText("" + item.point.key, 20, item.point.x, item.point.y)
      })

      // drawEngine.drawCircle(inputMouse.pointer.Position, Math.floor(size.length()), { stroke: 'rgb(255,0,0,.3)', fill: transparent });

    }

  }



  getMatrix(position: Vector, size: Vector, index: number) {

    const points: { point: Vector, size2: number }[] = [];

    const addPoints = (delta: Vector) => {
      for (let i = 0; i < 4; i++) {
        points.push({ point: position.clone().add(delta.rotate((i * PI) / 2)), size2: 10 }); //.add(new Vector(16,16))
      }
    };

    points.push({ point: position.clone(), size2: 10 }); //.add(new Vector(16,16))

    if (index > 0) {
      const delta1 = new Vector(Math.floor(size.length()), 0);
      addPoints(delta1);
      const delta2 = new Vector(Math.floor(size.length()), Math.floor(size.length()))
      addPoints(delta2);
    }

    return points;
  }


  private drawUI() {


    // Top bar buttons visibility
    if (this.battleStatus == BattleStatus.figth) {
      this.btnClear.visible = false
    }



    // top bar
    drawEngine.drawRectangle(new Vector(0, 0), new Vector(drawEngine.canvasWidth, 110), { stroke: transparent, fill: 'rgb(150,0,150,.3)' })

    // team bars
    drawEngine.drawBar(drawEngine.canvasWidth / 4, 110, this.teamAlpha.length, this.gameData.teamAlphaBeginCount, drawEngine.canvasWidth / 2, '#500', '#f00', 12, false)
    drawEngine.drawBar(drawEngine.canvasWidth * 3 / 4, 110, this.teamBravo.length, this.gameData.teamBravoBeginCount, drawEngine.canvasWidth / 2, '#005', '#00f', 12, true)

    // Standarte
    let size = new Vector(200, 105)
    drawEngine.drawRectangle(new Vector(drawEngine.canvasWidth / 2 - size.x / 2, 0), size, { stroke: '#000', fill: '#808' })




    // Score stars
    if (this.battleStatus == BattleStatus.figth && this.teamAlpha.length > 0) {

      if (this.level.stars == 0 && this.teamBravo.length == 0) {
        this.level.stars = 1
        this.sendStar()
      }
    }


    drawEngine.drawText(Array(this.level.stars).fill('⭐').join(''), 80, drawEngine.canvasWidth * .9, 75)



    const xCenter = drawEngine.canvasWidth / 2;

    drawEngine.drawText('Level ' + (this.level.levelIndex + 1), 40, drawEngine.canvasWidth * .07, 70);

    // drawEngine.drawText('' + time.toFixed(0) + ' : ' + frame + ' : ' + (frame / time).toFixed(1), 40, 0, 50, undefined, 'left');
    drawEngine.drawText(this.teamAlpha.length + ' vs ' + this.teamBravo.length, 70, drawEngine.canvasWidth * .75, 80);
    // drawEngine.drawText('Kills: ' + this.kills.alpha, 30, drawEngine.canvasWidth * .75, 95, '#ff0');

    // drawEngine.drawText('Cost: ' + this.gameData.teamAlphaCost + ' vs ' + this.gameData.teamBravoCost + '    Score: ' + (this.gameData.teamBravoCost - this.gameData.teamAlphaCost), 30, drawEngine.canvasWidth * .75, 95);




    if (this.battleStatus != BattleStatus.prepare) {
      drawEngine.drawText('Kills: ' + this.kills.alpha, 30, drawEngine.canvasWidth * .5, 50, '#ff0')

      // drawEngine.drawText(this.gameData.kills + '', 50, drawEngine.canvasWidth * .5, 50)
      // drawEngine.drawText(this.gameData.teamBravoCost - this.gameData.teamAlphaCost + '', 50, drawEngine.canvasWidth * .5, 50)
      // if (this.data.b > 0 && this.data.a > 0)
      // drawEngine.drawText((this.data.a / this.data.b).toFixed(2) + '', 50, drawEngine.canvasWidth * .5, 50)
    }

    if (this.battleStatus == BattleStatus.figth) {
      drawEngine.drawText('' + this.formatTimeRemaining((-1 * this.level.levelTimer.get())), 40, xCenter, 100);
    }

    this.buttons.forEach((button: Button) => {
      button._draw(drawEngine.context)
    })
  }


  sendStar() {
    if (this.lastDeathPosition) {
      this.labels.push(new Label("⭐", this.lastDeathPosition.clone(), new Vector(50, 50), Team.Alpha))
      this.lastDeathPosition = undefined
    }

  }



  private formatTimeRemaining(value: number) {
    var seconds = parseInt('' + value % 60);
    return seconds + 's';
  }







  mouseDown() {
    if (inputMouse.pointer.leftButton) {
      this.placeUnit(inputMouse.pointer.Position);
    }
    if (inputMouse.pointer.rigthButton) {
      this.removeUnit(inputMouse.pointer.Position);
    }
  }
  mouseMove() {
    if (inputMouse.pointer.leftButton) {
      this.placeUnit(inputMouse.pointer.Position);
    }
    if (inputMouse.pointer.rigthButton) {
      this.removeUnit(inputMouse.pointer.Position);
    }
  }

  mouseUp() {
    this.buttons.forEach(button => button.mouseUpEvent(inputMouse.pointer.Position))
  }

  mouseScroll() {
    this.removeUnitRadiusIndex += 1
    if (this.removeUnitRadiusIndex > this.removeUnitRadiusAvailable.length - 1) this.removeUnitRadiusIndex = 0
    this.removeUnitRadius = this.removeUnitRadiusAvailable[this.removeUnitRadiusIndex]
  }

  contextmenu() {
    if (this.battleStatus == BattleStatus.prepare)
      this.removeUnit(inputMouse.pointer.Position)
  }


  private removeUnit(position: Vector) {

    if (this.battleStatus != BattleStatus.prepare) return

    let factor = this.level.levelSizefactor
    let size = gameDatabase.getUnitSize(this.currentUnitType).scale(factor)

    let removeUnits = this.teamAlpha.filter(f => Vector.distance(f.Position, position) < this.removeUnitRadius * size.length())
    removeUnits.forEach(unit => {

      let cost = gameDatabase.getDataValues(unit.type).cost;
      this.playerBattleGold += cost
      this.gameData.teamAlphaCost -= cost;

    })

    this.units = this.units.filter(f => f.Team != Team.Alpha || Vector.distance(f.Position, position) > this.removeUnitRadius * size.length())



    this.calculateUnitsAvailable()
  }


  private calculatePlayerCost() {
    this.gameData.teamAlphaCost = 0;
    this.teamAlpha.forEach(unit => {
      this.gameData.teamAlphaCost += gameDatabase.getDataValues(unit.type).cost;
    });
  }

  private placeUnit(position: Vector) {
    if (!this.Active) return
    if (this.battleStatus == BattleStatus.ended) return

    let cost = gameDatabase.getDataValues(this.currentUnitType).cost

    if (cost > this.playerBattleGold) {
      // sound(SND_UNIT_CANT_PLACE);
      return
    }


    let size = gameDatabase.getUnitSize(this.currentUnitType).scale(this.level.levelSizefactor)

    // if (!this.checkPlace(position, size, this.level.levelSizefactor)) return

    // check allowed 
    let point = position.clone()

    let { gridPosition } = this.allowedPlace(point, size, this.level.levelSizefactor); //.clone().add(Vector.rand().scale(50))

    if (gridPosition) {

      let matrixPosition: { point: Vector, size2: number }[] = this.getMatrix(gridPosition, size, this.removeUnitRadiusIndex)

      let placed = false
      matrixPosition.forEach(item => {

        // let { freePlace } = this.isPlaceFree(item.point, size.length());
        let { freePlace } = this.allowedPlace(item.point, size, this.level.levelSizefactor)

        if (freePlace && cost <= this.playerBattleGold) {

          let u = this.newUnit(item.point, this.level.levelSizefactor, Team.Alpha, this.currentUnitType);

          if (this.battleStatus != BattleStatus.prepare)
            u.VisionRange = drawEngine.canvasWidth;

          this.units.push(u);
          placed = true

        }

      })

      placed && sound(SND_UNIT_PLACE);

      this.calculateUnitsAvailable();
    }



  }

  private allowedPlace(position: Vector, size: Vector, factor: number) {

    let { gridPosition, freePlace } = this.isPlaceFree(position, size.length());

    freePlace = this.isPlaceUnitAllowed(gridPosition) && freePlace

    return { gridPosition, freePlace }
  }

  /**
   * keep safe distance to place units
   * @param position 
   * @returns 
   */
  private isPlaceFree(position: Vector, size = 32): { gridPosition: Vector, freePlace: boolean } {

    let k = Math.floor(size)

    position = position.clone()//.add(new Vector(16,16))

    let gridPosition = new Vector(k * Math.floor(position.x / k), k * Math.floor(position.y / k))

    let points: Vector[] = []
    this.teamAlpha
      .forEach(unit => {
        points.push(unit.Position.clone())
      })

    points = points.map(position => { return new Vector(k * Math.floor(position.x / k), k * Math.floor(position.y / k)) })

    const uniquePoints = [...new Map(points.map(item =>
      [item['key'], item])).values()];

    let freePlace = uniquePoints.filter(f => f.key == gridPosition.key).length === 0

    return { gridPosition, freePlace }
  }


  /**
   * Only in player side 
   * Only below the top bar
   * @param position 
   * @returns 
   */
  private isPlaceUnitAllowed(position: Vector): boolean {
    return position.x < drawEngine.canvasWidth / 2 && position.y > 120 && position.x > 16 && position.y < drawEngine.canvasHeight - 16;
  }


  private newUnit(position: Vector, sizeFactor: number, team: number, type: EntityType): Unit {


    let unit = new Troop(position, sizeFactor, team);

    if (unit.weapon) unit.weapon._length = unit.Size.length() * .6

    if (type == EntityType.Testudo) {

      let testudo = new Testudo(position, sizeFactor, team);

      unit = testudo

    } else

      if (type == EntityType.Archer) {

        let archer = new Archer(position, sizeFactor, team);

        archer.shootHandler = (targetPosition, velocity: Vector) => {

          let arrow = createArrow(archer, velocity, targetPosition, this.level.levelSizefactor);
          this.projectiles.push(arrow)

          if (this.units.length < 10)
            sound(SND_ARROW_SHOOT)
        }
        unit = archer

      } else

        if (type == EntityType.Artillery) {

          let artillery = new Artillery(position, sizeFactor, team);
          artillery.shootHandler = (targetPosition: Vector, velocity: Vector) => {

            let cannonBall = createCannonBall(artillery, velocity, targetPosition, randInt(50, 300), this.level.levelSizefactor); // TODO cannonball size?
            cannonBall.explodeHandler = (explosion: Explosion) => {
              this.projectiles.push(explosion)
              sound(SND_EXPLOSION)
            }
            this.projectiles.push(cannonBall)
          }
          unit = artillery

        } else

          if (type == EntityType.Cavalry) {
            let cavalry = new Cavalry(position, sizeFactor, team);
            unit = cavalry
          } else

            if (type == EntityType.Knight) {
              let knight = new Knight(position, sizeFactor, team);
              unit = knight
              if (unit.weapon) unit.weapon._length = unit.Size.length() * .8 //  TODO clean
            }



    unit.deathHandler = () => {

      let cost = gameDatabase.getDataValues(unit.type).cost

      if (unit.Team == Team.Bravo) {
        this.lastDeathPosition = unit.Position.clone()

        this.labels.push(new Label("+1", unit.Position.clone(), unit.Size.clone().scale(.7), unit.Team, '#ff0'))
      }



      // Surprise!
      if (unit.type == EntityType.Artillery) {

        for (let index = 0; index < rand(2, 4); index++) {

          let targetPosition = unit.Position.clone().add(Vector.rand().scale(60));
          let { velocity } = (<Artillery>unit).calculateShoot(targetPosition)

          let cannonBall = createCannonBall(<Artillery>unit, velocity, targetPosition, randInt(50, 300), this.level.levelSizefactor);
          cannonBall.explodeHandler = (explosion: Explosion) => {
            this.projectiles.push(explosion)
            sound(SND_EXPLOSION)
          }
          this.projectiles.push(cannonBall)

        }

      }

      // console.log('blood: ' + unit.Team)

      // blood
      this.newBlood(unit.Position, unit.Size.clone().scale(1.2), unit.Team)
      // sound(SND_BLOOD)

      unit.draw(drawEngine.contextDeath, true)

      if (unit.Team == Team.Alpha)
        this.kills.bravo += 1
      else {
        this.kills.alpha += 1
      }


    }

    unit.jumping = () => {
      // sound(SND_JUMP)
    }


    let cost = gameDatabase.getDataValues(unit.type).cost;
    this.playerBattleGold -= cost
    this.gameData.teamAlphaCost += cost;

    return unit
  }



  private getAlphaCost() {

    let total = 0
    this.teamAlpha.forEach(unit => {
      total += gameDatabase.getDataValues(unit.type).cost;
    })
    return total

  }

  // private recalculateCost(team: number, unit: Troop) {
  //   if (team == Team.Alpha)
  //     this.gameData.teamAlphaCost += gameDatabase.getDataValues(unit.type).cost;

  //   if (team == Team.Bravo)
  //     this.gameData.teamBravoCost += gameDatabase.getDataValues(unit.type).cost;
  // }



  calculateUnitsAvailable() {

    if (this.btnTroop && this.btnTestudo && this.btnArcher && this.btnKnight && this.btnArtillery && this.btnCavalry) {

      this.btnTroop.data = '' + this.calculateAvailable(EntityType.Troop)
      this.btnTestudo.data = '' + this.calculateAvailable(EntityType.Testudo)
      this.btnArcher.data = '' + this.calculateAvailable(EntityType.Archer)
      this.btnKnight.data = '' + this.calculateAvailable(EntityType.Knight)
      this.btnArtillery.data = '' + this.calculateAvailable(EntityType.Artillery)
      this.btnCavalry.data = '' + this.calculateAvailable(EntityType.Cavalry)

      this.btnGold.data = '' + this.playerBattleGold

    }
  }



  private calculateAvailable(type: number) {
    // return (this.calculateGold() / gameDatabase.getDataValues(type).cost).toFixed(1) //Math.floor()
    return Math.floor(this.playerBattleGold / gameDatabase.getDataValues(type).cost)
  }




  private createGameButtons() {

    this.buttons = []
    this.placeButtons = []

    let size = 60;

    const posY = 10 + size / 2 //drawEngine.canvasHeight - size / 2;

    let btnExit = new Button(40, 40, size, size, "↩", "Back", 60);
    btnExit.visible = true
    btnExit.clickCB = () => {

      // cancel each unit transaction if battle has not begun
      if (this.battleStatus == BattleStatus.prepare) {
        this.teamAlpha.forEach(unit => {
          let cost = gameDatabase.getDataValues(unit.type).cost;
          this.playerBattleGold += cost
          this.gameData.teamAlphaCost -= cost;
        })

      }

      // Back gold to bank
      this.playerBankGold = this.playerBattleGold
      this.playerBattleGold = 0

      gameStateMachine.setState(campaingState);
    };
    this.buttons.push(btnExit);


    // Gold bank
    this.btnGold = new Button(drawEngine.canvasWidth * .13, posY, size, size, "💰", "");
    this.btnGold.clickCB = () => {
    };
    this.placeButtons.push(this.btnGold);


    // Units 
    let count = 0;
    let refX = drawEngine.canvasWidth / 5.4


    for (const unitType of unitTypes) {

      const cost = gameDatabase.getDataValues(unitType).cost
      const button = this.createUnitButton(refX - size / 2 + (size * 1.2) * count++, posY, size, unitType, "", `Place ${unitNames[unitType]} for ${cost}$`);

      if (unitType == EntityType.Troop) this.btnTroop = button
      if (unitType == EntityType.Testudo) this.btnTestudo = button
      if (unitType == EntityType.Archer) this.btnArcher = button
      if (unitType == EntityType.Knight) this.btnKnight = button
      if (unitType == EntityType.Artillery) this.btnArtillery = button
      if (unitType == EntityType.Cavalry) this.btnCavalry = button

      this.placeButtons.push(button);
    }


    // Clear
    this.btnClear = new Button(refX - size / 2 + (size * 1.2) * count++, posY, size, size, "🗑", "Clear");
    this.btnClear.visible = true
    this.btnClear.clickCB = () => {

      // cancel each unit transaction
      this.teamAlpha.forEach(unit => {
        let cost = gameDatabase.getDataValues(unit.type).cost;
        this.playerBattleGold += cost
        this.gameData.teamAlphaCost -= cost;
      })

      this.units = this.units.filter(f => f.Team != Team.Alpha)

      this.calculateUnitsAvailable()

    };
    this.placeButtons.push(this.btnClear);


    // Figth
    this.btnFigth = new Button(drawEngine.canvasWidth / 2, 50, 200, 110, "⚔", "Figth!", 100);
    this.btnFigth.visible = true
    this.btnFigth.clickCB = () => {
      if (this.battleStatus == BattleStatus.prepare) {
        this.battleStatus = BattleStatus.figth
        this.btnFigth.visible = false
        this.fight()
      }
    };

    this.buttons.push(this.btnFigth);




    // Button Sounds
    let bbb = [...[btnExit], ...[this.btnClear], ...[this.btnFigth], ...this.placeButtons]

    Button.setHover(bbb)

    // Keep sound of biegin fight
    this.btnFigth.clickEvent = () => {
      sound(SND_BATTLE_BEGIN)
    }

    // // SOUND TEST BUTTONS
    // const soundTest = [
    //   SND_BTN_HOVER,  // 1
    //   SND_BTN_DOWN,   // 2
    //   // SND_DIE,        // 3
    //   SND_JUMP,       // 4
    //   // SND_ATTACK,     // 5
    //   SND_ARROW_SHOOT, // 6
    //   // SND_UNIT_DAMAGE, // 7
    //   // SND_UNIT_KILLED, // 8
    //   // SND_BLOOD,       // 9
    //   SND_EXPLOSION,   // 10
    //   SND_UNIT_PLACE,   // 11
    // ]

    // count = 1
    // soundTest.forEach((item) => {

    //   let btn = new Button(drawEngine.canvasWidth / 2 - size / 2 + size * count++, drawEngine.canvasHeight - size / 2, size, size, '' + (count - 1), "", 40);
    //   btn.clickEvent = () => {
    //     sound(item)
    //   };
    //   btn.hoverOutEvent = () => { };
    //   btn.hoverEvent = () => { };
    //   btn.clickCB = () => { };
    //   this.buttons.push(btn);
    // })




    // let btn = new Button(drawEngine.canvasWidth / 2 + 150, 50, size, size, '🎲', "Cheat", 40);
    // btn.clickEvent = () => {
    //   this.teamBravo.forEach(unit => unit.healthPoints = 0)
    //   // campaingState.levelUnlock = (this.level.levelIndex + 1) + 1
    // };
    // this.buttons.push(btn);


    this.buttons = [...this.buttons, ...this.placeButtons]


  }

  private createUnitButton(x: number, y: number, size: number, type: number, text: string, title: string | undefined): Button {

    let btn = new Button(x, y, size, size, text, title);
    btn.visible = true
    // btn.image = Unit.prepareImage(type)


    let pos = new Vector(0, -4), sizeFactor = 1.8

    const entityClasses = {
      [Army.Troop]: Troop,
      [Army.Testudo]: Testudo,
      [Army.Archer]: Archer,
      [Army.Knight]: Knight,
      [Army.Artillery]: Artillery,
      [Army.Cavalry]: Cavalry,
    };
    const typeValue: Army = type
    const EntityClass = entityClasses[typeValue];
    btn.unit = new EntityClass(pos, sizeFactor, Team.Alpha);


    if (btn.unit) btn.unit.showBars = false
    btn.clickCB = (button) => {
      this.currentUnitType = button.unit!.type
    };
    this.placeButtons.push(btn);

    return btn
  }





}

export const gameState = new GameState();










