import { rand } from "@/utils"


export class Vector {
    x: number
    y: number

    constructor(x: number, y: number) {
        this.x = x
        this.y = y
    }

    get key() {
        return this.x.toFixed(2) +','+ this.y.toFixed(2)
    }


    /**
     * Add the provided vector to this one
     */
    add(vec: Vector) {
        this.x += vec.x
        this.y += vec.y

        return this
    }

    /**
     * Subtract the provided vector from this one
     */
    subtract(vec: Vector) {
        this.x -= vec.x
        this.y -= vec.y

        return this
    }

    /**
     * Check if the provided vector equal to this one
     */
    equals(vec: Vector) {
        return vec.x === this.x && vec.y === this.y
    }

    /**
     * Multiply this vector by the provided vector
     */
    multiplyByVector(vec: Vector) {
        this.x *= vec.x
        this.y *= vec.y

        return this
    }

    /**
     * Multiply this vector by the provided vector
     */
    mulV(vec: Vector) {
        return this.multiplyByVector(vec)
    }

    /**
     * Divide this vector by the provided vector
     */
    divideByVector(vec: Vector) {
        this.x /= vec.x
        this.y /= vec.y
        return this
    }

    /**
     * Divide this vector by the provided vector
     */
    divV(v: Vector) {
        return this.divideByVector(v)
    }

    /**
     * Multiply this vector by the provided number
     */
    multiplyByScalar(n: number) {
        this.x *= n
        this.y *= n

        return this
    }

        /**
     * Multiply this vector by the provided number
     */
        scale(n: number) {
            return this.multiplyByScalar(n)
        }

    /**
     * Multiply this vector by the provided number
     */
    mulS(n: number) {
        return this.multiplyByScalar(n)
    }

    /**
     * Divive this vector by the provided number
     */
    divideByScalar(n: number) {
        this.x /= n
        this.y /= n
        return this
    }

    /**
     * Divive this vector by the provided number
     */
    divS(n: number) {
        return this.divideByScalar(n)
    }

    /**
     * Normalise this vector
     */
    normalise() {
        return this.divideByScalar(this.magnitude())
    }

    /**
     * For American spelling. Same as unit/normalise function
     */
    normalize() {
        return this.normalise()
    }

    /**
     * The same as normalise and normalize
     */
    unit() {
        return this.normalise()
    }

    /**
     * Returns the magnitude (length) of this vector
     */
    magnitude() {
        const x = this.x
        const y = this.y

        return Math.sqrt(x * x + y * y)
    }

    /**
     * Returns the magnitude (length) of this vector
     */
    length() {
        return this.magnitude()
    }

    /**
     * Returns the squred length of this vector
     */
    lengthSq() {
        const x = this.x
        const y = this.y

        return x * x + y * y
    }

    /**
     * Returns the dot product of this vector by another
     */
    dot(vec: Vector) {
        return vec.x * this.x + vec.y * this.y
    }

    /**
     * Returns the cross product of this vector by another.
     */
    cross(vec: Vector) {
        return this.x * vec.y - this.y * vec.x
    }

    /**
     * Reverses this vector i.e multiplies it by -1
     */
    reverse() {
        this.x = -this.x
        this.y = -this.y
        return this
    }

    /**
     * Set the vector axes values to absolute values
     */
    abs() {
        this.x = Math.abs(this.x)
        this.y = Math.abs(this.y)

        return this
    }

    /**
     * Zeroes the vector i.e sets all axes to 0
     */
    zero() {
        this.x = this.y = 0

        return this
    }

    /**
     * Returns the distance between this vector and another
     */
    distance(v: Vector) {
        var x = this.x - v.x
        var y = this.y - v.y

        return Math.sqrt(x * x + y * y)
    }

    /**
     * Rotates the vetor by provided radians
     */
    rotate(rads: number) {
        const cos = Math.cos(rads)
        const sin = Math.sin(rads)

        const ox = this.x
        const oy = this.y

        this.x = ox * cos - oy * sin
        this.y = ox * sin + oy * cos

        return this
    }
    
    // /**
    //  * Rounds this vector to n decimal places
    //  */
    // round(n = 2) {
    //     var p = precision[n]

    //     // This performs waaay better than toFixed and give Float32 the edge again.
    //     // http://www.dynamicguru.com/javascript/round-numbers-with-precision/
    //     this.x = ((0.5 + this.x * p) << 0) / p
    //     this.y = ((0.5 + this.y * p) << 0) / p

    //     return this
    // }

    /**
     * Returns a copy of this vector with this values
     */
    clone() {
        return new Vector(this.x, this.y)
    }


    static fromAngle(r: any, length?: number) {
        if (typeof length === 'undefined') {
          length = 1;
        }
        return new Vector(length * Math.cos(r), length * Math.sin(r));
      }

      static subtract(a: Vector, b: Vector) {
        return new Vector(a.x - b.x, a.y - b.y);
      }

      heading() {
        const h = Math.atan2(this.y, this.x);
        return h;
      };



    //   static distance(a: Vector, b: Vector) {
    //     return Math.sqrt(Math.pow(b.x - a.x, 2) + Math.pow(b.y - a.y, 2));
    //   }

      static distance(a: Vector, b: Vector): number {
        return Math.sqrt(squaredDistance(a, b));
      }


      static rand() {
        return new Vector(rand(-1,1),rand(-1,1)      )
      }

      
}

function squaredDistance(a: Vector, b: Vector): number {
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    return dx * dx + dy * dy;
  }

// /**
//  * These values are used by the `Vector.round` method to increase
//  * performance vs. using  Number.toFixed.
//  */
// const precision = [
//     1,
//     10,
//     100,
//     1000,
//     10000,
//     100000,
//     1000000,
//     10000000,
//     100000000,
//     1000000000,
//     10000000000
// ]