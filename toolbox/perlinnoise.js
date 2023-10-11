/*  Created using Ken Perlin's Java reference implementation of improved noise https://cs.nyu.edu/~perlin/  */
import * as util from './util.js'

const ImprovedNoise = class {
  constructor(mutation) {
    this.p = new Array(512)
    
    this.permutation = Array(256).fill().map(() => Math.floor(255 * mutation.nextFloat()))
    for (let i = 0; i < 256; i++) 
      this.p[256 + i] = this.p[i] = this.permutation[i]
  }
  fade(t) {
    return t * t * t * (t * (t * 6 - 15) + 10)
  }
  lerp(t, a, b) {
    return a + t * (b - a)
  }
  grad(hash, x, y, z) {
    let h = hash & 15
    let u = h < 8 ? x : y
    let v = h < 4 ? y : h === 12 || h === 14 ? x : z
    return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v)
  }
  noise(x, y, z) {
    let ix = Math.floor(x) & 255
    let iy = Math.floor(y) & 255
    let iz = Math.floor(z) & 255
    
    x -= Math.floor(x)
    y -= Math.floor(y)
    z -= Math.floor(z)

    let u = this.fade(x)
    let v = this.fade(y)
    let w = this.fade(z)

    let a = this.p[ix] + iy
    let aa = this.p[a] + iz
    let ab = this.p[a + 1] + iz
    let b = this.p[ix + 1] + iy
    let ba = this.p[b] + iz
    let bb = this.p[b + 1] + iz

    
    let result = this.lerp(w, this.lerp(v, this.lerp(u, this.grad(this.p[aa], x, y, z), this.grad(this.p[ba], x - 1, y, z)), this.lerp(u, this.grad(this.p[ab], x, y - 1, z), this.grad(this.p[bb], x - 1, y - 1, z))), this.lerp(v, this.lerp(u, this.grad(this.p[aa + 1], x, y, z - 1), this.grad(this.p[ba + 1], x - 1, y, z - 1)), this.lerp(u, this.grad(this.p[ab + 1], x, y - 1, z - 1), this.grad(this.p[bb + 1], x - 1, y - 1, z - 1))))

    return result
  }
  quantize(value, threshold) {
    return value > threshold ? 1 : 0
  }
  dynamic(x, y, z, time) {
    let frequency = Math.sin(time * 0.1) * 2 + 3
    
    let offsetX = Math.cos(time * 0.1) * 10
    let offsetY = Math.sin(time * 0.1) * 10
    let offsetZ = Math.cos(time * 0.1) * 10
    
    let result = this.noise((x + offsetX) * frequency, (y + offsetY) * frequency, (z + offsetZ) * frequency)
    return result
  }
  domainWarp(x, y, z) {
    let dx = this.noise(x, y, z)
    let dy = this.noise(x + 50, y + 50, z + 50)
    let dz = this.noise(x - 50, y - 50, z - 50)
    return { x: x + dx, y: y + dy, z: z + dz }
  }
  multiScale(x, y, z) {
    let value = 0
    let amplitude = 1
    let frequency = 1
    for (let i = 0; i < 3; i++) {
      value += this.noise(x * frequency, y * frequency, z * frequency) * amplitude
      amplitude *= 0.5
      frequency *= 2
    }
    return value
  }
}

export default ImprovedNoise
