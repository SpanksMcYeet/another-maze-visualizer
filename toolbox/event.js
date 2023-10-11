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
canvas.addEventListener('touchstart', e => {
  mouse.left = true
  mouse.x = e.touches[0].clientX
  mouse.y = e.touches[0].clientY
  mouse.left = false
})
canvas.addEventListener('touchend', () => {
  mouse.left = false
})
canvas.addEventListener('touchmove', e => {
  mouse.x = e.touches[0].clientX
  mouse.y = e.touches[0].clientY
})
canvas.addEventListener('contextmenu', e => {
  // Lets not allow right click to open an ugly menu
  e.preventDefault()
  mouse.left = true
})
canvas.addEventListener('mousemove', e => {
  mouse.x = e.clientX
  mouse.y = e.clientY
})
// Not used
canvas.addEventListener('wheel', e => {
  e.preventDefault()
  scroll -= Math.sign(e.deltaY)
})

