import { drawEngine } from "./draw-engine";
import { Pointer } from "./pointer";
import { Vector } from "./vector";


class InputMouse {

  public lastX: number = 0;
  public lastY: number = 0;


  // public dragStart: Vector | undefined
  // public camDragged: boolean = false;

  // private zoomValue: number = 2 * 800;


  public pointer: Pointer = new Pointer();


  public eventMouseDown = () => { }  // for binding
  public eventMouseMove = () => { }  // for binding
  public eventMouseUp = () => { }    // for binding
  // public eventMouseDrag = (dragged: Vector) => { }    // for binding
  public eventMouseScroll = () => { } // for binding
  public eventContextmenu = () => { } // for binding
  // public clickAction = (position:Vector) => { }// for binding

  constructor() {

    const canvas = document.getElementById('c2d')

    if (canvas) {
      canvas.addEventListener('mousedown', this.handleMouseDown, false);
      canvas.addEventListener('mousemove', this.handleMouseMove, false);
      canvas.addEventListener('mouseup', this.handleMouseUp, false);
      canvas.addEventListener('DOMMouseScroll', this.handleScroll, false);
      canvas.addEventListener('mousewheel', this.handleScroll, false); // chrome    
      canvas.addEventListener("contextmenu", this.handleContextmenu, false);

    }

  }

  // setZoomValue(factor: number) {
  //   this.zoomValue /= factor
  // }



  private getMousePosition = (evt: any) => {

    var rect = c2d.getBoundingClientRect();

    this.lastX = (evt.clientX - rect.left)/ c2d.offsetWidth * 1920
    this.lastY = (evt.clientY- rect.top) / (c2d.offsetWidth/(1920/1080)) * 1080  
    
    this.pointer.Position = new Vector(this.lastX, this.lastY)

    
  }

  handleMouseDown = (evt: any) => {

    if (!e) var e: Event | any = window.event;

    if (e.which) this.pointer.leftButton = (e.which == 1);
    else if (e.button) this.pointer.leftButton = (e.button == 0);

    // if (e.which) this.pointer.middleButton = (e.which == 2);
    // else if (e.button) this.pointer.middleButton = (e.button == 1);

    if (e.which) this.pointer.rigthButton = (e.which == 3);
    else if (e.button) this.pointer.rigthButton = (e.button == 1);


    this.getMousePosition(evt)

    this.pointer.Position = new Vector(this.lastX, this.lastY)

    // if (this.pointer.middleButton) {
    //   this.dragStart = new Vector(this.lastX, this.lastY);
    //   this.camDragged = false;
    // }

    // // https://stackoverflow.com/questions/21842814/mouse-position-to-isometric-tile-including-height
    // if (this.mouseLeftPressed) {
    //     this.playerDragStart = { x: this.lastX, y: this.lastY };
    //     this.playerDragged = false;
    // }

    // this.updateWorldCursorPosition();

    // this.clickAction(this.pointer.Position)

    this.eventMouseDown();
  }

  handleMouseMove = (evt: any) => {


    this.getMousePosition(evt)

    // if (this.pointer.middleButton) {
    //   this.camDragged = true;
    //   if (this.dragStart) {
    //     let start = new Vector(this.dragStart.x, this.dragStart.y)
    //     let last = new Vector(this.lastX, this.lastY)
    //     // this._scene._cam._move((start.x - last.x) * this._scene._cam._distance / (2 * 800), (start.y - last.y) * this._scene._cam._distance / (2 * 800))

    //     this.eventMouseDrag(new Vector((start.x - last.x), (start.y - last.y)));

    //     this.dragStart = new Vector(this.lastX, this.lastY);
    //   }

    // }

    // this.updateWorldCursorPosition();



    this.eventMouseMove();


    return evt.preventDefault() && false;
  }

  handleMouseUp = (evt: any) => {

    this.getMousePosition(evt)

    if (!e) var e: Event | any = window.event;

    // if (e.which) this.pointer.middleButton = (e.which == 2);
    // else if (e.button) this.pointer.middleButton = (e.button == 1);

    // if (this.pointer.middleButton) {
    //   this.dragStart = undefined;
    //   this.pointer.middleButton = false;

    // }

    // this.updateWorldCursorPosition();


    this.pointer.leftButton = false;
    // this.pointer.middleButton = false;
    this.pointer.rigthButton = false;

    // this.clickAction(new Vector(this.lastX,this.lastY))

    this.eventMouseUp();

    return evt.preventDefault() && false;
  }

  handleContextmenu = (evt: any) => {
    this.eventContextmenu();
    return evt.preventDefault() && false;
  }

  handleScroll = (evt: any) => {
    var delta = evt.wheelDelta ? evt.wheelDelta / 40 : evt.detail ? -evt.detail : 0;
    if (delta) {
      this.eventMouseScroll();
    }
    return evt.preventDefault() && false;
  };


}

export const inputMouse = new InputMouse();
