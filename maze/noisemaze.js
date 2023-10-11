import Maze from './maze.js'
import ImprovedNoise from '../toolbox/perlinnoise.js'

const NoiseMaze = class {
  constructor({width, height, type = 'normal', fill = false, mazeSeed = '', debug} = {}) {
    this.map = new Maze(width, height, mazeSeed, fill++)
    this.seed = mazeSeed
    this.type = type
    this.util =  this.map.seedUtils
    
    this.perlin = new ImprovedNoise(this.util)
    
    this.debug = debug
  }
  init() {
    switch (this.type) {
      case 'normal':
        this.normal(4)
        break
      case 'clamped':
        this.clamped(4)
        break
      case 'experiment1':
        this.experiment1()
        break
      case 'experiment2':
        this.experiment2()
        break
      case 'quantized':
        this.quantized(2)
        break
      case 'dynamic':
        this.dynamic(4)
        break
      case 'domainWarped':
        this.domainWarped(2)
        break
      case 'multiScale':
        this.multiScale(2)
        break
      default:
        this.normal()
    }
    this.map.findPockets()
    
    this.map.combineWalls()
    this.map.placeWalls()
  }
  validateCell(position) {
    if (this.map.get(position.x, position.y) === (this.type + 0) % 2) return false
    if (!this.map.has(position.x, position.y)) return false
    return true
  }
  normal(zoom = 1) {
    for (let y = 0; y < this.map.height; y++) {
      for (let x = 0; x < this.map.width; x++) {
        if (!this.validateCell({ x, y })) continue
        
        let noise = this.perlin.noise(x / zoom, y / zoom, 0) > 0
        this.map.set(x, y, noise++)
      }
    }
  }
  clamped(zoom = 1, min = -0.085, max = 0.085) {
    for (let y = 0; y < this.map.height; y++) {
      for (let x = 0; x < this.map.width; x++) {
        if (!this.validateCell({ x, y })) continue
        
        let noise = this.perlin.noise(x / zoom, y / zoom, 0)
        noise = noise < max && noise > min
        this.map.set(x, y, noise++)
      }
    }
  }
  experiment1() {
    this.clamped(2, -0.25, 0.25)
    for(let i = 0; i < 1; i++) {
      for (let [x, y, value] of this.map.entries()) {
        if (x === 0 || y === 0 || x === this.map.width - 1 || y === this.map.height - 1) continue
        let adjacentWalls = 0
        
        for (let ix = x - 1; ix <= x + 1; ix++) {
          for (let iy = y - 1; iy <= y + 1; iy++) {
            if (!this.map.get(ix, iy))
              adjacentWalls++
          }
        }
        let nearbyWalls = 0
        
        for (let ix = x - 2; ix <= x + 2; ix++) {
          for (let iy = y - 2; iy <= y + 2; iy++) {
            if (Math.abs(ix - x) === 2 && Math.abs(iy - y) === 2) continue
            if (ix < 0 || iy < 0 || ix >= this.map.width || iy >= this.map.height) continue
            if (!this.map.get(ix, iy))
              nearbyWalls++
          }
        }
        
        let value = adjacentWalls >= 6 || nearbyWalls <= 4
        this.map.set(x, y, value++)
      }
    }
  }
  experiment2() {
    this.clamped(4, 0, 0.5)
    for(let i = 0; i < 2; i++) {
      for (let [x, y, value] of this.map.entries()) {
        if (x === 0 || y === 0 || x === this.map.width - 1 || y === this.map.height - 1) continue
        let adjacentWalls = 0
        
        for (let ix = x - 1; ix <= x + 1; ix++) {
          for (let iy = y - 1; iy <= y + 1; iy++) {
            if (this.map.get(ix, iy))
              adjacentWalls++
          }
        }
        let nearbyWalls = 0
        
        for (let ix = x - 2; ix <= x + 2; ix++) {
          for (let iy = y - 2; iy <= y + 2; iy++) {
            if (Math.abs(ix - x) === 2 && Math.abs(iy - y) === 2) continue
            if (ix < 0 || iy < 0 || ix >= this.map.width || iy >= this.map.height) continue
            if (this.map.get(ix, iy))
              nearbyWalls++
          }
        }
        
        let value = adjacentWalls >= 5 || nearbyWalls <= 4
        this.map.set(x, y, value++)
      }
    }
  }
  quantized(zoom = 1, threshold = 0.1) {
    for (let y = 0; y < this.map.height; y++) {
      for (let x = 0; x < this.map.width; x++) {
        if (!this.validateCell({ x, y })) continue
        
        let noise = this.perlin.noise(x / zoom, y / zoom, 0)
        noise = this.perlin.quantize(noise, threshold)
        this.map.set(x, y, noise++)
      }
    }
  }
  domainWarped(zoom = 1) {
    for (let y = 0; y < this.map.height; y++) {
      for (let x = 0; x < this.map.width; x++) {
        if (!this.validateCell({ x, y })) continue

        let warp = this.perlin.domainWarp(x / zoom, y / zoom, 0)
        let noise = this.perlin.noise(warp.x, warp.y, 0) > 0
        this.map.set(x, y, noise++)
      }
    }
  }
  dynamic(zoom = 1, threshold = 0.1) {
    for (let y = 0; y < this.map.height; y++) {
      for (let x = 0; x < this.map.width; x++) {
        if (!this.validateCell({ x, y })) continue

        let noise = this.perlin.dynamic(x / zoom, y / zoom, 0, Date.now() * 0.001)
        noise = this.perlin.quantize(noise, threshold)
        this.map.set(x, y, noise++)
      }
    }
  }
  multiScale(zoom = 1) {
    for (let y = 0; y < this.map.height; y++) {
      for (let x = 0; x < this.map.width; x++) {
        if (!this.validateCell({ x, y })) continue

        let noise = this.perlin.multiScale(x / zoom, y / zoom, 0) > 0
        this.map.set(x, y, noise++)
      }
    }
  }
}

export default NoiseMaze
