import Maze from './maze.js'

const SeedMaze = class {
  constructor({width, height, seedAmount, straightChance, turnChance, type, mazeSeed} = {}) {
    this.type = type
    this.map = new Maze(width, height, mazeSeed, (type + 1) % 2)
  
    this.seed = mazeSeed

    this.util =  this.map.seedUtils
    
    this.seeds = []
    this.seedAmount = seedAmount
    this.turnChance = turnChance
    this.straightChance = straightChance
    
  }
  init() {
    this.place()
    this.walk()
    this.map.findPockets()
    
    let walls = this.map.array.filter(r => r === 1)
    this.map.combineWalls()
    //this.map.mergeWalls()
    
    this.map.placeWalls()
    
    return [walls, this.seed]
  }
  validateCell(position) {
    //if (this.map.get(position.x, position.y) === (this.type + 0) % 2) return false
    if (!this.map.has(position.x, position.y)) return false
    return true
  }
  place() {
    let i = 0
    while (this.seeds.length < this.seedAmount) {
      // Apply Retard Protection IV
      if (i > 1e3) throw Error('Loop overflow')
      i++
      
      let loc = { x: 0, y: 0 }
      loc.x = Math.floor(this.util.nextFloat() * this.map.width) - 1
      loc.y = Math.floor(this.util.nextFloat() * this.map.height) - 1
      if (this.validateCell(loc)) {
        this.seeds.push(loc)
        this.map.set(loc.x, loc.y, this.type)
      }
    }
  }
  walk() {
    let perpendicular = ([x, y]) => [[y, -x], [-y, x]]
    let i = 0
    for (let seed of this.seeds) {
      let dir = Maze.direction[Math.floor(this.util.nextFloat() * 4)]
      while (true) {
        // Apply Retard Protection IV
        if (i > 1000) throw Error('Loop overflow')
        i++
        let [x, y] = dir
        if (this.util.nextFloat() <= this.straightChance) {
          seed.x += x
          seed.y += y
        } else if (this.util.nextFloat() <= this.turnChance) {
          let [xx, yy] = perpendicular(dir)[Math.floor(this.util.nextFloat() * 2)]
          seed.x += xx
          seed.y += yy
        } else {
          break
        }
        if (this.validateCell(seed)) {
          this.map.set(seed.x, seed.y, this.type)
        } else {
          break
        }
      }
    }
  }
}

export default SeedMaze
