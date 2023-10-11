import Canvas from './canvas.js'

const canvas = document.getElementById('canvas')
const c = new Canvas(canvas)

// Hurr durr hexidecimals go burr
export const mixColors = (hex1, hex2, weight2 = 0.5) => {
  if (weight2 <= 0) return hex1
  if (weight2 >= 1) return hex2
  let weight1 = 1 - weight2
  let int1 = parseInt(hex1.slice(1, 7), 16)
  let int2 = parseInt(hex2.slice(1, 7), 16)
  let int =
    (((int1 & 0xff0000) * weight1 + (int2 & 0xff0000) * weight2) & 0xff0000) |
    (((int1 & 0x00ff00) * weight1 + (int2 & 0x00ff00) * weight2) & 0x00ff00) |
    (((int1 & 0x0000ff) * weight1 + (int2 & 0x0000ff) * weight2) & 0x0000ff)
  return '#' + int.toString(16).padStart(6, '0')
}

export const bounds = ({ x = 0, y = 0, width = 0, height = 0, mousePosition = { x: 0, y: 0, } }) => {
  // Uncomment this to view an outline of the bounds. Useful for debugging unless you like red lines
  //c.rect({ x: x + width * -0.5, y: y + height * -0.5, width, height, stroke: '#ff4000' }) // For debugging
  return mousePosition.x >= x + width * -0.5 && mousePosition.x < x + width * 0.5 && mousePosition.y >= y + height * -0.5 && mousePosition.y < y + height * 0.5
}

export const clamp = (value, min, max) => Math.min(Math.max(value, min), max)

export const randomInt = i => Math.floor(Math.random() * Math.floor(i))

export const randomRange = (min, max) => Math.random() * (max - min) + min

// Not used. Will be needed for debug mode
export const sleep = ms => new Promise(r => setTimeout(r, ms))

// TODO: finish labelling all of these..
export const colors = {
  _: '#7adbbc',
  _: '#b9e87e',
  _: '#e7896d',
  _: '#fdf380',
  _: '#b58efd',
  _: '#ef99c3',
  _: '#e8ebf7',
  _: '#aa9f9e',
  white: '#ffffff',
  black: '#484848',
  blue: '#3ca4cb',
  green: '#8abc3f',
  red: '#e03e41',
  yellow: '#efc74b',
  purple: '#8d6adf',
  pink: '#cc669c',
  gray: '#a7a7af',
  _: '#726f6f',
  lgray: '#dbdbdb',
  pureBlack: '#000000',
  cream: '#ffdbac',
  mgreen: '#567d46',
  agreen: '#8abc3f',
  burple: '#7289da',
  cherry: '#ff0000',
  redorang: '#FF5700',
  tangerine: '#f96855',
  

  ffa: '#e44d2e',
  tdm2: '#007ba7',
  tdm4: '#856088',
  open2tdm: '#3c7178',
  opentdm: '#679267',
  maze: '#ff9900',
  maze2tdm: '#0294c1',
  maze4tdm: '#a64d79',
  openmazetdm: '#351c75',
  domination: '#fa8072',
  mothership: '#de6fa1',
  portalmothership: '#de9dbd',
  portal4tdm: '#8e7cc3',
  portal4tdmmaze: '#9344bb',
  siege: '#8db600',
  assault: '#6d9eeb',
  spacetdm: '#14e682',
  tag: '#a3d193',
  soccer: '#19cbbf',
  squads: '#ff7800',
  duos: '#e9aa57',
  teamermaze: '#90a8b5',
}
