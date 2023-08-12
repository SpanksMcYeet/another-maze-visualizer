import Page from './page.js'

// CREDIT: https://gist.github.com/blixt/f17b47c62508be59987b
const Seed = class {
  constructor(seed) {
    this.seed = seed % 2147483647
    if (this.seed <= 0) 
      this.seed += 2147483646
  }
  next() {
    return this.seed = this.seed * 16807 % 2147483647
  }
  nextFloat(opt_minOrMax, opt_max) {
    return (this.next() - 1) / 2147483646
  }
}

// CREDIT: https://github.com/bryc/code/blob/master/jshash/experimental/cyrb53.js
const cyrb53 = (str, seed = 0) => {
    let h1 = 0xdeadbeef ^ seed
    let h2 = 0x41c6ce57 ^ seed
    for (let i = 0, ch; i < str.length; i++) {
        ch = str.charCodeAt(i)
        h1 = Math.imul(h1 ^ ch, 2654435761)
        h2 = Math.imul(h2 ^ ch, 1597334677)
    }
    h1 = Math.imul(h1 ^ (h1>>>16), 2246822507) ^ Math.imul(h2 ^ (h2>>>13), 3266489909)
    h2 = Math.imul(h2 ^ (h2>>>16), 2246822507) ^ Math.imul(h1 ^ (h1>>>13), 3266489909)
    return 4294967296 * (2097151 & h2) + (h1>>>0)
}

const Maze = class {
  static direction = [
    [-1, 0], [1, 0], // left and right
    [0, -1], [0, 1], // up and down
  ]
  constructor(width, height, type) {
    this.width = width
    this.height = height
    this.array = Array(width * height).fill(type)
    for (let [x, y, r] of this.entries().filter(([x, y, r]) => !this.has(x, y)))
      this.set(x, y, 0)
    
    this.walls = []
    this.alreadyPlaced = []
  }
  get(x, y) {
    return this.array[y * this.width + x]
  }
  set(x, y, value, debug) {
    this.array[y * this.width + x] = value
  }
  entries() {
    return this.array.map((value, i) => [i % this.width, Math.floor(i / this.width), value])
  }
  has(x, y) {
    return x > 0 && x < this.width - 1 && y > 0 && y < this.height - 1
  }
  async findPockets() {
    let queue = [[0, 0]]
    this.set(0, 0, 2)

    let checkedIndices = new Set([0])
    for (let i = 0; i < 5000 && queue.length > 0; i++) {
      let [x, y] = queue.shift()
      for (let [nx, ny] of [
        [x - 1, y], // left
        [x + 1, y], // right
        [x, y - 1], // top
        [x, y + 1], // bottom
      ]) {
        if (nx < 0 || nx > this.width - 1 || ny < 0 || ny > this.height - 1) continue
        if (this.get(nx, ny) !== 0) continue
        let i = ny * this.width + nx
        if (checkedIndices.has(i)) continue
        checkedIndices.add(i)
        queue.push([nx, ny])
        this.set(nx, ny, 2)

        /*
        if (debug) {
          ctx.fillStyle = '#ff000080'
          ctx.fillRect(nx + 1.5, ny + 1.5, 0.95, 0.95)
          await sleep(1)
        }
        */
      }
    }//841451154
  
    for (let [x, y, r] of this.entries()) {
      if (r === 2) {
        /*if (!debug) continue
        ctx.fillStyle = '#cdcdcd'
        ctx.fillRect(x + 1.5, y + 1.5, 1, 1)
        await sleep(1)*/
      } else if (r === 0) {
        this.set(x, y, 1)
        /*if (!debug) continue
        ctx.fillStyle = '#ff000080'
        ctx.fillRect(x + 1.5, y + 1.5, 1, 1)
        await sleep(1)*/
      }
    }
  }
  async placeWalls() {
    for (let { x, y, width, height } of this.walls)
      Page.cell(x, y, width, height, 'wall')
  }
  combineWalls() {
    do {
      let best = null
      let maxSize = 0
      for (let [x, y, r] of this.entries()) {
        if (r !== 1) continue
        let size = 1
        loop: while (this.has(x + size, y + size)) {
          for (let v = 0; v <= size; v++)
            if (this.get(x + size, y + v) !== 1
             || this.get(x + v, y + size) !== 1)
              break loop
          size++
        }
        if (size > maxSize) {
          maxSize = size
          best = { x, y }
        }
      }
      if (!best) return null
      for (let y = 0; y < maxSize; y++) {
        for (let x = 0; x < maxSize; x++) {
          this.set(best.x + x, best.y + y, 0)
        }
      }
      this.walls.push({ x: best.x, y: best.y, width: maxSize, height: maxSize, })
    } while ([].concat(...this.entries().filter(([x, y, r]) => r)).length > 0)
  }
  mergeWalls() {
    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        if (this.get(x, y) !== 1) continue
        let chunk = { x, y, width: 0, height: 1 }
        while (this.get(x + chunk.width, y) === 1) {
          this.set(x + chunk.width, y, 0)
          chunk.width++
          
          this.walls.push(chunk)
          //placeWalls(map, 1)
          //if (debug) await sleep(10)
        }
        outer: while (true) {
          for (let i = 0; i < chunk.width; i++) {
            if (this.get(x + i, y + chunk.height) !== 1) break outer
          }
          for (let i = 0; i < chunk.width; i++)
            this.set(x + i, y + chunk.height, 0)
          chunk.height++
          
          this.walls.push(chunk)
          //placeWalls(this, 1)
          //if (debug) await sleep(10)
        }
        this.walls.push(chunk)
      }
    }
  }
}

