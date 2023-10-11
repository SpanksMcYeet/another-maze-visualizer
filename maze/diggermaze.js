import Maze from './maze.js'

const DiggerMaze = class {
  constructor({ width, height, random, border, center, minimumWalls = 0, removeSingles = true, mazeSeed = '', }) {
    this.width = width
    this.height = height
    this.randomDiggers = random
    this.borderDiggers = border
    this.centerDiggers = center
    this.minWalls = minimumWalls
    this.removeSingles = removeSingles

    this.map = new Maze(width, height, mazeSeed, 1)
    this.util = this.map.seedUtils
    this.walls = []
  }
  init() {
    if (this.randomDiggers) this.dig(this.randomDiggers, 'none')
    if (this.borderDiggers) this.dig(this.borderDiggers, 'border')
    if (this.centerDiggers) this.dig(this.centerDiggers, 'center')

    if (this.removeSingles) this.purgeFrags()

    for (let [x, y, r] of this.map.entries().filter(([x, y, r]) => x === 0 || x === this.width - 1 || y === 0 || y === this.height - 1 ))
      this.map.set(x, y, 0)
    
    this.map.findPockets()
    this.map.combineWalls()
    
    this.map.placeWalls()
  }
  // Unused
  get totalWalls() {
    return this.map.entries().filter(([x, y, v]) => v === 1).length
  }
  validateCell(position) {
    if (this.map.get(position.x, position.y) === (this.type + 0) % 2) return false
    if (!this.map.has(position.x, position.y)) return false
    return true
  }
  purgeFrags() {
    for (let [x, y, value] of this.map.entries()) {
      if (x > 0 && x < this.width - 1 && y > 0 && y < this.height - 1 && value) {
        let sides = [
          this.map.get(x - 1, y), // left
          this.map.get(x + 1, y), // right
          this.map.get(x, y - 1), // top
          this.map.get(x, y + 1), // bottom
        ]
        if (sides.every(a => a === 0)) {
          this.map.set(x, y, 0)
        }
      }
    }
  }
  // TODO: Make this code better, it's old asf
  dig({ maxLength, maxTunnels, maxDiggers }, preference) {
    let turn = ([x, y]) => [[y, -x], [-y, x]]
    let dir = Maze.direction[Math.floor(this.util.nextFloat() * 4)]

    for (let i = 0; i < maxDiggers; i++) {
      let pos
      switch (preference) {
        case 'none': // Dig from any random point in the map
          pos = {
            x: Math.floor(this.util.nextFloat() * this.width),
            y: Math.floor(this.util.nextFloat() * this.height),
          }
          break
        case 'center': // Dig exclusively from the center
          pos = {
            x: Math.floor((this.width - 1) / 2 + this.util.nextFloat()) + Math.round(this.util.nextFloat() * 8 - 4),
            y: Math.floor((this.height - 1) / 2 + this.util.nextFloat()) + Math.round(this.util.nextFloat() * 8 - 4),
          }
          break
        case 'border': // Dig exclusively from the border
          pos = [
            { x: 1, y: Math.floor(this.util.nextFloat() * this.height - 1) },
            { x: this.width - 2, y: Math.floor(this.util.nextFloat() * this.height - 1) },
            { x: Math.floor(this.util.nextFloat() * this.width - 1), y: 1 },
            { x: Math.floor(this.util.nextFloat() * this.width - 1), y: this.height - 2 }
          ][Math.floor(this.util.nextFloat() * 4)]
          break
        default:
          throw new Error('Unknown preference value')
      }

      // Start digging
      for (let n = 0; n < maxTunnels; n++) {
        // Make sure we can still dig and we're within bounds
        if (!this.validateCell(pos)) continue
        
        // Pick how long we want our tunnel to be
        let ranLength = Math.floor(this.util.nextFloat() * maxLength)
        for (let i = 0; i < ranLength; i++) {
          if (!this.validateCell(pos)) break
          // Dig the tunnel
          this.map.set(pos.x, pos.y, 0)
          pos.x += dir[0]
          pos.y += dir[1]
          // Make sure we don't go under the minimum wall cap
          if (this.totalWalls <= this.minWalls) return
        }
        // Pick a random direction 90 degrees from the previous direction
        dir = turn(dir)[Math.floor(this.util.nextFloat() * 2)]
      }
    }
  }
}

export default DiggerMaze
