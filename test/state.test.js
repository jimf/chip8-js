const test = require('tape')
const Chip8 = require('../')

function createOpcode (bytes) {
  const opcode = bytes[0] << 8 | bytes[1]
  return {
    opcode: opcode,
    nnn: opcode & 0x0FFF,
    n: opcode & 0x000F,
    x: opcode >> 8 & 0x000F,
    y: opcode >> 4 & 0x000F,
    kk: opcode & 0x00FF
  }
}

function rand (min, max) {
  return Math.round(Math.random() * (max - min) + min)
}

function uint8 (n) {
  if (n < 0) {
    return 256 + n
  } else if (n > 255) {
    return n % 256
  }
  return n
}

function uint16 (n) {
  if (n < 0) {
    return 0xFFF + n + 1
  } else if (n >= 0xFFF) {
    return n % (0xFFF + 1)
  }
  return n
}

function setup (opts) {
  const subject = Chip8()
  subject.load(opts.rom)
  return subject
}

test('state: 0nnn - SYS addr', (t) => {
  const subject = setup({ rom: [0x00, 0x00] })
  t.throws(subject.step.bind(subject), 'throws for unimplemented SYS instructions')
  t.end()
})

test('state: 00E0 - CLS', (t) => {
  const subject = setup({ rom: [0x00, 0xE0] })
  subject.vm.display[0] = 1
  subject.step()
  const isDisplayZeroed = subject.vm.display.every(x => x === 0)
  t.ok(isDisplayZeroed, 'clears display')
  t.end()
})

test('state: 1nnn - JP addr', (t) => {
  const bytes = [rand(0x10, 0x1F), rand(0x00, 0xFF)]
  const subject = setup({ rom: bytes })
  subject.step()
  t.equal(subject.vm.pc, createOpcode(bytes).nnn, 'jumps to given address')
  t.end()
})

test('state: 2nnn - CALL addr', (t) => {
  const bytes = [rand(0x20, 0x2F), rand(0x00, 0xFF)]
  const subject = setup({ rom: bytes })
  subject.step()
  t.equal(subject.vm.stack[0], 514, 'pushes PC to stack')
  t.equal(subject.vm.sp, 1, 'increments SP')
  t.equal(subject.vm.pc, createOpcode(bytes).nnn, 'sets PC to nnn')
  t.end()
})

test('state: 3xkk - SE Vx, byte', (t) => {
  const bytes = [rand(0x30, 0x3F), rand(0x00, 0xFF)]
  const opcode = createOpcode(bytes)
  let subject = setup({ rom: bytes })
  subject.vm.V[opcode.x] = opcode.kk
  subject.step()
  t.equal(subject.vm.pc, 516, 'skips next instruction if Vx == kk')

  subject = setup({ rom: bytes })
  subject.step()
  t.equal(subject.vm.pc, 514, 'does NOT skip next instruction if Vx != kk')
  t.end()
})

test('state: 4xkk - SNE Vx, byte', (t) => {
  const bytes = [rand(0x40, 0x4F), rand(0x00, 0xFF)]
  const opcode = createOpcode(bytes)
  let subject = setup({ rom: bytes })
  subject.vm.V[opcode.x] = opcode.kk
  subject.step()
  t.equal(subject.vm.pc, 514, 'skips next instruction if Vx != kk')

  subject = setup({ rom: bytes })
  subject.step()
  t.equal(subject.vm.pc, 516, 'does NOT skip next instruction if Vx == kk')
  t.end()
})

test('state: 5xy0 - SE Vx, Vy', (t) => {
  const bytes = [rand(0x50, 0x5F), rand(0x00, 0xFF)]
  bytes[1] -= bytes[1] % 16
  const opcode = createOpcode(bytes)
  let subject = setup({ rom: bytes })
  subject.vm.V[opcode.x] = 1
  subject.vm.V[opcode.y] = 1
  subject.step()
  t.equal(subject.vm.pc, 516, 'skips next instruction if Vx == Vy')

  if (opcode.x !== opcode.y) {
    subject = setup({ rom: bytes })
    subject.vm.V[opcode.x] = 1
    subject.vm.V[opcode.y] = 0
    subject.step()
    t.equal(subject.vm.pc, 514, 'does NOT skip next instruction if Vx != Vy')
  }
  t.end()
})

