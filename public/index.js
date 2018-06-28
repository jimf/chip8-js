const Chip8 = require('../')
const KeyboardInput = require('./keyboard_input')
const Router = require('./router')
const roms = require('./rom_data')
const boot = require('./c8/boot.c8')

const bootRom = Chip8.assemble(boot)

function throttle (callback, limit) {
  let wait = false
  return function () {
    if (!wait) {
      callback.apply(null, arguments)
      wait = true
      setTimeout(() => { wait = false }, limit)
    }
  }
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

function CanvasPanel (el) {
  const canvas = el.querySelector('canvas')
  const ctx = canvas.getContext('2d')
  let canvasW
  let canvasH

  function render (c8) {
    if (!c8) {
      ctx.clearRect(0, 0, canvasW, canvasH)
      return
    }

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

  function resize () {
    const elW = el.clientWidth
    const elH = el.clientHeight
    const dim = (elW / elH) < 2.14 ? elW : elH
    const newWidth = Math.max(dim - (dim % 64), 64)
    if (newWidth === canvasW) { return }
    canvasW = newWidth
    canvasH = canvasW / 2
    canvas.setAttribute('width', canvasW)
    canvas.setAttribute('height', canvasH)
    canvas.style.width = canvasW + 'px'
    canvas.style.height = canvasH + 'px'
    ctx.fillStyle = '#8F9185'
    ctx.strokeStyle = '#8F9185'
  }

  resize()

  return {
    render: render,
    resize: resize
  }
}

function MemoryPanel (el) {
  const show = 15
  let prevStart
  let prevEnd

  function render (c8) {
    if (!c8) {
      el.textContent = ''
      return
    }

    let start = Math.max(512, c8.vm.pc - 2)
    let end = Math.min(c8.vm.pc + ((show * 2) - 2), 4096)
    if (prevStart < c8.vm.pc && c8.vm.pc < prevEnd) {
      start = prevStart
      end = prevEnd
    }
    prevStart = start
    prevEnd = end

    const result = []
    for (let i = start; i <= end; i += 2) {
      result.push((i === c8.vm.pc ? '>' : ' ') + c8.disassemble(i))
    }
    el.textContent = result.join('\n')
  }

  return {
    render: render
  }
}

function OutputPanel (el) {
  const nav = el.querySelector('.output-pane__nav')
  const navList = el.querySelector('.output-pane__navlist')
  const output = el.querySelector('.output-pane__output')

  Object.keys(roms).forEach((name) => {
    const li = document.createElement('li')
    const a = document.createElement('a')
    a.setAttribute('href', `#/${name}`)
    a.textContent = name
    li.appendChild(a)
    navList.appendChild(li)
  })

  function renderIndex () {
    nav.style.display = 'block'
    output.textContent = ''
  }

  function renderGame (props) {
    const { romInfo, rom, kb } = props
    const romHelp = Object.keys(romInfo.keys).map((k) => {
      const help = romInfo.keys[k].toUpperCase()
      const keys = kb.keyNames(k)
      return `  ${keys.join('/')}: ${help}`
    }).join('\n')
    nav.style.display = 'none'
    output.textContent = `
LOADING ${romInfo.name}
${rom.byteLength} BYTES

KEYS:
${romHelp}

STARTING PROGRAM;
`.trim()
  }

  function render (props) {
    if (props && props.romInfo) {
      renderGame(props)
    } else {
      renderIndex()
    }
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
    if (!c8) {
      el.textContent = ''
      return
    }

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

function App () {
  const canvasPanel = CanvasPanel(document.querySelector('.display-pane'))
  const memoryPanel = MemoryPanel(document.querySelector('.memory-pane'))
  const outputPanel = OutputPanel(document.querySelector('.output-pane'))
  const vmPanel = VmPanel(document.querySelector('.state-pane'))
  const router = Router()
  const chip8 = Chip8()
  const kb = KeyboardInput(chip8)
  const events = {
    handleEvent (e) {
      const handler = this[`on${e.type}`]
      if (handler) {
        handler(e)
      }
    },
    handleResize: throttle((e) => {
      if (events.onresize) {
        events.onresize(e)
      }
    }, 250)
  }

  function runRom (romInfo, loadingRom) {
    let stopped = false
    let paused = false
    let prevRun = window.performance.now()
    let cycles = 0
    let timers = 0

    const renderVmState = throttle(() => {
      memoryPanel.render(chip8)
      vmPanel.render(chip8)
    }, 200)

    function renderVm () {
      canvasPanel.render(chip8)
      renderVmState(chip8)
    }

    function run (start) {
      if (stopped) { return }
      if (paused !== true) {
        const msSinceLastRun = start - prevRun
        cycles += 540 / 1000 * msSinceLastRun
        timers += 60 / 1000 * msSinceLastRun
        while (cycles >= 1) {
          chip8.step()
          cycles -= 1
        }
        while (timers >= 1) {
          chip8.vm.decrementTimers()
          timers -= 1
        }
        renderVm()
        prevRun = start
      }
      window.requestAnimationFrame(run)
    }

    events.onkeydown = (e) => {
      kb.onKeydown(e)
      if (e.which === 32) {
        chip8.step()
        renderVm()
      }
    }
    events.onkeyup = (e) => {
      kb.onKeyup(e)
    }
    events.onresize = () => {
      canvasPanel.resize()
    }

    loadingRom.then((rom) => {
      chip8.vm.reset()
      chip8.load(rom)
      renderVm()
      outputPanel.render({ romInfo, rom, kb })
      window.requestAnimationFrame(run)
    })

    return function unroute () {
      stopped = true
      delete events.onkeyup
      delete events.onkeydown
    }
  }

  function index () {
    return runRom(undefined, Promise.resolve(bootRom))
  }

  function loadGame (name) {
    return runRom(roms[name], getRom(name))
  }

  function start () {
    document.addEventListener('keydown', events)
    document.addEventListener('keyup', events)
    window.addEventListener('resize', events.handleResize)
    router.start()
  }

  router.route(new RegExp(`^/(${Object.keys(roms).join('|')})$`), loadGame)
  router.route(/^.*$/, index)

  return { start, chip8 }
}

const app = App()
app.start()
window.app = app
