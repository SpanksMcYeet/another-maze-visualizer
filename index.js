import Canvas from './toolbox/canvas.js'
import * as util from './toolbox/util.js'
import { mouse, scroll } from './toolbox/event.js'
import SeedMaze from './maze/seedMaze.js'

import Page from './page.js'

const canvas = document.getElementById('canvas')
const c = new Canvas(canvas)

// Pregenerate a maze
let maze = new SeedMaze({
  width: 40,
  height: 40,
  seedAmount: 100,
  straightChance: 0.75,
  turnChance: 0.2,
  type: 1,
  mazeSeed: '',
  debug: false,
})
await maze.init()

let time = 0
let appLoop = async (newTime) => {
  // Not used but might be used later on for a debug mode if I feel motivated enough to do that
  let timeElapsed = newTime - time
  time = newTime

  // Grid background = yes
  c.box({ width: Page.width * 2, height: Page.height * 2, fill: util.colors.lgray })
  for (let i = -100; i <= 100; i++) {
    c.box({ x: 0, y: i * 30, width: Page.width * 2, height: 2, fill: util.mixColors(util.colors.lgray, util.colors.gray, 0.1) })
    c.box({ x: i * 30, y: 0, width: 2, height: Page.height * 2, fill: util.mixColors(util.colors.lgray, util.colors.gray, 0.1) })
  }
  
  let mobile = Page.width < Page.height * 0.85
  let padding = 12
  // Move the split planes vertically instead of horizontally if the visitor is a mobile user
  // Definitely not the best way of doing this but it'll do for the time being
  let buttonZone = {
    get width() {
      if (mobile) return Page.width - padding * 2
      return Page.width * 0.5 - padding * 2
    },
    get height() {
      if (mobile) return Page.height * 0.5 - padding
      return Page.height - padding * 2
    },
    get minX() {
      if (mobile) return padding
      return padding
    },
    get minY() {
      if (mobile) return Page.centerY
      return padding
    },
    get centerX() {
      return buttonZone.minX + buttonZone.width * 0.5
    },
    get centerY() {
      return buttonZone.minY + buttonZone.height * 0.5
    },
  }
  let displayZone = {
    get width() {
      if (mobile) return Page.width - padding * 2
      return Page.width * 0.5 - padding * 2
    },
    get height() {
      if (mobile) return Page.height * 0.5 - padding * 2
      return Page.height - padding * 2
    },
    get minX() {
      if (mobile) return padding
      return Page.centerX + padding
    },
    get minY() {
      if (mobile) return padding
      return padding
    },
    get centerX() {
      return displayZone.minX + displayZone.width * 0.5
    },
    get centerY() {
      return displayZone.minY + displayZone.height * 0.5
    },
  }

  // Here for debug purposes. Don't uncomment unless you like seeing red lines
  /*
  c.rect({ x: buttonZone.minX, y: buttonZone.minY, width: buttonZone.width, height: buttonZone.height, stroke: '#ff0000', lineWidth: 2 })
  c.rect({ x: displayZone.minX, y: displayZone.minY, width: displayZone.width, height: displayZone.height, stroke: '#ff0000', lineWidth: 2 })
  */
  
  // Draw the buttons
  let fields = [{
    color: util.colors.ffa,
    name: 'Diep Maze',
    size: 1, 
    run() {
      // Regenerate a new maze
      maze = new SeedMaze({
        width: 40,
        height: 40,
        seedAmount: 100,
        straightChance: 0.75,
        turnChance: 0.2,
        type: 1,
        mazeSeed: '',
        debug: false,
      })
      maze.init()
    },
    // Non function as of right now, but might be later on
  }, {
    color: util.mixColors(util.colors.gray, util.colors.black, 0.4),//util.colors.tdm2,
    name: '"Digger" Maze',
    size: 1,
    // TODO: Import the code for this
    //run() {},
  }, {
    color: util.mixColors(util.colors.gray, util.colors.black, 0.4),//util.colors.tdm4,
    name: 'Arras Maze',
    size: 1,
    // TODO: Import the code for this
    //run() {},
  }, {
    color: util.mixColors(util.colors.gray, util.colors.black, 0.4),//util.colors.maze,
    name: 'Pathfind (soonTM cuz lazy)',
    size: 0.7,
    // TODO: Port arras pathfinding
    //run() {},
  }]

  
  let ratio = buttonZone.width / buttonZone.height
  let textSize = 50 * ratio
  if (mobile)
    textSize *= 0.5

  // Here for debug purposes. Don't uncomment unless you like seeing red lines
  //c.rect({ x: buttonZone.minX, y: buttonZone.minY, width: buttonZone.width, height: textSize * 2, stroke: '#ff0000', lineWidth: 2 })
  c.text({ x: buttonZone.centerX, y: buttonZone.minY + textSize * 1.5, size: textSize, text: 'damocles\'s Maze Shenanigans', lineWidth: 6 })

  let rowLength = 1//Math.ceil(4 * ratio * ratio)
  //if (mobile)
    //rowLength = Math.ceil(0.925 * ratio * ratio)
  let buttonHeight = 150 * ratio
  if (mobile)
    buttonHeight *= 0.5
  let buttonWidth = (buttonZone.width - padding * (rowLength + 1)) / rowLength
  let y = -1
  for (let i = 0; i < fields.length; i++) {
    let x = i % rowLength
    if (i % rowLength === 0)
      y++
    Page.box({
      x: buttonZone.minX + padding + buttonWidth * 0.5 + buttonWidth * x + padding * x,
      y: buttonZone.minY + textSize * 3.5 + padding + buttonHeight * y + padding * y,
      width: buttonWidth,
      height: buttonHeight,
      fill: fields[i].color,
      stroke: util.mixColors(fields[i].color, util.colors.black, 0.65),
      lineWidth: 6,
      text: fields[i].name,
      textSize: fields[i].size,
      clickable: fields[i].run,
      hover: i === 0, // temporarily set to this cuz nothing else is function as of rn so fuck it less work on me
    })
  }
  Page.display({
    x: displayZone.centerX,
    y: displayZone.centerY,
    width: mobile ? displayZone.height : displayZone.width,
    height: mobile ? displayZone.height : displayZone.width
  })
  
  // Draw the maze
  maze.map.placeWalls()  

  Page.refreshCanvas()
  requestAnimationFrame(appLoop)
}

requestAnimationFrame(appLoop)