const SeedMaze = class {
  constructor({width, height, seedAmount, straightChance, turnChance, type, mazeSeed, debug} = {}) {
    this.type = type
    this.map = new Maze(width, height, (type + 1) % 2)
  
    this.mazeSeed = mazeSeed === '' ? Math.floor(Math.random() * 2147483646) : /^\d+$/.test(mazeSeed) ? parseInt(mazeSeed) : cyrb53(mazeSeed)

    this.mapSeed = new Seed(this.mazeSeed)    
    
    this.seeds = []
    this.seedAmount = seedAmount
    this.turnChance = turnChance
    this.straightChance = straightChance
    
    this.debug = debug
  }
  async init() {
    await this.place()
    await this.walk()
    await this.map.findPockets()//this.map, this.debug)
    
    let walls = this.map.array.filter(r => r === 1)
    await this.map.combineWalls()
    //await this.map.mergeWalls()//this.map, this.debug)
    
    await this.map.placeWalls()//this.map)
    
    return [walls, this.mazeSeed]
  }
  async validateCell(position) {
    if (this.map.get(position.x, position.y) === (this.type + 0) % 2) return false
    if (!this.map.has(position.x, position.y)) return false
    return true
  }
  async place() {
    let i = 0
    while (this.seeds.length < this.seedAmount) {
      if (i > 1000) throw Error('Loop overflow')
      i++
      
      let loc = { x: 0, y: 0 }
      loc.x = Math.floor(this.mapSeed.nextFloat() * this.map.width) - 1
      loc.y = Math.floor(this.mapSeed.nextFloat() * this.map.height) - 1
      if (await this.validateCell(loc)) {
        this.seeds.push(loc)
        this.map.set(loc.x, loc.y, this.type)
        //await placeWalls(this.map, this.debug ? 0 : -1)
      }
    }
  }
  async walk() {
    let perpendicular = ([x, y]) => [[y, -x], [-y, x]]
    let i = 0
    for (let seed of this.seeds) {
      let dir = Maze.direction[Math.floor(this.mapSeed.nextFloat() * 4)]
      while(true) {
        if (i > 1000) throw Error('Loop overflow')
        i++
        let [x, y] = dir
        if (this.mapSeed.nextFloat() <= this.straightChance) {
          seed.x += x
          seed.y += y
        } else if (this.mapSeed.nextFloat() <= this.turnChance) {
          let [xx, yy] = perpendicular(dir)[Math.floor(this.mapSeed.nextFloat() * 2)]
          seed.x += xx
          seed.y += yy
        } else {
          break
        }
        if (await this.validateCell(seed)) {
          this.map.set(seed.x, seed.y, this.type)
          //await placeWalls(this.map, this.debug ? 0 : -1)
        } else {
          break
        }
      }
    }
  }
}

export default SeedMaze