test('state: 6xkk - LD Vx, byte', (t) => {
  const bytes = [rand(0x60, 0x6F), rand(0x00, 0xFF)]
  const opcode = createOpcode(bytes)
  const subject = setup({ rom: bytes })
  subject.step()
  t.equal(subject.vm.V[opcode.x], opcode.kk, 'puts kk into Vx')
  t.end()
})

test('state: 7xkk - ADD Vx, byte', (t) => {
  const bytes = [rand(0x70, 0x7F), rand(0x00, 0xFE)]
  const opcode = createOpcode(bytes)
  const subject = setup({ rom: bytes })
  subject.vm.V[opcode.x] = 1
  subject.step()
  t.equal(subject.vm.V[opcode.x], opcode.kk + 1, 'adds kk to Vx')
  t.end()
})

test('state: 8xy0 - LD Vx, Vy', (t) => {
  const bytes = [rand(0x80, 0x8F), rand(0x00, 0xFF)]
  bytes[1] -= bytes[1] % 16
  const opcode = createOpcode(bytes)
  const subject = setup({ rom: bytes })
  subject.vm.V[opcode.y] = 42
  subject.step()
  t.equal(subject.vm.V[opcode.x], 42, 'stores value of Vy in Vx')
  t.end()
})

test('state: 8xy1 - OR Vx, Vy', (t) => {
  const bytes = [rand(0x80, 0x8F), rand(0x00, 0xFF)]
  bytes[1] -= ((bytes[1] % 16) - 1)
  const opcode = createOpcode(bytes)
  const subject = setup({ rom: bytes })
  subject.vm.V[opcode.x] = rand(0x00, 0xFF)
  subject.vm.V[opcode.y] = rand(0x00, 0xFF)
  const expected = subject.vm.V[opcode.x] | subject.vm.V[opcode.y]
  subject.step()
  t.equal(subject.vm.V[opcode.x], expected, 'sets Vx = Vx OR Vy')
  t.end()
})

test('state: 8xy2 - AND Vx, Vy', (t) => {
  const bytes = [rand(0x80, 0x8F), rand(0x00, 0xFF)]
  bytes[1] -= ((bytes[1] % 16) - 2)
  const opcode = createOpcode(bytes)
  const subject = setup({ rom: bytes })
  subject.vm.V[opcode.x] = rand(0x00, 0xFF)
  subject.vm.V[opcode.y] = rand(0x00, 0xFF)
  const expected = subject.vm.V[opcode.x] & subject.vm.V[opcode.y]
  subject.step()
  t.equal(subject.vm.V[opcode.x], expected, 'sets Vx = Vx AND Vy')
  t.end()
})

test('state: 8xy3 - XOR Vx, Vy', (t) => {
  const bytes = [rand(0x80, 0x8F), rand(0x00, 0xFF)]
  bytes[1] -= ((bytes[1] % 16) - 3)
  const opcode = createOpcode(bytes)
  const subject = setup({ rom: bytes })
  subject.vm.V[opcode.x] = rand(0x00, 0xFF)
  subject.vm.V[opcode.y] = rand(0x00, 0xFF)
  const expected = subject.vm.V[opcode.x] ^ subject.vm.V[opcode.y]
  subject.step()
  t.equal(subject.vm.V[opcode.x], expected, 'sets Vx = Vx XOR Vy')
  t.end()
})

test('state: 8xy4 - ADD Vx, Vy', (t) => {
  const bytes = [rand(0x80, 0x8F), rand(0x00, 0xFF)]
  bytes[1] -= ((bytes[1] % 16) - 4)
  const opcode = createOpcode(bytes)
  const subject = setup({ rom: bytes })
  subject.vm.V[opcode.x] = rand(0x00, 0xFF)
  subject.vm.V[opcode.y] = rand(0x00, 0xFF)
  // FIXME: flap exp/act: 235/250
  const expected = uint8(subject.vm.V[opcode.x] + subject.vm.V[opcode.y])
  const expectedCarry = (subject.vm.V[opcode.x] + subject.vm.V[opcode.y]) > 255
  subject.step()
  t.equal(subject.vm.V[opcode.x], expected, 'sets Vx = Vx + Vy')
  t.equal(subject.vm.V[0xF], expectedCarry ? 1 : 0, 'sets carry bit if addition exceeds 8 bits')
  t.end()
})

