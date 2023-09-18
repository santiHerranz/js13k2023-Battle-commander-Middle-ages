import { State } from '@/core/state';
import { drawEngine } from '@/core/draw-engine';
import { gameStateMachine } from '@/game-state-machine';
import { gameState } from './game.state';
import { Button } from '@/core/button';
import { inputMouse } from '@/core/input-mouse';
import { menuState } from './menu.state';
import { inputKeyboard } from '@/core/input-keyboard';
import { GameMap } from '@/game/game-map';
import { Vector } from '@/core/vector';
import { campaingState } from './campaign.state';
import { gameLevel } from '@/game/game-level';
import { GameObject } from '@/game/game-object';
import { Label } from '@/game/label';
import { sound } from '@/core/sound';
import { SND_BATTLE_BEGIN, SND_DEATH, SND_HIGHSCORE, SND_STAR } from '@/game/game-sound';

export const enum GameResult {
  win = 1,
  loose = 2,
  tie = 3
}

export interface GameResultData {
  result: number;

  teamAlphaBeginCount: number
  teamBravoBeginCount: number

  teamAlphaEndCount: number
  teamBravoEndCount: number

  teamAlphaCost: number
  teamBravoCost: number

  kills: { alpha: number, bravo: number }

}

class SummaryState implements State {
  Active: boolean = false;


  results: string[] = ['', 'YOU WIN!', 'YOU LOOSE', 'TIE'];
  result: number = 0;
  data: GameResultData | undefined;

  // Map
  gameMap: GameMap
  defMapDim: Vector
  defTileSize: Vector
  seed: number = Math.random() //.601 // 

  newHighScore = false

  labels: GameObject[] = []
  score: number | undefined;
  time0: any;
  time1: any;
  time2: any;
  time3: any;
  btnEnd: Button | undefined;

  constructor() {
    this.defTileSize = new Vector(40 / 2, 44 / 2)
    this.defMapDim = new Vector(48 * 2, 25 * 2)
    this.gameMap = new GameMap(this.defMapDim, this.defTileSize, this.seed);

  }

  setGameResult(data: GameResultData) {
    this.data = data
    this.result = data.result
  }


  buttons: Button[] = [];
  count: number = 0

  get posY() {
    return 700 + this.count++ * 100
  }

  onEnter() {

    this.newHighScore = false

    // let score = this.data!.teamBravoCost - this.data!.teamAlphaCost
    //let score = this.data!.teamAlphaBeginCount + this.data!.teamAlphaEndCount
    this.score = this.data!.kills.alpha - this.data!.kills.bravo
    this.score = Math.max(0, this.score)


    this.createGameButtons();

    if (this.result == GameResult.win) {
      this.time0 = setTimeout(() => {
        this.getReward()
      }, 1000);
    } else if (this.result == GameResult.loose){
      sound(SND_DEATH)
    }

    inputMouse.eventMouseDown = () => this.mouseDown()

  }

  private createGameButtons() {

    this.buttons = [];
    this.count = 0;
    let btn;

    if (gameLevel.levelIndex < gameLevel.finalLevelIndex) {

      if (this.result == GameResult.win) {
        btn = new Button(drawEngine.canvasWidth / 2, this.posY - 50, 500, 80, "Next", "");
        btn.clickCB = () => {
          this.time0 && clearTimeout(this.time0)
          this.time1 && clearTimeout(this.time1)
          this.time2 && clearTimeout(this.time2)
          this.time3 && clearTimeout(this.time3)
          gameState.next();
          gameStateMachine.setState(gameState);
        };
        this.buttons.push(btn);
      }
    } else {
      this.btnEnd = new Button(drawEngine.canvasWidth / 2, this.posY - 50, 500, 80, "THE END");

      this.buttons.push(this.btnEnd);

    }



    btn = new Button(drawEngine.canvasWidth / 2, this.posY, 500, 80, "Try again", "");
    btn.clickCB = () => {
      gameStateMachine.setState(gameState);
      gameState.init(gameState.level.levelIndex);

    };
    this.buttons.push(btn);


    btn = new Button(drawEngine.canvasWidth / 2, this.posY, 500, 80, "Back to campaing", "");
    btn.clickCB = () => {
      gameStateMachine.setState(campaingState);
    };
    this.buttons.push(btn);

    Button.setHover(this.buttons)


    if (this.btnEnd) {
      this.btnEnd.clickEvent = () => {
        sound(SND_BATTLE_BEGIN)
      }
    } 

  }

