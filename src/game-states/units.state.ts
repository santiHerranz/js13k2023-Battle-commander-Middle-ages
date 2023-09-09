import { State } from '@/core/state';
import { drawEngine } from '@/core/draw-engine';
import { inputKeyboard } from '@/core/input-keyboard';
import { gameStateMachine } from '@/game-state-machine';
import { menuState } from './menu.state';
import { inputMouse } from '@/core/input-mouse';
import { Button } from '@/core/button';
import { sound } from '@/core/sound';
import { SND_ARROW_SHOOT, SND_EXPLOSION } from '@/game/game-sound';
import { Vector } from '@/core/vector';

import { time } from '@/index';
import { UnitData, gameDatabase } from '@/game-database';
import Unit from '@/game/unit';
import { EntityType, Team, unitNames } from "@/game/EntityType";
import { Troop } from '@/game/unit.troop';
import { Archer } from '@/game/unit.archer';
import { Knight } from '@/game/unit.knight';
import { Artillery } from '@/game/unit.artillery';
import { GameObject } from '@/game/game-object';
import { Explosion } from '@/game/unit.explosion';
import { createArrow, createCannonBall } from '../game/game-weapons';
import { Testudo } from '@/game/unit.testudo';
import { randInt } from '@/utils';
import { Cavalry } from '@/game/unit.cavalry';



interface Character {
  name: string;
  data: UnitData;
  unit: Unit;
}

class UnitsState implements State {

  private maxCols = 6
  private btnWidth = 230
  private btnHeight = 60

  buttons: Button[] = [];
  lables: any[] = [];
  count: number = 0
  col: number = 0
  row: number = 0

  army: Character[] = []
  gameObjects: GameObject[] = []

  targetPoint: Vector

  theArcher: Archer | undefined
  theArtillery: Artillery | undefined
  Active: boolean = false;
  targetPress: boolean = false;

  constructor() {

    this.targetPoint = new Vector(drawEngine.canvasWidth / 2, drawEngine.canvasHeight * .2)

  }

  get posX() {
    if (this.count % this.maxCols == 0) {
      this.row++
      this.col = 0
    } else this.col++

    return drawEngine.canvasWidth / 2 - this.btnWidth / 2 - (this.btnWidth * this.maxCols) / 2 + this.col * 320
  }

  get posY() {
    return drawEngine.canvasHeight / 2 - (this.btnHeight * 3) + this.row * 200
  }

  onEnter() {

    const Position = new Vector(0, 0);

    this.army = []

    gameDatabase.unitsData.forEach(item => {

      let unit = new Troop(Position, 2, Team.Alpha)

      if (item.name == unitNames[EntityType.Testudo]) {
        let testudo = new Testudo(Position, 2, Team.Alpha)

        unit = testudo
      }



      if (item.name == unitNames[EntityType.Archer]) {
        let archer = new Archer(Position, 2, Team.Alpha)

        archer.shootCoolDownValue /=2

        archer.shootHandler = (position: Vector, velocity: Vector) => {

          let arrow = createArrow(archer, velocity, position);
          this.gameObjects.push(arrow)
          sound(SND_ARROW_SHOOT)
        }
        unit = archer
        this.theArcher = archer
      }


      if (item.name == unitNames[EntityType.Knight])
        unit = new Knight(Position, 2, Team.Alpha)

      if (item.name == unitNames[EntityType.Artillery]) {
        let artillery = new Artillery(Position, 2, Team.Alpha)

        artillery.shootCoolDownValue /=2

        artillery.shootHandler = (targetPosition: Vector, velocity: Vector, zv) => {

          let cannonBall = createCannonBall(artillery, velocity, targetPosition,  randInt(50,300));
          cannonBall.explodeHandler = (explosion: Explosion) => {
            this.gameObjects.push(explosion)
            sound(SND_EXPLOSION)
          }
          this.gameObjects.push(cannonBall)

        }
        unit = artillery
        this.theArtillery = artillery
      }

      if (item.name == unitNames[EntityType.Cavalry])
      unit = new Cavalry(Position, 2, Team.Alpha)


      this.army.push({ name: item.name, data: item, unit: unit })
    })


    this.lables = []
    this.count = 0
    this.row = 0
    let label


    gameDatabase.unitsData
      .forEach((item, index) => {

        label = { x: this.posX, y: this.posY, text:item.name};
        this.lables.push(label);
        this.count++
      })


    this.row++
    this.row++

    let btn = new Button(drawEngine.canvasWidth / 2, this.posY, 500, 80, "Back", "");
    btn.clickCB = () => {
      gameStateMachine.setState(menuState);
    };
    this.buttons.push(btn);


    this.lables.forEach((label) => {
      let item = this.army.filter(f => f.name == label.text)[0]
      if (item) item.unit.Position = new Vector(label.x, label.y-120)
    })

    inputMouse.eventMouseDown = () => this.mouseDown()
    inputMouse.eventMouseMove = () => this.mouseMove()
    inputMouse.eventMouseUp = () => this.mouseUp()
  }

