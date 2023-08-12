import Canvas from './toolbox/canvas.js'

const canvas = document.getElementById('canvas')
const c = new Canvas(canvas)

import * as util from './toolbox/util.js'
import { mouse } from './toolbox/event.js'

// Similar to the canvas.js, but instead used to shove any methods that will be used more
// than once and/or are utilized throughout multiple files
const Page = {
  get width() {
    return window.innerWidth
  },
  get height() {
    return window.innerHeight
  },
  get centerX() {
    return Page.width * 0.5
  },
  get centerY() {
    return Page.height * 0.5
  },
  grid: {
    cellSize: 0,
    minX: 0,
    minY: 0,
    width: 0,
    height: 0,
  },
  box({ x = 0, y = 0, width = 0, height = 0, fill = null, stroke = null, lineWidth = 1, clickable = false, hover = false, text = null, textSize = 1 }) {
    let draw = (fill1, fill2) => {
      c.box({ x, y, width, height, fill: fill1, lineWidth })
      c.box({ x, y: y + (height * 0.3), width, height: height * 0.4, fill: fill2, lineWidth })
      c.box({ x, y, width, height, stroke, lineWidth })
      if (text != null)
        c.text({ x: x, y: y + width * 0.1 * 0.25, size: width * 0.1 * textSize, text: text, lineWidth: 8 })
    }
    
    let dfill = util.mixColors(fill, util.colors.black, 0.15)
    if (util.bounds({ x, y, width, height, mousePosition: mouse, }) && (clickable || hover)) {
      if (hover)
        draw(util.mixColors(fill, util.colors.white, 0.15), util.mixColors(dfill, util.colors.white, 0.15))
      if (mouse.left && clickable)
        clickable()
    } else {
      draw(fill, dfill)
    }
  },
  map({ x = 0, y = 0, width = 0, height = 0, size = 40 }) {
    c.box({ x, y, width, height, fill: util.colors.lgray })
    c.box({ x, y, width, height, stroke: util.colors.black, lineWidth: 6 })
    Page.grid.cellSize = width / size
    Page.grid.minX = x - width * 0.5
    Page.grid.minY = y - height * 0.5
    Page.grid.width = width
    Page.grid.height = height
  },
  cell(x, y, width, height, mod) {
    let grid = Page.grid
    let fill = null
    let stroke = null
    switch (mod) {
      case 'wall':
        fill = util.colors.gray
        stroke = util.mixColors(util.colors.gray, util.colors.black, 0.65)
        break
      // Will add more shit here in the future like uhhhh idk debug related things
    }
    
    c.rect({
      x: grid.minX + grid.cellSize * x,
      y: grid.minY + grid.cellSize * y,
      width: grid.cellSize * width,
      height: grid.cellSize * height,
      fill: stroke,
      lineWidth: 0
    })
    let reducedSize = grid.cellSize * 0.02
    c.rect({
      x: grid.minX + reducedSize + grid.cellSize * x,
      y: grid.minY + reducedSize + grid.cellSize * y,
      width: grid.cellSize * width - reducedSize * 2,
      height: grid.cellSize * height - reducedSize * 2,
      fill,
      lineWidth: 0
    })
  },
  refreshCanvas() {
    c.setSize({ width: window.innerWidth, height: window.innerHeight, ratio: window.devicePixelRatio })

    mouse.left = false
    mouse.right = false

    c.box({ width: Page.width * 2, height: Page.height * 2, fill: util.colors.lgray })
    for (let i = -100; i <= 100; i++) {
      c.box({ x: 0, y: i * 30, width: Page.width * 2, height: 2, fill: util.mixColors(util.colors.lgray, util.colors.gray, 0.1) })
      c.box({ x: i * 30, y: 0, width: 2, height: Page.height * 2, fill: util.mixColors(util.colors.lgray, util.colors.gray, 0.1) })
    }
  },
}
// Honestly idk why I even did this
export default Page
