const Chip8 = require('../')

const chip8 = Chip8()
const el = {
  canvas: document.getElementById('canvas'),
  memory: document.querySelector('.memory-pane'),
  vm: document.querySelector('.state-pane')
}
const ctx = el.canvas.getContext('2d')
let canvasW
let canvasH

function updateDims () {
  canvasW = Math.floor(el.canvas.clientWidth)
  canvasH = Math.floor(el.canvas.clientHeight)
}

function getRom (name) {
  return new Promise((resolve, reject) => {
    const req = new window.XMLHttpRequest()
    req.open('GET', `/roms/${name}`, true)
    req.responseType = 'arraybuffer'

    req.onload = function (e) {
      const buffer = req.response
      if (buffer) {
        resolve(new Uint8Array(buffer))
      } else {
        reject(new Error('Failed'))
      }
    }

    req.send(null)
  })
}

function formatHex2 (n) {
  return '#' + ('0' + n.toString(16).toUpperCase()).slice(-2)
}

function formatHex4 (n) {
  return '#' + ('000' + n.toString(16).toUpperCase()).slice(-4)
}

function renderDisplay (c8) {
  ctx.clearRect(0, 0, canvasW, canvasH)
  const spriteW = Math.round(canvasW / 64)
  const spriteH = Math.round(canvasH / 32)
  for (let i = 0, len = c8.vm.display.length; i < len; i += 1) {
    if (c8.vm.display[i] === 0) { continue }
    const x = i % 64
    const y = Math.floor(i / 64)
    ctx.fillRect(x * spriteW, y * spriteH, spriteW, spriteH)
  }
}

function renderMemory (c8) {
  const show = 15
  let start = Math.max(0, c8.vm.pc - 2)
  let end = Math.min(c8.vm.pc + ((show * 2) - 2), 4096)
  const result = []
  for (let i = start; i <= end; i += 2) {
    result.push(c8.disassemble(i))
  }
  el.memory.textContent = result.join('\n')
}

function renderVm (c8) {
  el.vm.textContent = `
V0 = ${formatHex2(c8.vm.V[0x0])}      DT = ${formatHex2(c8.vm.dt)}
V1 = ${formatHex2(c8.vm.V[0x1])}      ST = ${formatHex2(c8.vm.st)}
V2 = ${formatHex2(c8.vm.V[0x2])}
V3 = ${formatHex2(c8.vm.V[0x3])}       I = ${formatHex4(c8.vm.I)}
V4 = ${formatHex2(c8.vm.V[0x4])}
V5 = ${formatHex2(c8.vm.V[0x5])}      PC = ${formatHex4(c8.vm.pc)}
V6 = ${formatHex2(c8.vm.V[0x6])}      SP = ${formatHex2(c8.vm.sp)}
V7 = ${formatHex2(c8.vm.V[0x7])}
V8 = ${formatHex2(c8.vm.V[0x8])}
V9 = ${formatHex2(c8.vm.V[0x9])}
VA = ${formatHex2(c8.vm.V[0xA])}
VB = ${formatHex2(c8.vm.V[0xB])}
VC = ${formatHex2(c8.vm.V[0xC])}
VD = ${formatHex2(c8.vm.V[0xD])}
VE = ${formatHex2(c8.vm.V[0xE])}
VF = ${formatHex2(c8.vm.V[0xF])}
`.trim()
}

window.chip8 = chip8
getRom('TETRIS').then((rom) => {
  chip8.load(rom)
  updateDims()
  ctx.fillStyle = '#8F9185'
  ctx.strokeStyle = '#8F9185'

  function run () {
    chip8.step()
    renderDisplay(chip8)
    renderMemory(chip8)
    renderVm(chip8)
    if (window.STOP !== true) {
      window.requestAnimationFrame(run)
    }
  }

  run()
  // window.addEventListener('keydown', (e) => {
  //   if (e.which === 32) {
  //     run()
  //   }
  // })
})
