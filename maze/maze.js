import Page from '../page.js'

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
  nextFloat() {
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
  constructor(width, height, mazeSeed, type) {
    this.width = width
    this.height = height
    this.array = Array(width * height).fill(type)
    for (let [x, y, r] of this.entries().filter(([x, y, r]) => !this.has(x, y)))
      this.set(x, y, 0)

    this.seed = mazeSeed === '' ? Math.floor(Math.random() * 2147483646) : /^\d+$/.test(mazeSeed) ? parseInt(mazeSeed) : cyrb53(mazeSeed)
    this.seedUtils = new Seed(this.seed)
    
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
  findPockets() {
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
      }
    }
  
    for (let [x, y, r] of this.entries()) {
      if (r === 0)
        this.set(x, y, 1)
    }
  }
  placeWalls() {
    // For debug purposes
    /*for (let [x, y, r] of this.entries()) {
      if (r === 1) {
        Page.cell(x, y, 1, 1, 'wall')
      } else if (r === 0) {
        Page.cell(x, y, 1, 1, 'pocket')
      } 
    }*/
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
        }
        outer: while (true) {
          for (let i = 0; i < chunk.width; i++) {
            if (this.get(x + i, y + chunk.height) !== 1) break outer
          }
          for (let i = 0; i < chunk.width; i++)
            this.set(x + i, y + chunk.height, 0)
          chunk.height++
          
          this.walls.push(chunk)
        }
        this.walls.push(chunk)
      }
    }
  }
}

export default Maze