  onLeave() {
    this.buttons = []
    inputMouse.eventMouseDown = () => { }
  }


  onUpdate(dt: number) {

    // destroy unhealth game objects
    this.gameObjects.forEach((item: GameObject) => {
      if (item.healthPoints < 1) item.destroy()
    })

    this.gameObjects = this.gameObjects.filter((f: GameObject) => { return f.Active && f.healthPoints > 0 });

    this.gameObjects.forEach((item: GameObject) => {
      item._update(dt)
    })

    // Projectile Physics for every frame
    this.gameObjects.forEach((projectile: GameObject) => {
      projectile.Velocity.add(projectile.Acceleration);
      projectile.Position.add(projectile.Velocity);

      // No Drag for projectile
      // projectile.Velocity.scale(0.99);

      // reset acceleration
      projectile.Acceleration.scale(0);
    })

    const xCenter = drawEngine.context.canvas.width / 2;
    drawEngine.drawText('13th Century Army', 80, xCenter, 300);


    // DEBUG Size consistency
    // const size = 50 + Math.sin(time * 4) * 5;
    // this.army.forEach(item => {
    //   item.unit.Size = new Vector(size, size)
    //   if (item.unit._sword) item.unit._sword._length = size
    // })


    const jump = Math.sin(time) > 0
    const dir = Math.sin(time * 2) > 0
    const attack = Math.sin(time * 4) > 0

    this.buttons.forEach((button) => {

      button._update(dt)
      button._draw(drawEngine.context)
    })

    this.lables.forEach((label) => {

      drawEngine.drawText(label.text, 50, label.x, label.y+20, '#880')

      let item = this.army.find(f => f.name == label.text)

      if (item) {

        if (jump)
          item.unit.doJump()

        if (attack) {
          item.unit.attack()
        }

        // continuos shooting
        item.unit.shootTo(this.targetPoint)

        item.unit._update(dt)

        drawEngine.drawCircle(new Vector(label.x, label.y-120), 150, {stroke: '#800', fill: '#222', lineWidth: 10})
        item.unit.draw(drawEngine.context, dir)


        let fontSize = 30, row = 1, space = fontSize * 1.3

        drawEngine.drawText('cost: ' + item.data.cost, fontSize, label.x, label.y + ++row * space)
        drawEngine.drawText('Armor: ' + item.data.armor, fontSize, label.x, label.y + ++row * space)
        drawEngine.drawText('Damage: ' + item.data.attackDamage, fontSize, label.x, label.y + ++row * space)
        drawEngine.drawText('Cooldown: ' + item.data.attackCoolDown, fontSize, label.x, label.y + ++row * space)
        drawEngine.drawText('Speed: ' + Math.floor(item.data.speedFactor* item.unit.Radius), fontSize, label.x, label.y + ++row * space)
        // drawEngine.drawText('Range: ' + Math.floor(item.data.attackRangeFactor * item.unit.Radius), fontSize, label.x, label.y + ++row * space)
        item.data.shootRangeFactor && drawEngine.drawText('Range: ' + Math.floor(item.data.shootRangeFactor * item.unit.Radius), fontSize, label.x, label.y + ++row * space)
        item.data.shootDamage && drawEngine.drawText('Shoot: ' + item.data.shootDamage, fontSize, label.x, label.y + ++row * space)
        item.data.shootCoolDown && drawEngine.drawText('Cooldown: ' + item.data.shootCoolDown, fontSize, label.x, label.y + ++row * space)

        drawEngine.drawText('🎯', fontSize * 3, this.targetPoint.x, this.targetPoint.y + 30)
        // drawEngine.drawCircle(this.targetPoint, 50, {stroke: 'red', fill: 'transparent'}); 

      }

    })

    drawEngine.drawItems(this.gameObjects)




    if (inputKeyboard.isEscape) {
      gameStateMachine.setState(menuState);
    }
  }



  mouseDown() {
    if (!this.Active) return

    if (inputMouse.pointer.leftButton) {

      if (Vector.distance(this.targetPoint, inputMouse.pointer.Position) < 50) {
        this.targetPoint = inputMouse.pointer.Position.clone()
        this.targetPress = true
      }

    }
  };

  mouseMove() {
    if (!this.Active) return
    if (inputMouse.pointer.leftButton && this.targetPress) {
      this.targetPoint = inputMouse.pointer.Position.clone()
    }
  };

  mouseUp() {
    if (!this.Active) return
    this.buttons.forEach(button => button.mouseUpEvent(inputMouse.pointer.Position))

    this.theArcher?.shootTo(this.targetPoint)
    this.theArtillery?.shootTo(this.targetPoint)
    this.targetPress = false
  };

}




export const unitsState = new UnitsState();




