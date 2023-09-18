import { State } from '@/core/state';
import { drawEngine } from '@/core/draw-engine';
import { gameStateMachine } from '@/game-state-machine';
import { campaingState } from './campaign.state';
import { inputMouse } from '@/core/input-mouse';
import { Button } from '@/core/button';
import { GameMode, gameState } from './game.state';
import { unitsState } from './units.state';
import { Vector } from '@/core/vector';
import { GameMap, themeDef, themeCollection } from '@/game/game-map';
import { randInt } from '@/utils';
import { time } from '@/index';

class MenuState implements State {
  Active: boolean = false;

  buttons: Button[] = [];
  count: number = 0

  // Map
  gameMap: GameMap
  defMapDim: Vector
  defTileSize: Vector
  seed: number = Math.random() //.601 // 



  constructor() {
    this.defTileSize = new Vector(40 / 2, 44 / 2)
    this.defMapDim = new Vector(48 * 2, 25 * 2)

    this.gameMap = new GameMap(this.defMapDim, this.defTileSize, this.seed, themeDef.forest);

  }

  get posY() {
    return 500 + this.count++ * 100
  }

  onEnter() {

    // setTimeout(() => {
    //   gameState.init(3)
    //   gameStateMachine.setState(gameState);
    // }, 1000)

    this.buttons = []
    this.count = 0
    let btn

    const refX = drawEngine.canvasWidth / 2;

    let options = [0, GameMode.easy, GameMode.medium, GameMode.hard]

    btn = new Button(refX + 450, this.posY, 300, 80, ['', 'Easy', 'Medium', 'Hard'][gameState.gameMode]);
    btn.clickCB = (button) => {
      let next = gameState.gameMode + 1
      if (next >= options.length) next = GameMode.easy
      gameState.gameMode = next
      button.text = ['', 'Easy', 'Medium', 'Hard'][next]
    };
    this.buttons.push(btn);

    this.count--

    btn = new Button(refX, this.posY, 500, 80, "Play");
    btn.clickCB = () => {
      gameStateMachine.setState(gameState);
      gameState.init(campaingState.levelUnlock - 1) // param with index value
    };
    this.buttons.push(btn);

    btn = new Button(refX, this.posY, 500, 80, "Army");
    btn.clickCB = () => {
      gameStateMachine.setState(unitsState);
    };
    this.buttons.push(btn);

    btn = new Button(refX, this.posY, 500, 80, "Campaign");
    btn.clickCB = () => {
      gameStateMachine.setState(campaingState);
    };
    this.buttons.push(btn);


    btn = new Button(refX, this.posY, 500, 80, "Fullscreen");
    btn.clickCB = () => {
      this.toggleFullscreen();
    };
    this.buttons.push(btn);




    Button.setHover(this.buttons)



    inputMouse.eventMouseDown = () => this.mouseDown()
  }

  onLeave() {
    this.buttons = []
    inputMouse.eventMouseDown = () => { }
  }

  onUpdate(dt: number) {

    if (time % 5 == 0) {

      let n
      do { n = randInt(0, themeCollection.length) }
      while (n == this.gameMap.theme)

      this.gameMap.theme = n

      this.gameMap.seed = Math.random()
      this.gameMap.Init()
    }

    this.gameMap.drawTileMap(drawEngine.context)

    const xCenter = drawEngine.context.canvas.width / 2;
    drawEngine.drawText('Battle commander', 150, xCenter, 250);
    drawEngine.drawText('Middle Ages', 60, xCenter, 350);


    // drawEngine.drawText('Score points when your army cost is lower than the enemy', 40, xCenter, 500);

    // drawEngine.drawText('Menu', 80, xCenter, 400);

    this.buttons.forEach((button: Button) => {
      button._update(dt)
      button._draw(drawEngine.context)
    })


    drawEngine.drawText('@santiHerranz', 30, drawEngine.canvasWidth * .9, drawEngine.canvasHeight * .9, '#aaa')
    drawEngine.drawText('for JS13K 2023', 30, drawEngine.canvasWidth * .9, drawEngine.canvasHeight * .93, '#fff')


  }

  toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }

  mouseDown() {
    if (inputMouse.pointer.leftButton) {
      this.buttons.forEach(button => button.mouseUpEvent(inputMouse.pointer.Position))
    }
  };
}

export const menuState = new MenuState();