  onLeave() {
    this.buttons = []
    inputMouse.eventMouseDown = () => { }
  }

  onUpdate(dt: number) {

    this.labels = this.labels.filter((f: GameObject) => { return f.Active });

    this.labels.forEach((item: GameObject) => {
      item._update(dt)
    })


    if (this.result == GameResult.win)
      this.gameMap.drawTileMap(drawEngine.context)


    const xCenter = drawEngine.context.canvas.width / 2;

    drawEngine.drawText('Level ' + (gameLevel.levelIndex + 1), 80, xCenter, 120);
    drawEngine.drawText('HighScore: ' + gameLevel.level[gameLevel.levelIndex].highScore, 40, xCenter, 180);

    // drawEngine.drawText(this.data?.teamAlphaBeginCount + ' vs ' + this.data?.teamBravoBeginCount, 40, xCenter, 220);

    if (this.score != undefined) {
      drawEngine.drawText('Red kills: ' + this.data?.kills.alpha, 50, xCenter - 200, 270, '#d00');
      drawEngine.drawText('Blue kills: ' + this.data?.kills.bravo, 50, xCenter + 200, 270, '#00d');

      drawEngine.drawText('Score: ' + this.score, 60, xCenter, 350);

    }



    if (this.result == GameResult.tie)
      drawEngine.drawText(this.results[this.result], 80, xCenter, 270);

    if (this.result == GameResult.win) {
      drawEngine.drawText('Level cleared! ', 80, xCenter, 450);
      drawEngine.drawText(Array(gameLevel.level[gameLevel.levelIndex].stars).fill('⭐').join(''), 80, xCenter, 530);

    }

    drawEngine.drawItems([...this.labels])

    // drawEngine.drawText(this.data?.teamAlphaEndCount + ' vs ' + this.data?.teamBravoEndCount, 40, xCenter, 420);


    // if (this.result == GameResult.win) {
    //   drawEngine.drawText("Gold in Bank: "+ gameState. playerBankGold +'$', 30, xCenter, 600);
    // }


    this.buttons.forEach((button: Button) => {
      button._update(dt)
      button._draw(drawEngine.context)
    })

    if (inputKeyboard.isEscape) {
      gameStateMachine.setState(menuState);
    }

  }


  getReward() {

    if(!this.score) return

    if (this.score > 0 && this.score > gameLevel.level[gameLevel.levelIndex].highScore) {
      gameLevel.level[gameLevel.levelIndex].highScore = this.score
      this.newHighScore = true
    }

    if (this.score > 0) {
      this.labels.push(new Label('+' + this.score, new Vector(drawEngine.canvasWidth / 2, drawEngine.canvasHeight / 2), new Vector(100, 100), 0))
    } else {
      this.labels.push(new Label('No score', new Vector(drawEngine.canvasWidth / 2, drawEngine.canvasHeight / 2), new Vector(100, 100), 0))
    }

    let t = 1000
    if (this.data!.teamAlphaEndCount > this.data!.teamAlphaBeginCount/8) {
      this.time1 = setTimeout(() => {
        sound(SND_STAR)
        this.labels.push(new Label('⭐', new Vector(drawEngine.canvasWidth / 2, drawEngine.canvasHeight / 2), new Vector(100, 100), 0))
        gameLevel.level[gameLevel.levelIndex].stars += 1
      }, t);
      t += 1000
    }

    if (this.data!.teamAlphaEndCount > this.data!.teamAlphaBeginCount / 4) {
      this.time2 = setTimeout(() => {
        sound(SND_STAR)
        this.labels.push(new Label('⭐', new Vector(drawEngine.canvasWidth / 2, drawEngine.canvasHeight / 2), new Vector(100, 100), 0))
        gameLevel.level[gameLevel.levelIndex].stars += 1
      }, t);
      t += 1000
    }


    if (this.newHighScore) {
      this.time3 = setTimeout(() => {
        sound(SND_HIGHSCORE)
        this.labels.push(new Label('🏆 new HighScore', new Vector(drawEngine.canvasWidth / 2, drawEngine.canvasHeight / 2), new Vector(40, 40), 0))
      }, t);
    }

  }


  mouseDown() {
    if (inputMouse.pointer.leftButton) {
      this.buttons.forEach(button => button.mouseUpEvent(inputMouse.pointer.Position))
    }
  };
}

export const summaryState = new SummaryState();
