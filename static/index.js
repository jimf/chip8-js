const Chip8 = require('../')
const KeyboardInput = require('./keyboard_input')
const Router = require('./router')
const roms = require('./rom_data')

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

function CanvasPanel (el) {
  const ctx = el.getContext('2d')
  let canvasW
  let canvasH

  ctx.fillStyle = '#8F9185'
  ctx.strokeStyle = '#8F9185'

  function render (c8) {
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

  function updateDims () {
    canvasW = Math.floor(el.clientWidth)
    canvasH = Math.floor(el.clientHeight)
  }

  return {
    render: render,
    updateDims: updateDims
  }
}

function MemoryPanel (el) {
  function render (c8) {
    const show = 15
    let start = Math.max(512, c8.vm.pc - 2)
    let end = Math.min(c8.vm.pc + ((show * 2) - 2), 4096)
    const result = []
    for (let i = start; i <= end; i += 2) {
      result.push(c8.disassemble(i))
    }
    el.textContent = result.join('\n')
  }

  return {
    render: render
  }
}

function OutputPanel (el) {
  function render (game, rom, kb) {
    const gameHelp = Object.keys(game.keys).map((k) => {
      const help = game.keys[k].toUpperCase()
      const keys = kb.keyNames(k)
      return `  ${keys.join('/')}: ${help}`
    }).join('\n')
    el.textContent = `
LOADING ${game.name}
${rom.byteLength} BYTES

KEYS:
${gameHelp}

STARTING PROGRAM;
`.trim()
  }

  return {
    render: render
  }
}

function VmPanel (el) {
  function formatHex2 (n) {
    return '#' + ('0' + n.toString(16).toUpperCase()).slice(-2)
  }

  function formatHex4 (n) {
    return '#' + ('000' + n.toString(16).toUpperCase()).slice(-4)
  }

  function render (c8) {
    el.textContent = `
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

  return {
    render: render
  }
}

const canvasPanel = CanvasPanel(document.getElementById('canvas'))
const memoryPanel = MemoryPanel(document.querySelector('.memory-pane'))
const outputPanel = OutputPanel(document.querySelector('.output-pane__output'))
const vmPanel = VmPanel(document.querySelector('.state-pane'))

function loadGame (name) {
  const game = roms[name]
  const chip8 = Chip8()
  const kb = KeyboardInput(chip8)

  function renderVm () {
    canvasPanel.render(chip8)
    memoryPanel.render(chip8)
    vmPanel.render(chip8)
  }

  function run (start) {
    if (window.PAUSED !== true) {
      chip8.step()
      renderVm()
    }
    if (window.STOP !== true) {
      window.requestAnimationFrame(run)
    }
  }

  function onKeydown (e) {
    kb.onKeydown(e)
    if (e.which === 32) {
      chip8.step()
      renderVm()
    }
  }

  function onKeyup (e) {
    kb.onKeydown(e)
  }

  window.addEventListener('keydown', onKeydown)
  window.addEventListener('keyup', onKeyup)

  getRom(game.name).then((rom) => {
    chip8.load(rom)
    canvasPanel.updateDims()
    renderVm()
    outputPanel.render(game, rom, kb)
    run()
  })
}

const router = Router()
router.route(/^\/([A-Z]+)$/, loadGame)
router.start()
