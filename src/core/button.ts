import { transparent } from "@/index";
import { drawEngine } from "./draw-engine";
import { inputMouse } from "./input-mouse";
import { Vector } from "./vector";
import { gameDatabase } from "@/game-database";
import { SND_BTN_CLICK, SND_BTN_HOVER } from "@/game/game-sound";
import { sound } from "./sound";
import Unit from "@/game/unit";


export interface ButtonStateProp {
  lineColor: string;
  text: string;
  color: string;
  lineWidth: number;
  fontSize: number;
}

interface ButtonColors {
  default: ButtonStateProp;
  hover: ButtonStateProp;
  active: ButtonStateProp;
  disabled: ButtonStateProp;
}


export class Button {


  Position: Vector;
  Size: Vector;
  // image: any;
  unit: Unit | undefined;

  name: string;
  width: any;
  height: any;
  text: string;
  title: string;
  data: string;

  colors: ButtonColors;

  state: string;
  visible: boolean = true;
  enabled: boolean = true;
  selected: boolean = false;


  clickCB: (button: Button) => void;

  hoverEvent: () => void;
  hoverOutEvent: () => void;
  clickEvent: () => void;



  constructor(x: number, y: number, w: number, h: number, text = "", title = "", fontSize: number = 50, colors: ButtonColors = {
    'default': {
      text: '#ccc',
      color: transparent,
      lineWidth: 0,
      lineColor: transparent,
      fontSize: fontSize
    },
    'hover': {
      text: '#fff',
      color: 'rgb(150,150,150,.3)',
      lineWidth: 0,
      lineColor: '#ccc',
      fontSize: fontSize
    },
    'active': {
      text: '#fff',
      color: 'rgb(200,200,200,.3)',
      lineWidth: 0,
      lineColor: '#ccc',
      fontSize: fontSize
    },
    'disabled': {
      text: '#fff',
      color: '#ababab',
      lineWidth: 0,
      lineColor: '#ccc',
      fontSize: fontSize
    }
  }) {

    this.Position = new Vector(x, y)
    this.Size = new Vector(w, h)

    this.name = ''

    this.width = w;
    this.height = h;
    this.text = text;
    this.title = title
    this.data = ''
    this.clickCB = () => { };
    this.colors = colors;

    this.state = 'default'; // current button state



    this.hoverEvent = () => {
    }
    this.hoverOutEvent = () => {
    }
    this.clickEvent = () => {
    }
  }



  _update(dt: number) {

    if (!this.visible) return;

    if (!inputMouse.pointer) return;

    let mousePosition = inputMouse.pointer.Position

    let localX = this.Position.x - this.width / 2; //
    let localY = this.Position.y - this.height / 2;

    // check for hover
    if (mousePosition.x >= localX && mousePosition.x <= localX + this.width &&
      mousePosition.y >= localY && mousePosition.y <= localY + this.height) { //  - rect.top

      if (this.enabled) {

        if (this.state != 'active' && this.state != 'hover') {
          this.hoverEvent();
          this.state = 'hover';
        }


        // check for click
        if (this.state != 'active' && inputMouse.pointer.leftButton) {
          this.state = 'active';
        }
      }


    }
    else {
      if (this.state != 'active' && this.state == 'hover') {
        this.hoverOutEvent();
      }

      this.state = 'default';
    }

  }



  _draw(ctx: CanvasRenderingContext2D) {

    if (!this.visible)
      return;

    var props = this.colors[this.state as keyof ButtonColors];

    ctx.save();
    ctx.translate(this.Position.x, this.Position.y);

    ctx.save();

    if (this.enabled && (this.state == 'hover' || this.state == 'active')) {
      ctx.scale(1.05, 1.05);
    }

    if (!this.enabled)
    ctx.globalAlpha = .2


    ctx.strokeStyle = props.lineColor
    ctx.lineWidth = props.lineWidth;
    ctx.fillStyle = props.color
    ctx.beginPath();

    // FIX: roundRect Build error Uncaught TypeError: a.ua is not a function
    // ctx.roundRect(0 - this.width / 2, 0 - this.height / 2, this.width, this.height, 8);
    ctx.rect(0 - this.width / 2, 0 - this.height / 2, this.width, this.height);

    // ctx.stroke();///// BUG!!
    ctx.fill();

    if (this.selected){
      ctx.lineWidth = 2
      ctx.strokeStyle = '#ccc'
      ctx.stroke(); 
    }

    // text inside
    drawEngine.drawText(this.text, props.fontSize, 0, 0 + this.height / 4, props.text)

    if (this.unit)
      this.unit.draw(ctx)

    // text outside
    if (this.enabled)
    drawEngine.drawText(this.data, props.fontSize * .5, 0, 0 + this.height, props.text)

    // if (this.image)
    //   drawEngine.drawImage(this.image, 0 - this.width / 2, 0 - this.height / 2)


      ctx.globalAlpha = 1


    ctx.restore();

    // Help text
    if (this.state == 'hover') {

      // ctx.textAlign = "left";
      // ctx.lineWidth = props.lineWidth; 

      // var size = ctx.measureText(this.state);
      // ctx.strokeStyle = 'black';
      // const offset = this.height + this.data.length > 0?this.height*1.5:this.height/2
      // ctx.strokeText(this.title, 0 - size.width / 2, offset );
      // ctx.fillStyle = 'white';
      // ctx.fillText(this.title, 0 - size.width / 2, offset  );

      drawEngine.drawText(this.title, props.fontSize * .5, 0, this.data.length > 0?this.height*1.8:this.height , props.text)

    }
    ctx.restore();


    // if (debug.showButtonBounds) {
    //   ctx.beginPath()
    //   ctx.strokeStyle = 'red'
    //   ctx.rect(this.Position.x - this.width / 2, this.Position.y - this.height / 2, this.width, this.height);
    //   ctx.stroke()
    // }

  }



  mouseUpEvent(mousePosition: Vector) {

    if (!this.visible) // || (this.parent && !this.parent.visible)
      return;

    if (!this.enabled)
      return;

    let localX = this.Position.x - this.width / 2;
    let localY = this.Position.y - this.height / 2;

    // check for click
    if (mousePosition.x >= localX && mousePosition.x <= localX + this.width &&
      mousePosition.y >= localY && mousePosition.y <= localY + this.height) { //  - rect.top

      this.clickEvent();

      if (typeof this.clickCB === 'function') {
        this.clickCB(this);
      }

      this.state = 'default'
    }
  }






  static setHover(buttons: Button[]) {

    let { style, styleHover } = gameDatabase.getButtonStyle()

    buttons.forEach(btn => {
      btn.colors.default = style
      btn.colors.hover = styleHover

      btn.hoverEvent = () => {
        sound(SND_BTN_HOVER)
      }
      btn.clickEvent = () => {
        sound(SND_BTN_CLICK)
      }
    })
  }

}

