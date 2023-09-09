import { EntityType, unitNames } from "./game/EntityType";
import { Vector } from './core/vector';
import { ButtonStateProp } from './core/button';
import { transparent } from "./index";




const allDataBase: UnitData[] = [];

export interface UnitData {
  type: number;
  name: string;

  cost: number;
  health: number;
  armor: number;
  speedFactor: number;

  // attack
  attackDamage: number;
  attackRangeFactor: number; // Radius * factor
  attackCoolDown: number;

  // shoot
  shootDamage?: number;
  shootRangeFactor?: number; // Radius * factor
  shootCoolDown?: number
}


export function createUnitsDatabase() {

  const shootDamageArcher = 30
  const shootDamageArtillery = 1000

  allDataBase.push({
    type: EntityType.Troop, name: unitNames[EntityType.Troop],
    cost: 100, health: 100, armor: 30, speedFactor: 1,
    attackCoolDown: .6, attackDamage: 30, attackRangeFactor: 2,
  });

  allDataBase.push({
    type: EntityType.Testudo, name: unitNames[EntityType.Testudo],
    cost: 80, health: 100, armor: 200, speedFactor: .1,
    attackCoolDown: 1, attackDamage: 20, attackRangeFactor: 1,
  });


  allDataBase.push({
    type: EntityType.Archer, name: unitNames[EntityType.Archer],
    cost: 120, health: 100, armor: 20, speedFactor: .2,
    attackCoolDown: 1, attackDamage: 30, attackRangeFactor: 12,
    shootDamage: shootDamageArcher, shootRangeFactor: 10, shootCoolDown: 1.2,
  });

  allDataBase.push({
    type: EntityType.Knight, name: unitNames[EntityType.Knight],
    cost: 250, health: 100, armor: 150, speedFactor: .8,
    attackCoolDown: 1, attackDamage: 80, attackRangeFactor: 3,
    shootRangeFactor: 0,
  });


  allDataBase.push({
    type: EntityType.Artillery, name: unitNames[EntityType.Artillery],
    cost: 1500, health: 100, armor: 40, speedFactor: .2,
    attackCoolDown: 1, attackDamage: 20, attackRangeFactor: 15,
    shootDamage: shootDamageArtillery, shootRangeFactor: 20, shootCoolDown: 2.5,
  });
  
  allDataBase.push({
    type: EntityType.Cavalry, name: unitNames[EntityType.Cavalry],
    cost: 1300, health: 100, armor: 180, speedFactor: 1.8,
    attackCoolDown: .5, attackDamage: 200, attackRangeFactor: 15,
  });
  
  allDataBase.push({
    type: EntityType.Arrow, name: "Arrow",
    cost: 0, health: 100, armor: 0, speedFactor: 0,
    attackCoolDown: 0,
    attackDamage: shootDamageArcher, attackRangeFactor: 0,
  });
  allDataBase.push({
    type: EntityType.CannonBall, name: "CannonBall",
    cost: 0, health: 100, armor: 0, speedFactor: 0,
    attackCoolDown: 0,
    attackDamage: 100,
    attackRangeFactor: 0,
  });
  allDataBase.push({
    type: EntityType.Explosion, name: "Explosion",
    cost: 0, health: 100, armor: 0, speedFactor: 0,
    attackDamage: shootDamageArtillery, attackRangeFactor: 0,
    attackCoolDown: 0,
  });



}



class GameDatabase {

  get unitsData() {
    return allDataBase.filter(f => ![EntityType.Arrow, EntityType.CannonBall, EntityType.Explosion].includes(f.type))
  }

  get data() {
    return allDataBase
  }

  getDataValues(type: number): UnitData {
    const element = allDataBase.find(f => f.type === type);

    return element || {
      type: EntityType.None, name: "", cost: 0, health: 0, armor: 0, attackDamage: 0, speedFactor: 0, shootCoolDown: 0, attackRangeFactor: 0, attackCoolDown: 0
    };
  }


  getUnitSize(type: EntityType): Vector {
    if (type == EntityType.Arrow)
    return new Vector(4, 4)
    if (type == EntityType.CannonBall)
    return new Vector(8, 8)

    return new Vector(20, 20)
  }


  getButtonStyle() {

    let style: ButtonStateProp = {
      text: '#ccc',
      color: transparent,
      lineWidth: 0,
      lineColor: transparent,
      fontSize: 60
    }

    let styleHover: ButtonStateProp = {
      text: 'white',
      color: 'rgb(150,150,150,.3)',
      lineWidth: 0,
      lineColor: transparent,
      fontSize: 60
    }
    return { style, styleHover }

  }

}



export const gameDatabase = new GameDatabase()
