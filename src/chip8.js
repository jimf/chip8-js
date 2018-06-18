const fonts = [
  0xF0, 0x90, 0x90, 0x90, 0xF0, // 0
  0x20, 0x60, 0x20, 0x20, 0x70, // 1
  0xF0, 0x10, 0xF0, 0x80, 0xF0, // 2
  0xF0, 0x10, 0xF0, 0x10, 0xF0, // 3
  0x90, 0x90, 0xF0, 0x10, 0x10, // 4
  0xF0, 0x80, 0xF0, 0x10, 0xF0, // 5
  0xF0, 0x80, 0xF0, 0x90, 0xF0, // 6
  0xF0, 0x10, 0x20, 0x40, 0x40, // 7
  0xF0, 0x90, 0xF0, 0x90, 0xF0, // 8
  0xF0, 0x90, 0xF0, 0x10, 0xF0, // 9
  0xF0, 0x90, 0xF0, 0x90, 0x90, // A
  0xE0, 0x90, 0xE0, 0x90, 0xE0, // B
  0xF0, 0x80, 0x80, 0x80, 0xF0, // C
  0xE0, 0x90, 0x90, 0x90, 0xE0, // D
  0xF0, 0x80, 0xF0, 0x80, 0xF0, // E
  0xF0, 0x80, 0xF0, 0x80, 0x80 //  F
]

function Chip8 (opts) {
  opts = opts || {}
  this.cyclesPerSecond = 60 || opts.cyclesPerSecond
  this.reset()
}

Chip8.prototype.reset = function reset () {
  // 4K (4096 bytes) of memory address space.
  this.memory = new Uint8Array(4096)

  // 16 general purpose 8-bit registers.
  this.V = new Uint8Array(16)

  // Return stack, used for subroutines.
  this.stack = new Array(16)

  // Display state.
  this.display = (new Array(64 * 32)).fill(0)

  // Key-pressed state.
  this.keys = (new Array(16)).fill(false)

  // Memory address register.
  this.I = 0

  // Program counter. Stores the currently executing address.
  this.pc = 512

  // Stack pointer.
  this.sp = 0

  // Delay timer register.
  this.dt = 0

  // Sound timer register.
  this.st = 0

  // Wait flag. Blocks execution if set.
  this.wait = null

  // Load font set.
  fonts.forEach((v, idx) => {
    this.memory[idx] = v
  })
}

Chip8.prototype.load = function load (buffer) {
  if (buffer.length > 4096 - 512) {
    throw new Error('Program too large to fit in memory')
  }
  for (let i = 0, len = buffer.length; i < len; i += 1) {
    this.memory[i + 512] = buffer[i]
  }
}

Chip8.prototype.next = function next () {
  const opcode = this.memory[this.pc] << 8 | this.memory[this.pc + 1]
  this.pc += 2
  return opcode
}

Chip8.prototype.updateTimers = function updateTimers (msSinceLastUpdate) {
  const cyclesPassed = Math.round(this.cyclesPerSecond / 1000 * msSinceLastUpdate)
  if (this.dt > 0) {
    this.dt = Math.max(0, this.dt - cyclesPassed)
  }
  if (this.st > 0) {
    this.st = Math.max(0, this.st - cyclesPassed)
  }
}

Chip8.prototype.keyDown = function keyDown (idx) {
  this.keys[idx] = true
}

Chip8.prototype.keyUp = function keyUp (idx) {
  this.keys[idx] = false
}

/**
 * 0nnn - SYS addr
 * Jump to a given address.
 */
Chip8.prototype.sys = function sys (nnn) {
  /* Ignored in modern interpreters. Should this throw? */
  throw new Error('stop')
}

/**
 * 00E0 - CLS
 * Clear the display.
 */
Chip8.prototype.clear = function clear () {
  for (let i = 0; i < this.display.length; i += 1) {
    this.display[i] = 0
  }
}

/**
 * 00EE - RET
 * Return from a subroutine.
 */
Chip8.prototype.ret = function ret () {
  if (this.sp === 0) {
    throw new Error('Stack underflow error')
  }
  this.sp -= 1
  this.pc = this.stack[this.sp]
}

/**
 * 1nnn - JP addr
 * Jump to location nnn.
 */
Chip8.prototype.jump = function jump (nnn) {
  this.pc = nnn
}

/**
 * 2nnn - CALL addr
 * Call subroutine at nnn.
 */
