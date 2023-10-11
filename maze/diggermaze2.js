import Maze from './maze.js'

const DiggerMazeV2 = class {
  constructor({width, height, straightChance, turnChance, mazeSeed = '', }) {
    this.width = width
    this.height = height
    this.turnChance = turnChance
    this.straightChance = straightChance
    
    this.map = new Maze(width, height, mazeSeed, 1)
    this.util = this.map.seedUtils
    this.walls = []
  }
  init() {
    this.walk()

    this.map.findPockets()
    this.map.combineWalls()
    
    this.map.placeWalls()
  }
  validateCell(position) {
    if (!this.map.has(position.x, position.y)) return false
    return true
  }
  walk() {
    let perpendicular = ([x, y]) => [[y, -x], [-y, x]]
    let i = 0
    // Collect all of the cells on the borders
    let borderCells = this.map.entries().filter(([x, y, r]) => x === 0 || x === this.width - 1 || y === 0 || y === this.height - 1)
    // Iterate through all of them
    for (let [cx, cy, cr] of borderCells) {
      let left = cx === this.width - 1
      let right = cx === 0
      let up = cy === this.height - 1
      let down = cy === 0
      
      // Time to abuse some of Javascript poop
      let ix = +right - +left
      let iy = +down - +up
      
      // Ignore corners
      if (ix && iy !== 0) continue
      
      let dir = [ix, iy]
      while (true) {
        // Apply Retard Protection IV
        if (i > 1e3) throw Error('Loop overflow')
        i++
        
        let [x, y] = dir
        if (this.util.nextFloat() <= this.straightChance) {
          cx += x
          cy += y
        } else if (this.util.nextFloat() <= this.turnChance && i > 1) {
          let [xx, yy] = perpendicular(dir)[Math.floor(this.util.nextFloat() * 2)]
          cx += xx
          cy += yy
        } else {
          break
        }
        if (i === 0 || this.validateCell({ x: cx, y: cy })) {
          this.map.set(cx, cy, 0)
        } else {
          break
        }
      }
      i = 0
    }
  }
}

export default DiggerMazeV2
