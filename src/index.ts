import { drawEngine } from './core/draw-engine';
import { menuState } from './game-states/menu.state';
import { createGameStateMachine, gameStateMachine } from './game-state-machine';
import { inputKeyboard } from '@/core/input-keyboard';
import { Timer } from './utils';
import { createUnitsDatabase } from './game-database';
import { summaryState } from './game-states/summary.state';
import { unitsState } from './game-states/units.state';

// export const debug = {
//   showQuadtree: false,
//   showObjectInfo: false,
//   showUnitInfo: false,
//   showUnitTextInfo: false,
//   showCommandPathInfo: true,
//   disableFogofwar: false,
//   showButtonBounds: false
// }

export var time = 0;
const FPS = 60;
export var frame = 0;

export let appSprite: HTMLImageElement

let previousTime = 0;
const interval = 1000 / FPS;

export const soundWaitTime: Timer = new Timer(0)

export const transparent: string = 'transparent' //rgba(0,0,0,0)

 //const imageData = './sprite.png';
 const imageData = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGAAAAAgCAMAAADaHo1mAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAhUExURf8AAO7DmgAAAM3NzUs8GktpL4pvMIGBgTw8PD4+PgAAAHbVe90AAAALdFJOU/////////////8ASk8B8gAAAAlwSFlzAAAOvwAADr8BOAVTJAAAAYBJREFUSEu9kotSwzAMBKkJL///B+OTVrbsPkggZWdaJSd8y6R5qSfyYnADpwm83CBxjgjWf26CcoPI2CmwQ+vZhPV2CI39guuzCdtdOqRityAgWGgLug1ScZrgcimlqFyDVEwHHlWI++sdAjvskCy8dggy9oRcoKFo23xj3w3KDaIZ2hsEmfknuCGgGTyboBsIBxQHirZGG1nAtuFhhuaAtMO5oCXql2EI2BkeZtRaSv+QdjgHSlRfShLcewvgB0F9m4j+sj1VsJX2SQK9X244LqC4Y/1GFgw8zBwTUC4QUBx4mHkgUA3FjhUHRwQJUkFR411wLWx1U+DZBMVAKHqTC/zK8CWCq7dg5WOCUFiTFf5NMCuIRBQ1PoVfCt8joLjj6YBHMyB3aJwF7M4UzLC7KfAs0x4LzQZpQOWC7+I3qPqFgukhGw8F9PkY+HISxLSLlSj+f0HU+bffxk0S2CsQUxcrkdvMfxBdTB/cnC4Y1Ywh+D0hZKY7bZ8p+Kq11m+Xf1ayHeIGzQAAAABJRU5ErkJggg=='


const runApp = async (image: HTMLImageElement) => {

  appSprite = image;

  createUnitsDatabase();

  createGameStateMachine(menuState);
  // createGameStateMachine(unitsState);
  // createGameStateMachine(summaryState);

  (function draw(currentTime: number) {


    frame += 1
    time = frame / FPS;

    const delta = currentTime - previousTime;

    if (delta >= interval) {
      previousTime = currentTime - (delta % interval);

      inputKeyboard.queryController();
      drawEngine.context.clearRect(0, 0, drawEngine.canvasWidth, drawEngine.canvasHeight);
      // Although the game is currently set at 60fps, the state machine accepts a time passed to onUpdate
      // If you'd like to unlock the framerate, you can instead use an interval passed to onUpdate to 
      // adjust your physics so they are consistent across all frame rates.
      // If you do not limit your fps or account for the interval your game will be far too fast or far too 
      // slow for anyone with a different refresh rate than you.
      gameStateMachine.getState().onUpdate(delta);
    }
    requestAnimationFrame(draw);
  })(0);

}

const loadImage = async (url: string) => {
  const image = new Image()
  image.src = url
  return new Promise<HTMLImageElement>((resolve) => {
    image.onload = () => resolve(image)
  })
}


loadImage(imageData).then(runApp)






