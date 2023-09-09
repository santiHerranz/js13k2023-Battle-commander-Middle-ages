import { Vector } from "@/core/vector";
import Unit from "./unit";

export function goToPosition(unit: Unit, position = new Vector(0, 0)) {

    let rotate = 0;
    let move = 0;
    let distanceToPoint = Vector.subtract(position, unit.Position);
    const dist = distanceToPoint.magnitude();
    if (dist > 1) {
        rotate = distanceToPoint.heading() - unit.Heading;
        move = unit.Radius// - Math.min(unit.Radius*2, 1/dist)
    }
    return {
        m: move,
        r: rotate,
        d: dist
    };
}