test('state: 8xy5 - SUB Vx, Vy', (t) => {
  const bytes = [rand(0x80, 0x8F), rand(0x00, 0xFF)]
  bytes[1] -= ((bytes[1] % 16) - 5)
  const opcode = createOpcode(bytes)
  const subject = setup({ rom: bytes })
  subject.vm.V[opcode.x] = rand(0x00, 0xFF)
  subject.vm.V[opcode.y] = rand(0x00, 0xFF)
  const expectedCarry = (subject.vm.V[opcode.x] > subject.vm.V[opcode.y]) ? 1 : 0
  const expected = uint8(subject.vm.V[opcode.x] - subject.vm.V[opcode.y])
  subject.step()
  // FIXME: This is flapping. Not sure why. (e.g., exp/act: 114/186, 49/137)
  t.equal(subject.vm.V[opcode.x], expected, 'sets Vx = Vx - Vy')
  t.equal(subject.vm.V[0xF], expectedCarry, 'sets carry bit if result is positive')
  t.end()
})

test('state: 8xy6 - SHR Vx {, Vy}', (t) => {
  const bytes = [rand(0x80, 0x8F), rand(0x00, 0xFF)]
  bytes[1] -= ((bytes[1] % 16) - 6)
  const opcode = createOpcode(bytes)
  const subject = setup({ rom: bytes })
  subject.vm.V[opcode.x] = rand(0x00, 0xFF)
  const expected = subject.vm.V[opcode.x] >> 1
  const expectedCarry = subject.vm.V[opcode.x] & 1
  subject.step()
  t.equal(subject.vm.V[opcode.x], expected, 'sets Vx = Vx >> 1')
  t.equal(subject.vm.V[0xF], expectedCarry, 'sets carry bit if lowest bit of previous Vx was 1')
  t.end()
})

test('state: 8xy7 - SUBN Vx, Vy', (t) => {
  const bytes = [rand(0x80, 0x8F), rand(0x00, 0xFF)]
  bytes[1] -= ((bytes[1] % 16) - 7)
  const opcode = createOpcode(bytes)
  const subject = setup({ rom: bytes })
  subject.vm.V[opcode.x] = rand(0x00, 0xFF)
  subject.vm.V[opcode.y] = rand(0x00, 0xFF)
  // FIXME: This is flapping. Not sure why. (e.g., exp/act: 35/117)
  const expected = uint8(subject.vm.V[opcode.y] - subject.vm.V[opcode.x])
  const expectedCarry = subject.vm.V[opcode.y] > subject.vm.V[opcode.x] ? 1 : 0
  subject.step()
  t.equal(subject.vm.V[opcode.x], expected, 'sets Vx = Vy - Vx')
  t.equal(subject.vm.V[0xF], expectedCarry, 'sets carry bit if result would be positive')
  t.end()
})

test('state: 8xyE - SHL Vx {, Vy}', (t) => {
  const bytes = [rand(0x80, 0x8F), rand(0x00, 0xFF)]
  bytes[1] -= ((bytes[1] % 16) - 0xE)
  const opcode = createOpcode(bytes)
  const subject = setup({ rom: bytes })
  subject.vm.V[opcode.x] = rand(0x00, 0xFF)
  const expected = uint8(subject.vm.V[opcode.x] << 1)
  const expectedCarry = subject.vm.V[opcode.x] >> 7
  subject.step()
  t.equal(subject.vm.V[opcode.x], expected, 'sets Vx = Vx / 2')
  t.equal(subject.vm.V[0xF], expectedCarry, 'sets carry bit if most significant bit of Vx is 1')
  t.end()
})

test('state: 9xy0 - SNE Vx, Vy', (t) => {
  const bytes = [rand(0x90, 0x9F), rand(0x00, 0xFF)]
  bytes[1] -= bytes[1] % 16
  const opcode = createOpcode(bytes)
  let subject = setup({ rom: bytes })
  subject.vm.V[opcode.x] = 1
  subject.vm.V[opcode.y] = 1
  subject.step()
  t.equal(subject.vm.pc, 514, 'does NOT skip next instruction if Vx == Vy')

  if (opcode.x !== opcode.y) {
    subject = setup({ rom: bytes })
    subject.vm.V[opcode.x] = 1
    subject.vm.V[opcode.y] = 0
    subject.step()
    t.equal(subject.vm.pc, 516, 'skips next instruction if Vx != Vy')
  }

  t.end()
})

