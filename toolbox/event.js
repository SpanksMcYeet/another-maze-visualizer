import Canvas from './canvas.js'

const canvas = document.getElementById('canvas')
const c = new Canvas(canvas)

export let mouse = {
  x: 0,
  y: 0,
  left: false,
  right: false,
}
// Not used. Might be useful later who knows
export let scroll = 0

canvas.addEventListener('click', () => {
  mouse.left = true
})
canvas.addEventListener('touchstart', () => {
  mouse.left = true
})
canvas.addEventListener('contextmenu', e => {
  // Lets not allow right click to open an ugly menu
  e.preventDefault()
  mouse.left = true
})
canvas.addEventListener('mousemove', e => {
  mouse.x = e.clientX * window.devicePixelRatio
  mouse.y = e.clientY * window.devicePixelRatio
})
// Not used
canvas.addEventListener('wheel', e => {
  e.preventDefault()
  scroll -= Math.sign(e.deltaY)
})

