import { configAnim } from "@/core/Animation";
import { PI } from "@/utils";

export var configSwordIdle: configAnim = {
    "s": [{ f: 0, r: -2.094, p: [0, 0] }, { f: 10, r: -2.094 - 0.045, p: [0, 0] }, { f: 20, r: -2.094, p: [0, 0] },],
};
export var configSwordAttack: configAnim = {
    "s": [{ f: 0, r: -PI - .5, p: [0, -20], }, { f: 4, r: -PI + 1.5, p: [0, 0], }, { f: 16, r: -PI + 1.6, p: [0, 0], },],
};

// export var configLanceIdle: configAnim = {
//     "s": [{ f: 0, r: -PI, p: [0, 0] }, { f: 10, r: -PI +.013, p: [0, 0] }, { f: 20, r: -PI, p: [0, 0] },],
// };
// export var configLanceAttack: configAnim = {
//     "s": [{ f: 0, r: PI/2, p: [0, -20], }, { f: 4, r: -PI + 1.5, p: [0, 0], }, { f: 30, r: -PI/2, p: [0, 0], },],
// };
