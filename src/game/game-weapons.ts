import { Vector } from '@/core/vector';
import { Archer } from '@/game/unit.archer';
import { Arrow } from '@/game/unit.arrow';
import { CannonBall } from './unit.cannonBall';
import { Artillery } from './unit.artillery';
import { Explosion } from './unit.explosion';



export function createArrow(archer: Archer, velocity: Vector, targetPosition:Vector, sizeFactor: number = 1) {
  let arrow = new Arrow(archer.Position.clone().add(new Vector(1, 0).rotate(velocity.heading()).scale(archer.Radius / 2)), sizeFactor, archer.Team, archer.attackRange, archer, targetPosition);
  arrow.Acceleration = velocity;
  arrow._z = 1;
  arrow._zv = 4;
  return arrow;
}

export function createCannonBall(artillery: Artillery, velocity: Vector, targetPosition: Vector, heigth:number, sizeFactor: number = 1): CannonBall {

  let cannonBall = new CannonBall(artillery.Position.clone().add(new Vector(1, 0).rotate(velocity.heading()).scale(artillery.Radius / 2)), sizeFactor, artillery.Team, artillery, targetPosition, heigth);

  cannonBall.Acceleration = velocity;
  cannonBall._z = 1;
  cannonBall._zv = 0;

  cannonBall.explode = (position: Vector) => {
    let explosion = new Explosion(position, sizeFactor, artillery.Team, 50*1/sizeFactor, artillery);
    explosion.Mass = 1000
    cannonBall.explodeHandler(explosion)
  }

  return cannonBall;
}