test('state: Annn - LD I, addr', (t) => {
  const bytes = [rand(0xA0, 0xAF), rand(0x00, 0xFF)]
  const subject = setup({ rom: bytes })
  subject.step()
  t.equal(subject.vm.I, createOpcode(bytes).nnn, 'sets I = nnn')
  t.end()
})

test('state: Bnnn - JP V0, addr', (t) => {
  const bytes = [rand(0xB0, 0xBF), rand(0x00, 0xFF)]
  const opcode = createOpcode(bytes)
  const subject = setup({ rom: bytes })
  subject.vm.V[0] = rand(0x00, 0xFF)
  const expected = uint16(subject.vm.V[0] + opcode.nnn)
  subject.step()
  t.equal(subject.vm.pc, expected, 'sets PC = V0 + nnn')
  t.end()
})

test('state: Cxkk - RND Vx, byte', (t) => {
  const bytes = [rand(0xC0, 0xCF), rand(0x00, 0xFF)]
  const subject = setup({ rom: bytes })
  subject.step()
  // TODO: expose rng to make this testable
  t.pass('sets Vx to random byte AND kk')
  t.end()
})

test('state: Dxyn - DRW Vx, Vy, nibble', (t) => {
  const bytes = [0xD0, 0x03]
  const subject = setup({ rom: bytes })
  subject.vm.memory[subject.vm.I] = 0x3C
  subject.vm.memory[subject.vm.I + 1] = 0xC3
  subject.vm.memory[subject.vm.I + 2] = 0xFF
  subject.step()

  // Expected:
  //   ****
  // **    **
  // ********
  const expected = (new Array(2)).fill(0)
    .concat((new Array(4)).fill(1))
    .concat((new Array(64 - 6)).fill(0)) // End of first row
    .concat((new Array(2)).fill(1))
    .concat((new Array(4)).fill(0))
    .concat((new Array(2)).fill(1))
    .concat((new Array(64 - 8)).fill(0)) // End of second row
    .concat((new Array(8)).fill(1))
    .concat((new Array(64 - 8)).fill(0)) // End of third row
    .concat((new Array(64 * (32 - 3))).fill(0)) // Remaining rows

  t.deepEqual(subject.vm.display, expected, 'sets expected sprite state')
  t.end()
})

test('state: Ex9E - SKP Vx', (t) => {
  const bytes = [rand(0xE0, 0xEF), 0x9E]
  const opcode = createOpcode(bytes)
  let subject = setup({ rom: bytes })
  subject.vm.V[opcode.x] = rand(0, 0xF)
  subject.vm.keys[subject.vm.V[opcode.x]] = true
  subject.step()
  t.equal(subject.vm.pc, 516, 'skips next instruction if key with value of Vx is pressed')

  subject = setup({ rom: bytes })
  subject.vm.keys[subject.vm.V[opcode.x]] = false
  subject.step()
  t.equal(subject.vm.pc, 514, 'does NOT skip next instruction if key with value of Vx is not pressed')

  t.end()
})

test('state: ExA1 - SKNP Vx', (t) => {
  const bytes = [rand(0xE0, 0xEF), 0xA1]
  const opcode = createOpcode(bytes)
  let subject = setup({ rom: bytes })
  subject.vm.V[opcode.x] = rand(0, 0xF)
  subject.vm.keys[subject.vm.V[opcode.x]] = false
  subject.step()
  t.equal(subject.vm.pc, 516, 'skips next instruction if key with value of Vx is not pressed')

  subject = setup({ rom: bytes })
  subject.vm.keys[subject.vm.V[opcode.x]] = true
  subject.step()
  t.equal(subject.vm.pc, 514, 'does NOT skip next instruction if key with value of Vx is pressed')

  t.end()
})

test('state: Fx07 - LD Vx, DT', (t) => {
  const bytes = [rand(0xF0, 0xFF), 0x07]
  const opcode = createOpcode(bytes)
  const subject = setup({ rom: bytes })
  subject.vm.dt = rand(0, 0xFF)
  subject.step()
  t.equal(subject.vm.V[opcode.x], subject.vm.dt, 'sets Vx = DT')
  t.end()
})

