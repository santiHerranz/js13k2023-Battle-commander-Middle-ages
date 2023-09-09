
// interface CanvasRenderingContext2D {
//     fs: any; // fillStyle
//     ss: any; // strokeStyle
//     tr: any; // translate
//     fr: any; // fillRect
//     ft: any; // fillText
//     bp: any; // beginPath
//     mt: any; // moveTo
//     lt: any; // lineTo
//     cp: any; // closePath
//     s: () => void;  // save
//     r: any;  // restore
//     st: any; // strokeText
//     ta: any; // textAlign center and textBaseline middle
//     rot: any;  // rotate
//     lw: any;  // lineWidth
//     rr: any;  // RoundRect
// }
// const cp = CanvasRenderingContext2D.prototype;

// cp.mt = function (x: number, y: number) {
//     this.moveTo(x, y);
// };
// cp.lt = function (x: number, y: number) {
//     this.lineTo(x, y);
// };
// cp.tr = function (x: number, y: number) {
//     this.translate(x, y);
// };
// cp.fr = function (a: number, b: number, c: number, d: number) {
//     this.fillRect(a, b, c, d);
// };
// cp.s = function () {
//     this.save();
// };
// cp.r = function () {
//     this.restore();
// };
// cp.bp = function () {
//     this.beginPath();
// };
// cp.cp = function () {
//     this.closePath();
// };
// cp.fs = function (x: string) {
//     this.fillStyle = x; 
// };
// cp.ss = function (x: string) {
//     this.strokeStyle = x; 
    
// };
// cp.ft = function (text: string, x: number, y: number, maxWidth?: number) {
//     this.fillText(text, x, y);
// };

// cp.st = function (text: string, x: number, y: number, fontSize: number = 20, fontName: string = "monospace", fontColor: string = "#fff", borderColor: string = "#000") {
//     this.miterLimit = 2;
//     this.font = fontSize + "px " + fontName;
//     this.ss(borderColor)
//     this.lineWidth = 4
//     this.strokeText(text, x, y);
//     this.fs(fontColor)
//     this.ft(text, x, y);
// }
// cp.ta = function () {
//     this.textAlign = "center";
//     this.textBaseline = "middle";
// };

// cp.rot = function (value: number) {
//     this.rotate(value);
// };

// cp.lw = function (value: number) {
//     this.lineWidth = value;
// };


// cp.rr = function (x: number, y: number, w: number, h: number, r: number) {
// 	if (w < 2 * r) r = w / 2;
// 	if (h < 2 * r) r = h / 2;
// 	this.bp();
// 	this.mt(x + r, y);
// 	this.arcTo(x + w, y, x + w, y + h, r);
// 	this.arcTo(x + w, y + h, x, y + h, r);
// 	this.arcTo(x, y + h, x, y, r);
// 	this.arcTo(x, y, x + w, y, r);
// 	this.cp();
//     this.fill();
// 	return this;
//   }