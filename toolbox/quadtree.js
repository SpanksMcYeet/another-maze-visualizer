import Page from '../page.js'

const QuadTree = class {
  constructor(boundary) {
    this.boundary = boundary
    
    this.width = this.boundary.width
    this.height = this.boundary.height
    this.x = this.boundary.x
    this.y = this.boundary.y
    this.capacity = this.boundary.capacity

    this.boundaries = []
    this.points = []
  }
  inBounds(point) {
    return point.x >= this.x && point.x < this.x + this.width && point.y >= this.y && point.y < this.y + this.width
  }
  insert(point) {
    if (!this.inBounds(point)) return
  
    if (this.points.length < this.capacity) return this.points.push(point)
  
    if (this.boundaries.length === 0)
      this.subdivide()

  
    for (let bounds of this.boundaries) {
      if (bounds.inBounds(point))
        bounds.insert(point)
    }
  }
  subdivide() {
    let subWidth = this.width * 0.5
    let subHeight = this.height * 0.5

    for (let i = 0; i < 4; i++) {
      let offsetX = (i % 2) * subWidth
      let offsetY = Math.floor(i / 2) * subHeight

      let boundary = new QuadTree({
        width: subWidth,
        height: subHeight,
        x: this.x + offsetX,
        y: this.y + offsetY,
        capacity: this.capacity,
      })
      for (let point of this.points)
        boundary.insert(point)
      
      this.boundaries.push(boundary)
    }
  }
  visualize() {
    Page.cell(this.x, this.y, this.width, this.height, 'boundary')
    for (let point of this.points)
      Page.cell(point.x, point.y, 1, 1, 'point')
    for (let boundary of this.boundaries)
      boundary.visualize()
  }
}

export default QuadTree
