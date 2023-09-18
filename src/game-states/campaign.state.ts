import { State } from '@/core/state';
import { drawEngine } from '@/core/draw-engine';
import { inputKeyboard } from '@/core/input-keyboard';
import { gameStateMachine } from '@/game-state-machine';
import { gameState } from './game.state';
import { menuState } from './menu.state';
import { inputMouse } from '@/core/input-mouse';
import { Button } from '@/core/button';
import { gameDatabase } from '@/game-database';
import { GameMap, themeDef } from '@/game/game-map';
import { Vector } from '@/core/vector';
import { LevelDefinition, gameLevel } from '@/game/game-level';
import { time } from '@/index';

class CampaignState implements State {
  Active: boolean = false;

  private _levelUnlock: number = 1;


  private maxCols = 4
  private btnWidth = 400
  private btnHeight = 110

  buttons: Button[] = [];
  count: number = 0
  col: number = 0
  row: number = 0


  campaing: LevelDefinition[];

  // Map
  gameMap: GameMap
  defMapDim: Vector
  defTileSize: Vector
  seed: number = Math.random() //.601 // 

  constructor() {
    this.defTileSize = new Vector(40 / 2, 44 / 2)
    this.defMapDim = new Vector(48 * 2, 25 * 2)
    this.gameMap = new GameMap(this.defMapDim, this.defTileSize, this.seed, themeDef.snow);

    this.campaing = [...gameLevel.level]
  }

  public get levelUnlock(): number {
    return this._levelUnlock;
  }
  public set levelUnlock(value: number) {
    this._levelUnlock = value;
  }


  get posX() {
    if (this.count % this.maxCols == 0) {
      this.row++
      this.col = 0
    } else this.col++

    return drawEngine.canvasWidth / 2 - (this.btnWidth * .8 * this.maxCols) / 2 + this.col * this.btnWidth * 1.1
  }

  get posY() {
    return drawEngine.canvasHeight / 2 - (this.btnHeight * 4) / 2 + this.row * 120
  }

  onEnter() {

    this.buttons = []
    this.count = 0
    this.row = 0

    this.createButonsCampaing();



    this.row++

    let btn = new Button(drawEngine.canvasWidth / 2, this.posY, 500, 80, "Back", "");
    btn.clickCB = () => {
      gameStateMachine.setState(menuState);
    };
    this.buttons.push(btn);

    Button.setHover([btn])


    btn = new Button(drawEngine.canvasWidth * .95, drawEngine.canvasHeight * .90, 60, 60, '🎲', "Cheat", 40);
    btn.clickEvent = () => {
      gameLevel.levelIndex += 1
      campaingState.levelUnlock = (gameState.level.levelIndex) + 1
      this.onEnter()
    };
    this.buttons.push(btn);


    inputMouse.eventMouseDown = () => this.mouseDown()
  }

  private createButonsCampaing() {
    this.count = 0
    this.buttons = []

    let { style, styleHover } = gameDatabase.getButtonStyle()


    this.campaing.forEach((item, index) => {
      const btn = new Button(this.posX, this.posY, this.btnWidth, this.btnHeight, (index + 1) + '', "", 10,); // ''+ (1+index)

      if ((index + 1) > this.levelUnlock) {
        btn.enabled = false;
        style.color = 'rgb(0,0,150,.8)' // Team.Bravo
        styleHover.color = 'rgb(0,0,150,.8)' // Team.Bravo
      } else {
        Button.setHover([btn])
        style.color = 'rgb(150,0,0,.8)' // Team.Bravo
        styleHover.color = 'rgb(150,0,0,.8)' // Team.Bravo
      }

      btn.colors.default = JSON.parse(JSON.stringify(style))
      btn.colors.hover = JSON.parse(JSON.stringify(styleHover))

      btn.clickCB = () => {
        gameStateMachine.setState(gameState);
        gameState.init(index)
      };



      if (index == gameLevel.finalLevelIndex) {
        btn.Position.x = drawEngine.canvasWidth / 2
        // style.color = '#cc0' // Team.Bravo
        // styleHover.color = '#cc0' // Team.Bravo
        // btn.colors.default = JSON.parse(JSON.stringify(style))
        // btn.colors.hover = JSON.parse(JSON.stringify(styleHover))
      }

      this.buttons.push(btn);
      this.count++;




    });

  }

  onLeave() {
    this.buttons = []
    this.count = 0
    this.row = 0
    inputMouse.eventMouseDown = () => { }
  }


  onUpdate(dt: number) {



    this.gameMap.drawTileMap(drawEngine.context)

    const xCenter = drawEngine.context.canvas.width / 2;
    drawEngine.drawText('Levels', 80, xCenter, 300);

    this.buttons.forEach((button: Button, index) => {

      // if (index == gameLevel.finalBossIndex && button.enabled) button.text = "Final boss"

      button._update(dt)
      button._draw(drawEngine.context)

      if (!button.enabled) {
        drawEngine.drawText('🔒', 70, button.Position.x, button.Position.y + 22);
      }

      else if (gameLevel.level[index]) {
        if (gameLevel.level[index].stars > 0) {
          drawEngine.drawText(Array(gameLevel.level[index].stars).fill('⭐').join(''), 30, button.Position.x + button.Size.x * .3, button.Position.y + 12);
        }
        if (gameLevel.level[index].highScore > 0) {
          drawEngine.drawText('Highdcore:', 25, button.Position.x - button.Size.x * .3, button.Position.y - button.Size.y * .25);
          drawEngine.drawText('' + gameLevel.level[index].highScore, 35, button.Position.x - button.Size.x * .3, button.Position.y + 12);
        }

      }      


    })

    if (inputKeyboard.isEscape) {
      gameStateMachine.setState(menuState);
    }
  }

  mouseDown() {
    if (inputMouse.pointer.leftButton) {
      this.buttons.forEach(button => button.mouseUpEvent(inputMouse.pointer.Position))
    }
  };
}

export const campaingState = new CampaignState();