Chip8.prototype.call = function call (nnn) {
  if (this.sp >= this.stack.length) {
    throw new Error('Stack overflow error')
  }
  this.stack[this.sp] = this.pc // FIXME: is this correct? Or should it push pc - 2?
  this.sp += 1
  this.pc = nnn
}

/**
 * 3xkk - SE Vx, byte
 * Skip next instruction if Vx = kk.
 */
Chip8.prototype.skipIfEqual = function skipIfEqual (x, kk) {
  if (this.V[x] === kk) {
    this.pc += 2
  }
}

/**
 * 4xkk - SNE Vx, byte
 * Skip next instruction if Vx != kk.
 */
Chip8.prototype.skipIfNotEqual = function skipIfNotEqual (x, kk) {
  if (this.V[x] !== kk) {
    this.pc += 2
  }
}

/**
 * 5xy0 - SE Vx, Vy
 * Skip next instruction if Vx = Vy.
 * The interpreter compares register Vx to register Vy, and if they are equal, increments the program counter by 2.
 */
Chip8.prototype.skipIfXY = function skipIfXY (x, y) {
  if (this.V[x] === this.V[y]) {
    this.pc += 2
  }
}

/**
 * 6xkk - LD Vx, byte
 * Set Vx = kk.
 */
Chip8.prototype.loadVx = function loadVx (x, kk) {
  this.V[x] = kk
}

/**
 * 7xkk - ADD Vx, byte
 * Set Vx = Vx + kk.
 */
Chip8.prototype.add = function add (x, kk) {
  this.V[x] += kk
}

/**
 * 8xy0 - LD Vx, Vy
 * Set Vx = Vy.
 */
Chip8.prototype.loadVxVy = function loadVxVy (x, y) {
  this.V[x] = this.V[y]
}

/**
 * 8xy1 - OR Vx, Vy
 * Set Vx = Vx OR Vy.
 */
Chip8.prototype.orVxVy = function orVxVy (x, y) {
  this.V[x] |= this.V[y]
}

/**
 * 8xy2 - AND Vx, Vy
 * Set Vx = Vx AND Vy.
 */
Chip8.prototype.andVxVy = function andVxVy (x, y) {
  this.V[x] &= this.V[y]
}

/**
 * 8xy3 - XOR Vx, Vy
 * Set Vx = Vx XOR Vy.
 */
Chip8.prototype.xorVxVy = function xorVxVy (x, y) {
  this.V[x] ^= this.V[y]
}

/**
 * 8xy4 - ADD Vx, Vy
 * Set Vx = Vx + Vy, set VF = carry.
 */
Chip8.prototype.addVxVy = function addVxVy (x, y) {
  this.V[0xF] = (this.V[x] + this.V[y]) > 255 ? 1 : 0
  this.V[x] += this.V[y]
}

/**
 * 8xy5 - SUB Vx, Vy
 * Set Vx = Vx - Vy, set VF = NOT borrow.
 */
Chip8.prototype.subVxVy = function subVxVy (x, y) {
  this.V[0xF] = this.V[x] > this.V[y] ? 1 : 0
  this.V[x] -= this.V[y]
}

/**
 * 8xy6 - SHR Vx {, Vy}
 * Set Vx = Vx SHR 1.
 */
Chip8.prototype.shiftRight = function shiftRight (x) {
  this.V[0xF] = this.V[x] & 1
  this.V[x] >>= 1
}

/**
 * 8xy7 - SUBN Vx, Vy
 * Set Vx = Vy - Vx, set VF = NOT borrow.
 * If Vy > Vx, then VF is set to 1, otherwise 0. Then Vx is subtracted from Vy, and the results stored in Vx.
 */
Chip8.prototype.subnVxVy = function subnVxVy (x, y) {
  this.V[0xF] = this.V[y] > this.V[x] ? 1 : 0
  this.V[x] = this.V[y] - this.V[x]
}

/**
 * 8xyE - SHL Vx {, Vy}
 * Set Vx = Vx SHL 1.
 */
Chip8.prototype.shiftLeft = function shiftLeft (x) {
  this.V[0xF] = this.V[x] >> 7
  this.V[x] <<= 1
}

/**
 * 9xy0 - SNE Vx, Vy
 * Skip next instruction if Vx != Vy.
 */
Chip8.prototype.skipIfNotEqualVxVy = function skipIfNotEqualVxVy (x, y) {
  if (this.V[x] !== this.V[y]) {
    this.pc += 2
  }
}

/**
 * Annn - LD I, addr
 * Set I = nnn
 */
Chip8.prototype.loadI = function loadI (nnn) {
  this.I = nnn
}

