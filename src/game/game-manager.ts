import { gameState } from "@/game-states/game.state";
import Unit from "./unit";
import { EntityType } from "./EntityType";
import { CannonBall } from "./unit.cannonBall";
import { Vector } from "@/core/vector";
import { sound } from "@/core/sound";
import { Arrow } from "./unit.arrow";
import { Explosion } from "./unit.explosion";
import { drawEngine } from "@/core/draw-engine";
import { rand } from "@/utils";
import { SND_UNIT_DAMAGE } from "./game-sound";



// TODO - Special case for Artillery
// Enemy target designation
// Target only cluster enemies and avoid friend fire

export const enemyTargetDesignation = (units: Unit[]): void => {

  units
    .filter(f => f.attackCoolDownTimer.elapsed())
    .filter(f => f.targetPosition == undefined) // && f.targetNode == undefined
    .sort(() => Math.random() - .5)
    .slice(0, 100)
    .forEach((unit: Unit) => {

      let nearBy: Unit[] = units
        .filter((f: Unit) => { return f.Team != unit.Team; })
        .filter((h: Unit) => { return Vector.distance(unit.Position, h.Position) < unit.VisionRange; }) //
        .map((otherUnit: Unit) => ({ unit: otherUnit, distance: Vector.distance(unit.Position, otherUnit.Position) }))
        .sort((a: { unit: Unit; distance: number; }, b: { unit: Unit; distance: number; }) => a.distance - b.distance)
        .map((entry: { unit: Unit; distance: number; }) => entry.unit);


      // Artillery special target designator
      // the farest enemy into shoot range
      if (unit.type == EntityType.Artillery) {
        nearBy = units
          .filter((f: Unit) => { return f.Team != unit.Team; })
          .filter((h: Unit) => { return Vector.distance(unit.Position, h.Position) < unit.shootRange; }) //
          .map((otherUnit: Unit) => ({ unit: otherUnit, distance: Vector.distance(unit.Position, otherUnit.Position) }))
          .sort((a: { unit: Unit; distance: number; }, b: { unit: Unit; distance: number; }) => b.distance - a.distance)
          .map((entry: { unit: Unit; distance: number; }) => entry.unit);

      }


      if (nearBy.length > 0) {
        unit.targetPosition = nearBy[0].Position.clone();
        // forget target after a while
        setTimeout(() => {
          unit.targetPosition = undefined;
        }, rand(500, 800));
      }

      else
        unit.targetPosition = undefined;
    });
}