test('state: Fx0A - LD Vx, K', (t) => {
  const bytes = [rand(0xF0, 0xFF), 0x0A]
  const opcode = createOpcode(bytes)
  const subject = setup({ rom: bytes })
  subject.step()
  t.equal(subject.vm.wait, opcode.x, 'sets wait with reference to Vx')
  t.end()
})

test('state: Fx15 - LD DT, Vx', (t) => {
  const bytes = [rand(0xF0, 0xFF), 0x15]
  const opcode = createOpcode(bytes)
  const subject = setup({ rom: bytes })
  subject.step()
  t.equal(subject.vm.dt, subject.vm.V[opcode.x], 'sets DT = Vx')
  t.end()
})

test('state: Fx18 - LD ST, Vx', (t) => {
  const bytes = [rand(0xF0, 0xFF), 0x18]
  const opcode = createOpcode(bytes)
  const subject = setup({ rom: bytes })
  subject.vm.V[opcode.x] = rand(0, 0xFF)
  subject.step()
  t.equal(subject.vm.st, subject.vm.V[opcode.x], 'sets ST = Vx')
  t.end()
})

test('state: Fx1E - ADD I, Vx', (t) => {
  const bytes = [rand(0xF0, 0xFF), 0x1E]
  const opcode = createOpcode(bytes)
  const subject = setup({ rom: bytes })
  subject.vm.I = rand(0, 0xFF)
  subject.vm.V[opcode.x] = rand(0, 0xFF)
  const expected = subject.vm.I + subject.vm.V[opcode.x]
  subject.step()
  t.equal(subject.vm.I, expected, 'sets I = I + Vx')
  t.end()
})

test('state: Fx29 - LD F, Vx', (t) => {
  const bytes = [rand(0xF0, 0xFF), 0x29]
  const opcode = createOpcode(bytes)
  const subject = setup({ rom: bytes })
  subject.vm.V[opcode.x] = rand(0, 0xF)
  subject.step()
  t.equal(subject.vm.I, subject.vm.V[opcode.x] * 5, 'sets I = sprite memory location for Vx')
  t.end()
})

test('state: Fx33 - LD B, Vx', (t) => {
  const bytes = [rand(0xF0, 0xFF), 0x33]
  const opcode = createOpcode(bytes)
  const subject = setup({ rom: bytes })
  subject.vm.V[opcode.x] = 123
  subject.step()
  t.equal(subject.vm.memory[subject.vm.I], 1, 'sets memory at I = hundreds digit of Vx as decimal')
  t.equal(subject.vm.memory[subject.vm.I + 1], 2, 'sets memory at I + 1 = tens digit of Vx as decimal')
  t.equal(subject.vm.memory[subject.vm.I + 2], 3, 'sets memory at I + 1 = ones digit of Vx as decimal')
  t.end()
})

test('state: Fx55 - LD [I], Vx', (t) => {
  const bytes = [rand(0xF0, 0xFF), 0x55]
  const opcode = createOpcode(bytes)
  const subject = setup({ rom: bytes })
  subject.vm.V[opcode.x] = rand(0, 0xE) + 1
  // FIXME: flaps. expected is undefined
  for (let i = 0; i <= subject.vm.V[opcode.x]; i += 1) {
    subject.vm.V[i] = rand(0, 0xFF)
  }
  subject.step()
  for (let i = 0; i <= subject.vm.V[opcode.x]; i += 1) {
    t.equal(subject.vm.memory[subject.vm.I + i], subject.vm.V[i])
  }
  t.end()
})

test('state: Fx65 - LD Vx, [I]', (t) => {
  const bytes = [rand(0xF0, 0xFF), 0x65]
  const opcode = createOpcode(bytes)
  const subject = setup({ rom: bytes })
  subject.vm.V[opcode.x] = rand(0, 0xE) + 1
  // FIXME: flaps. expected is undefined
  for (let i = 0; i <= subject.vm.V[opcode.x]; i += 1) {
    subject.vm.memory[subject.vm.I + i] = rand(0, 0xFF)
  }
  subject.step()
  for (let i = 0; i <= subject.vm.V[opcode.x]; i += 1) {
    t.equal(subject.vm.V[i], subject.vm.memory[subject.vm.I + i])
  }
  t.end()
})
