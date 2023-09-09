

export const getTeamColor = (team: number) => ['', 'red', 'blue'][team]

export const enum Team {
  Alpha = 1,
  Bravo = 2
}

// export const enum GameMode {
//   defend = 1,
//   attack = 2,
//   allAttack = 3,
// }

export const enum EntityType {
  None = -1,
    Troop = 0,
    Testudo = 1,
    Archer = 2,
    Knight = 3,
    Artillery = 4,
    Cavalry = 5,
    Arrow = 6,
    CannonBall = 7,
    Explosion = 8,
};

export const enum Army {
    Troop,
    Testudo,
    Archer,
    Knight,
    Artillery,
    Cavalry
};


export const unitTypes = [
  EntityType.Troop,       // Note: Troop is 0 index, so keep order
  EntityType.Testudo,
  EntityType.Archer,
  EntityType.Knight,
  EntityType.Artillery,
  EntityType.Cavalry
];

export const unitNames = [
  'Troop',
  'Testudo',
  'Archer',
  'Knight',
  'Artillery',
  'Cavalry'
];




