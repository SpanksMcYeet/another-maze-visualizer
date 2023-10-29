import Canvas from './toolbox/canvas.js'
import * as util from './toolbox/util.js'

import SeedMaze from './maze/seedmaze.js'
import DiggerMaze from './maze/diggermaze.js'
import DiggerMazeV2 from './maze/diggermaze2.js'
import NoiseMaze from './maze/noisemaze.js'
import QuadTree from './toolbox/quadtree.js'
import QuadTreeCave from './maze/quadtreecave.js'

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
maze.init()

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
  // Gonna just assume every mobile device viewing this site has vertical dimensions
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
  //c.rect({ x: buttonZone.minX, y: buttonZone.minY, width: buttonZone.width, height: buttonZone.height, stroke: '#ff0000', lineWidth: 2 })
  //c.rect({ x: displayZone.minX, y: displayZone.minY, width: displayZone.width, height: displayZone.height, stroke: '#ff0000', lineWidth: 2 })
  
  
  // Draw the buttons
  let fields = [{
    color: util.colors.ffa,
    name: 'Seed Maze',
    size: 1, 
    run() {
      // Regenerate a new maze
      maze = new SeedMaze({
        width: 32,
        height: 32,
        seedAmount: 75,
        straightChance: 0.6,
        turnChance: 0.2,
        type: 1,
        mazeSeed: '',
        debug: false,
      })
      maze.init()
    },
    // Non function as of right now, but might be later on
  }, {
    color: util.colors.tdm2,
    name: 'Digger Maze',
    size: 1,
    run() {
      maze = new DiggerMaze({
        width: 32,
        height: 32,
        random: {
          maxLength: 6,
          maxTunnels: 10,
          maxDiggers: 35
        },
        border: {
          maxLength: 6,
          maxTunnels: 10,
          maxDiggers: 35
        }
      })
      maze.init()
    },
  }, {
    color: util.colors.maze2tdm,
    name: 'Digger Maze v2',
    size: 1,
    // TODO: Import the code for this
    run() {
      maze = new DiggerMazeV2({
        width: 32,
        height: 32,
        straightChance: 0.75,
        turnChance: 0.65,
        //maxDiggers: 50
      })
      maze.init()
    },
  }, {
    color: util.colors.tdm4,
    name: 'Noise Maze',
    size: 1,
    run() {
      maze = new NoiseMaze({
        width: 32,
        height: 32,
        type: 'normal',
      })
      maze.init()
    }
  }, {
    color: util.colors.maze4tdm,
    name: 'Clamped Noise Maze',
    size: 1,
    run() {
      maze = new NoiseMaze({
        width: 32,
        height: 32,
        type: 'clamped',
      })
      maze.init()
    }
  }, {
    color: util.colors.portal4tdm,
    name: 'Experimental Maze 1',
    size: 1,
    run() {
      maze = new NoiseMaze({
        width: 32,
        height: 32,
        type: 'experiment1',
      })
      maze.init()
    }
  }, {
    color: util.colors.portal4tdmmaze,
    name: 'Experimental Maze 2',
    size: 1,
    run() {
      maze = new NoiseMaze({
        width: 32,
        height: 32,
        type: 'experiment2',
        fill: true,
      })
      maze.init()
    }
  }, /*{
    color: util.colors.blueviolet,
    name: 'Experimental Maze 3',
    size: 1,
    run() {
      maze = new NoiseMaze({
        width: 32,
        height: 32,
        type: 'experiment3',
        fill: true,
      })
      maze.init()
    }
  },*/ {
    color: util.colors.domination,
    name: 'Quantized Maze',
    size: 1,
    run() {
      maze = new NoiseMaze({
        width: 32,
        height: 32,
        type: 'quantized',
      })
      maze.init()
    }
  }, {
    color: util.colors.assault,
    name: 'Dynamic Maze',
    size: 1,
    run() {
      maze = new NoiseMaze({
        width: 32,
        height: 32,
        type: 'dynamic',
      })
      maze.init()
    }
  }, {
    color: util.colors.mothership,
    name: 'Domain Warped Maze',
    size: 1,
    run() {
      maze = new NoiseMaze({
        width: 32,
        height: 32,
        type: 'domainWarped',
      })
      maze.init()
    }
  }, {
    color: util.colors.soccer,
    name: 'Multiscale Maze',
    size: 1,
    run() {
      maze = new NoiseMaze({
        width: 32,
        height: 32,
        type: 'multiScale',
        fill: true,
      })
      maze.init()
    }
  }, {
    color: util.colors.siege,//util.mixColors(util.colors.gray, util.colors.black, 0.4),
    name: 'QuadTree (Not a maze)',
    size: 1,
    run() {
      maze = new QuadTree({
        x: 0,
        y: 0,
        width: 256,
        height: 256,
        capacity: 4,
      })
      let used = new Set
      for (let i = 0; i < 64; i++) {
        while (true != false) {
          let x = util.randomInt(256)
          let y = util.randomInt(256)
          let key = `${x},${y}`
          if (used.has(key)) continue
          used.add(key)
          maze.insert({ x, y })
          break
        }
      }
    }, 
  }, {
    color: util.colors.tag,
    name: 'Quad Tree Cave (WIP)',
    size: 1,
    run() {
      maze = new QuadTreeCave({ 
        width: 64, 
        height: 64,
        fill: true,
      })
      maze.init()
    }
  }, {
  color: util.colors.spacetdm,
  name: 'Marble Maze',
  size: 1,
  run() {
    maze = new NoiseMaze({
      width: 32,
      height: 32,
      type: 'marble',
      fill: true,
    })
    maze.init()
  }
}]

  
  let ratio = Math.abs(buttonZone.width - buttonZone.height)
  let textSize = util.clamp(ratio * 0.5, 25, 55)

  // Here for debug purposes. Don't uncomment unless you like seeing red lines
  //c.rect({ x: buttonZone.minX, y: buttonZone.minY, width: buttonZone.width, height: textSize * 2, stroke: '#ff0000', lineWidth: 2 })
  
  c.text({ x: buttonZone.centerX, y: buttonZone.minY + textSize * 1.5, size: textSize, text: 'Maze Stuff', lineWidth: 6 })

  let rowLength = 2
  
  let range = (buttonZone.height - textSize * 2) / fields.length
  let buttonHeight = range * 1.5 - range / fields.length
  
  let buttonWidth = (buttonZone.width - padding * (rowLength + 1)) / rowLength
  let y = -1
  for (let i = 0; i < fields.length; i++) {
    let x = i % rowLength
    if (i % rowLength === 0)
      y++
    Page.button({
      x: buttonZone.minX + padding + buttonWidth * 0.5 + buttonWidth * x + padding * x,
      y: buttonZone.minY + textSize * 2 + buttonHeight * 0.5 + buttonHeight * y + padding * y + padding,
      width: buttonWidth,
      height: buttonHeight,
      fill: fields[i].color,
      stroke: util.mixColors(fields[i].color, util.colors.black, 0.65),
      lineWidth: 6,
      text: fields[i].name,
      textSize: fields[i].size,
      clickable: fields[i].run,
      hover: fields[i].run,
    })
  }
  Page.display({
    x: displayZone.centerX,
    y: displayZone.centerY,
    width: !mobile || displayZone.height > displayZone.width ? displayZone.width : displayZone.height,
    height: !mobile || displayZone.height > displayZone.width ? displayZone.width : displayZone.height,
    size: maze.width ?? maze.map.width,
  })

  // Used for testing out mobile touch support
  //c.circle({ x: mouse.x, y: mouse.y, radius: 100, fill: '#ff0000' })
  
  // Draw the maze (or quad tree. I should make a better way of differentiating the two but eh fuck it who cares)
  if (maze.boundaries) {
    maze.visualize()
  } else {
    maze.map.placeWalls()  
  }
  
  
  Page.refreshCanvas()
  requestAnimationFrame(appLoop)
}

requestAnimationFrame(appLoop)