export const manageUnitsCollision = (units: Unit[], dt: number, damageGlobalFactor = 1) => {

  units.forEach((unit: Unit) => {
    // gravity
    //unit.Acceleration.add(new Vector(0,.5));

    // keep running
    // if (unit.Size < 30)
    // unit.Acceleration.add(unit.Velocity.normalize().scale(1.1));
    var unitNewPos = unit.Position.clone().add(unit.Velocity.clone().scale(1 / dt));

    // Check collisions with other units
    // Retrieve all objects that share nodes with the unit
    const candidates = gameState.collisionTree.retrieve(unit);

    candidates
      //.filter((f: Unit) => { return !f.dirty })
      .forEach((other: any) => {

        if (other instanceof CannonBall) return;

        if (other === unit) return;

        const minDist = (unit.Radius + other.Radius) / 2;

        var otherNewPos = other.Position.clone().add(other.Velocity.clone().scale(1 / 60));

        // Paso 1: Detectar colisión
        const dist = unitNewPos.distance(otherNewPos);

        if (dist == 0) return;

        if (dist > minDist) return;



        // var power = (Math.abs(unit.Velocity.x) + Math.abs(unit.Velocity.y)) +
        //   (Math.abs(other.Velocity.x) + Math.abs(other.Velocity.y));
        // power = power * 0.0482;

        // Paso 2: Calcular el vector de separación
        const separation = new Vector(unitNewPos.x - other.Position.x, unitNewPos.y - other.Position.y);
        const separationLength = separation.length();
        const overlap = unit.Radius + other.Radius - separationLength;


        // Paso 3: Mover los objetos para evitar solapamiento
        const separationCorrection = separation.scale(overlap / (2 * separationLength));

        if (other.type == EntityType.Testudo) {
          unit.Position.add(separationCorrection.scale(.3));

          unit.Velocity.scale(.5);
          unit.Acceleration.scale(0);
        } else {
          other.Position.subtract(separationCorrection.scale(.1));

          unit.Velocity.scale(.99);
          unit.Acceleration.scale(.99);
        }

        other.Velocity.scale(.99);
        other.Acceleration.scale(.99);


        // Damage manager

        // Attack unit damage
        if ([EntityType.Troop, EntityType.Testudo, EntityType.Archer, EntityType.Knight, EntityType.Artillery, EntityType.Cavalry].includes(other.type) && other.Team != unit.Team) {

          let obj = <Unit>other;

          // Damage if other is attacking
          if (obj._currentAnim == obj._attackAnim && unit.stuntTime.elapsed()) { // || obj.type == EntityType.Cavalry )    && obj._currentAnim._finished

            if (unit.armorPoints == 0)
              unit.healthPoints = Math.max(unit.healthPoints - obj.attackDamagePoints * damageGlobalFactor, 0);

            unit.armorPoints = Math.max(unit.armorPoints - obj.attackDamagePoints * damageGlobalFactor, 0);


            if (unit.healthPoints == 0) {
              obj.killCount++;
              unit.stuntTime.set(1)

              // if (units.length < 10)
              //   sound(SND_UNIT_KILLED);

            } else {
              unit.stuntTime.set(.2)

              if (units.length < 10)
                sound(SND_UNIT_DAMAGE);
            }

          }
        }

        // Enemy arrows damage and Explosion kill everyone
        else if ((other instanceof Arrow && other.Team != unit.Team) || other instanceof Explosion) {

          let obj = <Unit>other;


          // direct massive damage
          if (other instanceof Explosion) {

            unit.healthPoints = Math.max(unit.healthPoints - obj.attackDamagePoints * damageGlobalFactor, 0);

          } else {
            // armor first then health
            if (unit.armorPoints == 0)
              unit.healthPoints = Math.max(unit.healthPoints - obj.attackDamagePoints * damageGlobalFactor, 0);
            unit.armorPoints = Math.max(unit.armorPoints - obj.attackDamagePoints * damageGlobalFactor, 0);

            // arrow auto destroy
            other.healthPoints = 0;

          }


          unit.stuntTime.set(.2)


          if (unit.healthPoints == 0) {
            // sound(SND_UNIT_KILLED);

            if (obj.owner != undefined) {
              if (obj.owner.Team != unit.Team) {
                obj.scoreKill()
                obj.owner.killCount++;
              }



              else
                obj.owner.friendKillCount++;
            }

            else
              obj.killCount++;
          }

        }

      });

    unit.Velocity.add(unit.Acceleration);

    // Check collisions with edges of map
    if (unitNewPos.x + unit.Radius > drawEngine.canvasWidth || unitNewPos.x <= 0) {
      unit.Velocity.x *= -.95;
    }
    if (unitNewPos.y + unit.Radius > drawEngine.canvasHeight || unitNewPos.y <= 0) {
      unit.Velocity.y *= -.95;
    }

    // Keep inside edges of map
    //right
    if (unit.Position.x + unit.Size.x > drawEngine.canvasWidth) {
      unit.Position.add(new Vector(-unit.Size.x / 2, 0));
      unit.Velocity.scale(0);
    }
    // left
    if (unit.Position.x - unit.Size.x < 0) {
      unit.Position.add(new Vector(unit.Size.x / 2, 0));
      unit.Velocity.scale(0);
    }
    //bottom
    if (unit.Position.y + unit.Size.y > drawEngine.canvasHeight) {
      unit.Position.add(new Vector(0, -unit.Size.y / 2));
      unit.Velocity.scale(0);
    }
    // top
    if (unit.Position.y - unit.Size.y < 100) {
      unit.Position.add(new Vector(0, unit.Size.y / 2));
      unit.Velocity.scale(0);
    }



    unit.Position.add(unit.Velocity);

    // Apply Drag
    unit.Velocity.scale(0.95);

    // reset acceleration
    unit.Acceleration.scale(0);

    unit.LooktoRight = unit.Velocity.clone().normalize().x < 0;
  });
}