/**
 * Bnnn - JP V0, addr
 * Jump to location nnn + V0.
 * The program counter is set to nnn plus the value of V0.
 */
Chip8.prototype.jumpV0 = function jumpV0 (nnn) {
  this.pc = nnn + this.V[0]
}

/**
 * Cxkk - RND Vx, byte
 * Set Vx = random byte AND kk.
 */
Chip8.prototype.random = function random (x, kk) {
  this.V[x] = Math.floor(Math.random() * 256) & kk
}

/**
 * Dxyn - DRW Vx, Vy, nibble
 * Display n-byte sprite starting at memory location I at (Vx, Vy), set VF = collision.
 */
Chip8.prototype.draw = function draw (x, y, n) {
  this.V[0xF] = 0
  for (let row = 0; row < n; row += 1) {
    const px = this.memory[this.I + row]
    for (let col = 0; col < 8; col += 1) {
      if ((px & (0x80 >> col)) !== 0) {
        const idx = (this.V[x] + col + ((this.V[y] + row) * 64))
        if (this.display[idx] === 1) {
          this.V[0xF] = 1
        }
        this.display[idx] ^= 1
      }
    }
  }
}

/**
 * Ex9E - SKP Vx
 * Skip next instruction if key with the value of Vx is pressed.
 */
Chip8.prototype.skipIfPressed = function skipIfPressed (x) {
  if (this.keys[this.V[x]] === true) {
    this.pc += 2
  }
}

/**
 * ExA1 - SKNP Vx
 * Skip next instruction if key with the value of Vx is not pressed.
 */
Chip8.prototype.skipIfNotPressed = function skipIfNotPressed (x) {
  if (this.keys[this.V[x]] !== true) {
    this.pc += 2
  }
}

/**
 * Fx07 - LD Vx, DT
 * Set Vx = delay timer value.
 */
Chip8.prototype.loadVxDt = function loadVxDt (x) {
  this.V[x] = this.dt
}

/**
 * Fx0A - LD Vx, K
 * Wait for a key press, store the value of the key in Vx.
 * All execution stops until a key is pressed, then the value of that key
 * is stored in Vx.
 */
Chip8.prototype.loadVxK = function loadVxK (x) {
  this.wait = x
}

/**
 * Fx15 - LD DT, Vx
 * Set delay timer = Vx.
 */
Chip8.prototype.delay = function delay (x) {
  this.dt = this.V[x]
}

/**
 * Fx18 - LD ST, Vx
 * Set sound timer = Vx.
 * ST is set equal to the value of Vx.
 */
Chip8.prototype.loadSoundTimer = function loadSoundTimer (x) {
  this.st = this.V[x]
}

/**
 * Fx1E - ADD I, Vx
 * Set I = I + Vx.
 */
Chip8.prototype.addI = function addI (x) {
  this.I += this.V[x]
}

/**
 * Fx29 - LD F, Vx
 * Set I = location of sprite for digit Vx.
 */
Chip8.prototype.loadF = function loadF (x) {
  // Starts at 0. 5 bytes per sprite.
  this.I = this.V[x] * 5
}

/**
 * Fx33 - LD B, Vx
 * Store BCD representation of Vx in memory locations I, I+1, and I+2.
 * The interpreter takes the decimal value of Vx, and places the hundreds digit
 * in memory at location in I, the tens digit at location I+1, and the ones
 * digit at location I+2.
 */
Chip8.prototype.bcd = function bcd (x) {
  const mod10 = this.V[x] % 10
  const mod100 = this.V[x] % 100
  this.memory[this.I] = (this.V[x] % 1000 - mod100) / 100
  this.memory[this.I + 1] = (mod100 - mod10) / 10
  this.memory[this.I + 2] = mod10
}

/**
 * Fx55 - LD [I], Vx
 * Store registers V0 through Vx in memory starting at location I.
 * The interpreter copies the values of registers V0 through Vx into memory,
 * starting at the address in I.
 */
Chip8.prototype.saveRegs = function saveRegs (x) {
  for (let i = 0; i <= x; i += 1) {
    this.memory[this.I + i] = this.V[i]
  }
}

/**
 * Fx65 - LD Vx, [I]
 * Read registers V0 through Vx from memory starting at location I.
 * The interpreter reads values from memory starting at location I into
 * registers V0 through Vx.
 */
Chip8.prototype.loadRegs = function loadRegs (x) {
  const end = this.V[x]
  for (let i = 0; i <= end; i += 1) {
    this.V[i] = this.memory[this.I + i]
  }
}

module.exports = Chip8
