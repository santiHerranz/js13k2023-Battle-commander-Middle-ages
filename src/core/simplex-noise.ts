/**
 * https://github.com/spissvinkel/simplex-noise-ts
 * */


/**
 * A function returning a pseudo-random floating-point number in the interval [0, 1)
 */
export type PRNG = () => number;

/**
 * A simplex noise generator
 */
export interface SimplexNoise {
    noise2D: (x: number, y: number) => number;
}

/**
 * Initialize a new simplex noise generator using the provided PRNG
 *
 * @param random a PRNG function like `Math.random` or `AleaPRNG.random`
 * @returns an initialized simplex noise generator
 */
export const mkSimplexNoise = (random: PRNG): SimplexNoise => {
    const tables = buildPermutationTables(random);
    return {
        noise2D: (x, y) => noise2D(tables, x, y),
    };
};

// 2D simplex noise
/** @internal */
const noise2D = (tables: PermTables, x: number, y: number): number => {
    const { perm, permMod12 } = tables;
    // Noise contributions from the three corners
    let n0 = 0.0, n1 = 0.0, n2 = 0.0;
    // Skew the input space to determine which simplex cell we're in
    var s = (x + y) * F2; // Hairy factor for 2D
    var i = Math.floor(x + s);
    var j = Math.floor(y + s);
    var t = (i + j) * G2;
    // Unskew the cell origin back to (x, y) space
    const x00 = i - t;
    const y00 = j - t;
    // The x, y distances from the cell origin
    const x0 = x - x00;
    const y0 = y - y00;
    // For the 2D case, the simplex shape is an equilateral triangle.
    // Determine which simplex we are in.
    // Offsets for second (middle) corner of simplex in (i, j) coords
    // lower triangle, XY order (0, 0) -> (1, 0) -> (1, 1) - or upper triangle, YX order (0, 0) -> (0, 1) -> (1, 1)
    const i1 = x0 > y0 ? 1 : 0;
    const j1 = x0 > y0 ? 0 : 1;
    // A step of (1, 0) in (i, j) means a step of (1-c,  -c) in (x, y), and
    // a step of (0, 1) in (i, j) means a step of ( -c, 1-c) in (x, y), where
    // c = (3 - sqrt(3)) / 6
    // Offsets for middle corner in (x, y) unskewed coords
    const x1 = x0 - i1 + G2;
    const y1 = y0 - j1 + G2;
    // Offsets for last corner in (x, y) unskewed coords
    const x2 = x0 - 1.0 + 2.0 * G2;
    const y2 = y0 - 1.0 + 2.0 * G2;
    // Work out the hashed gradient indices of the three simplex corners
    const ii = i & 255;
    const jj = j & 255;
    // Calculate the contribution from the three corners
    let t0 = 0.5 - x0 * x0 - y0 * y0;
    if (t0 >= 0) {
        const gi0 = permMod12[ii + perm[jj]] * 3;
        t0 *= t0;
        // (x, y) of GRAD3 used for 2D gradient
        n0 = t0 * t0 * (GRAD3[gi0] * x0 + GRAD3[gi0 + 1] * y0);
    }
    let t1 = 0.5 - x1 * x1 - y1 * y1;
    if (t1 >= 0) {
        const gi1 = permMod12[ii + i1 + perm[jj + j1]] * 3;
        t1 *= t1;
        n1 = t1 * t1 * (GRAD3[gi1] * x1 + GRAD3[gi1 + 1] * y1);
    }
    let t2 = 0.5 - x2 * x2 - y2 * y2;
    if (t2 >= 0) {
        const gi2 = permMod12[ii + 1 + perm[jj + 1]] * 3;
        t2 *= t2;
        n2 = t2 * t2 * (GRAD3[gi2] * x2 + GRAD3[gi2 + 1] * y2);
    }
    // Add contributions from each corner to get the final noise value.
    // The result is scaled to return values in the interval [-1, 1].
    return 70.0 * (n0 + n1 + n2);
};


/** @internal */
interface PermTables {
    perm: Uint8Array;
    permMod12: Uint8Array;
}

/** @internal */
const buildPermutationTables = (random: PRNG): PermTables => {
    const perm = new Uint8Array(512);
    const permMod12 = new Uint8Array(512);
    const tmp = new Uint8Array(256);
    for (let i = 0; i < 256; i++) tmp[i] = i;
    for (let i = 0; i < 255; i++) {
        const r = i + ~~(random() * (256 - i));
        const v = tmp[r];
        tmp[r] = tmp[i];
        perm[i] = perm[i + 256] = v;
        permMod12[i] = permMod12[i + 256] = v % 12;
    }
    const v = tmp[255];
    perm[255] = perm[511] = v;
    permMod12[255] = permMod12[511] = v % 12;
    return { perm, permMod12 };
};

/** @internal */
const F2 = 0.5 * (Math.sqrt(3.0) - 1.0);
/** @internal */
const G2 = (3.0 - Math.sqrt(3.0)) / 6.0;

/** @internal */
const GRAD3 = new Float32Array([
     1,  1,  0,
    -1,  1,  0,
     1, -1,  0,
    -1, -1,  0,

     1,  0,  1,
    -1,  0,  1,
     1,  0, -1,
    -1,  0, -1,

     0,  1,  1,
     0, -1,  1,
     0,  1, -1,
     0, -1, -1
]);
