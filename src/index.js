const Chip8 = require('./chip8')

function formatHex (n) {
  return n.toString(16).toUpperCase()
}

function formatOpcode (opcode) {
  return '0x' + ('000' + formatHex(opcode)).slice(-4)
}

function formatReg (reg) {
  return `V${formatHex(reg)}`
}

function formatKk (kk) {
  return `#${('0' + formatHex(kk)).slice(-2)}`
}

function formatNnn (nnn) {
  return `#${('00' + formatHex(nnn)).slice(-3)}`
}

function disassemble (vm, addr) {
  const opcode = vm.memory[addr] << 8 | vm.memory[addr + 1]
  const nnn = opcode & 0x0FFF
  const n = opcode & 0x000F
  const x = opcode >> 8 & 0x000F
  const y = opcode >> 4 & 0x000F
  const kk = opcode & 0x00FF
  const F000 = opcode & 0xF000
  const F00F = opcode & 0xF00F
  const F0FF = opcode & 0xF0FF

  switch (true) {
    case F0FF === 0x00E0: return `${formatOpcode(addr)} - CLS`
    case F0FF === 0x00EE: return `${formatOpcode(addr)} - RET`
    case F000 === 0x0000: return `${formatOpcode(addr)} - SYS  ${formatNnn(nnn)}`
    case F000 === 0x1000: return `${formatOpcode(addr)} - JP   ${formatNnn(nnn)}`
    case F000 === 0x2000: return `${formatOpcode(addr)} - CALL ${formatNnn(nnn)}`
    case F000 === 0x3000: return `${formatOpcode(addr)} - SE   ${formatReg(x)}, ${formatKk(kk)}`
    case F000 === 0x4000: return `${formatOpcode(addr)} - SNE  ${formatReg(x)}, ${formatKk(kk)}`
    case F00F === 0x5000: return `${formatOpcode(addr)} - SE   ${formatReg(x)}, ${formatReg(y)}`
    case F000 === 0x6000: return `${formatOpcode(addr)} - LD   ${formatReg(x)}, ${formatKk(kk)}`
    case F000 === 0x7000: return `${formatOpcode(addr)} - ADD  ${formatReg(x)}, ${formatKk(kk)}`
    case F00F === 0x8000: return `${formatOpcode(addr)} - LD   ${formatReg(x)}, ${formatReg(y)}`
    case F00F === 0x8001: return `${formatOpcode(addr)} - OR   ${formatReg(x)}, ${formatReg(y)}`
    case F00F === 0x8002: return `${formatOpcode(addr)} - AND  ${formatReg(x)}, ${formatReg(y)}`
    case F00F === 0x8003: return `${formatOpcode(addr)} - XOR  ${formatReg(x)}, ${formatReg(y)}`
    case F00F === 0x8004: return `${formatOpcode(addr)} - ADD  ${formatReg(x)}, ${formatReg(y)}`
    case F00F === 0x8005: return `${formatOpcode(addr)} - SUB  ${formatReg(x)}, ${formatReg(y)}`
    case F00F === 0x8006: return `${formatOpcode(addr)} - SHR  ${formatReg(x)}`
    case F00F === 0x8007: return `${formatOpcode(addr)} - SUBN ${formatReg(x)}, ${formatReg(y)}`
    case F00F === 0x800E: return `${formatOpcode(addr)} - SHL  ${formatReg(x)}`
    case F00F === 0x9000: return `${formatOpcode(addr)} - SNE  ${formatReg(x)}, ${formatReg(y)}`
    case F000 === 0xA000: return `${formatOpcode(addr)} - LD   I, ${formatNnn(nnn)}`
    case F000 === 0xB000: return `${formatOpcode(addr)} - JP   V0, ${formatNnn(nnn)}`
    case F000 === 0xC000: return `${formatOpcode(addr)} - RND  ${formatReg(x)}, ${formatKk(kk)}`
    case F000 === 0xD000: return `${formatOpcode(addr)} - DRW  ${formatReg(x)}, ${formatReg(y)}, ${formatHex(n)}`
    case F0FF === 0xE09E: return `${formatOpcode(addr)} - SKP  ${formatReg(x)}`
    case F0FF === 0xE0A1: return `${formatOpcode(addr)} - SKNP ${formatReg(x)}`
    case F0FF === 0xF007: return `${formatOpcode(addr)} - LD   ${formatReg(x)}, DT`
    case F0FF === 0xF00A: return `${formatOpcode(addr)} - LD   ${formatReg(x)}, K`
    case F0FF === 0xF015: return `${formatOpcode(addr)} - LD   DT, ${formatReg(x)}`
    case F0FF === 0xF018: return `${formatOpcode(addr)} - LD   ST, ${formatReg(x)}`
    case F0FF === 0xF01E: return `${formatOpcode(addr)} - ADD  I, ${formatReg(x)}`
    case F0FF === 0xF029: return `${formatOpcode(addr)} - LD   F, ${formatReg(x)}`
    case F0FF === 0xF033: return `${formatOpcode(addr)} - LD   B, ${formatReg(x)}`
    case F0FF === 0xF055: return `${formatOpcode(addr)} - LD   [I], ${formatReg(x)}`
    case F0FF === 0xF065: return `${formatOpcode(addr)} - LD   ${formatReg(x)}, [I]`

    // Some ROMs (e.g., BLITZ) jump to odd-numbered addresses, leaving blips in
    // the address space. Disassembling should simply treat these invalid opcodes
    // as unknown, and leave the exception handling to the actual step logic.
    default: return `${formatOpcode(addr)} - ???`
  }
}

module.exports = function () {
  const vm = new Chip8()

  function step () {
    if (vm.wait !== null) { return }
    const opcode = vm.next()
    const nnn = opcode & 0x0FFF // Lowest 12 bits of instruction
    const n = opcode & 0x000F // Lowest 4 bits of the instruction
    const x = opcode >> 8 & 0x000F // Lowest 4 bits of the high byte of the instruction
    const y = opcode >> 4 & 0x000F // Upper 4 bits of the low byte of the instruction
    const kk = opcode & 0x00FF // Lowest 8 bits of the instruction

    switch (opcode & 0xF000) {
      case 0x0000:
        switch (kk) {
          case 0x00E0: vm.clear(); break
          case 0x00EE: vm.ret(); break
          default: vm.sys(nnn)
        }
        break
      case 0x1000: vm.jump(nnn); break
      case 0x2000: vm.call(nnn); break
      case 0x3000: vm.skipIfEqual(x, kk); break
      case 0x4000: vm.skipIfNotEqual(x, kk); break
      case 0x5000:
        switch (n) {
          case 0x0000: vm.skipIfXY(x, y); break
          default: throw new Error(`Invalid opcode: ${formatOpcode(opcode)}`)
        }
        break
      case 0x6000: vm.loadVx(x, kk); break
      case 0x7000: vm.add(x, kk); break
      case 0x8000:
        switch (n) {
          case 0x0000: vm.loadVxVy(x, y); break
          case 0x0001: vm.orVxVy(x, y); break
          case 0x0002: vm.andVxVy(x, y); break
          case 0x0003: vm.xorVxVy(x, y); break
          case 0x0004: vm.addVxVy(x, y); break
          case 0x0005: vm.subVxVy(x, y); break
          case 0x0006: vm.shiftRight(x); break
          case 0x0007: vm.subnVxVy(x, y); break
          case 0x000E: vm.shiftLeft(x, y); break
          default: throw new Error(`Invalid opcode: ${formatOpcode(opcode)}`)
        }
        break
      case 0x9000:
        switch (n) {
          case 0x0000: vm.skipIfNotEqualVxVy(x, y); break
          default: throw new Error(`Invalid opcode: ${formatOpcode(opcode)}`)
        }
        break
      case 0xA000: vm.loadI(nnn); break
      case 0xB000: vm.jumpV0(nnn); break
      case 0xC000: vm.random(x, kk); break
      case 0xD000: vm.draw(x, y, n); break
      case 0xE000:
        switch (kk) {
          case 0x009E: vm.skipIfPressed(x); break
          case 0x00A1: vm.skipIfNotPressed(x); break
          default: throw new Error(`Invalid opcode: ${formatOpcode(opcode)}`)
        }
        break
      case 0xF000:
        switch (kk) {
          case 0x0007: vm.loadVxDt(x); break
          case 0x000A: vm.loadVxK(x); break
          case 0x0015: vm.delay(x); break
          case 0x0018: vm.loadSoundTimer(x); break
          case 0x001E: vm.addI(x); break
          case 0x0029: vm.loadF(x); break
          case 0x0033: vm.bcd(x); break
          case 0x0055: vm.saveRegs(x); break
          case 0x0065: vm.loadRegs(x); break
          default: throw new Error(`Invalid opcode: ${formatOpcode(opcode)}`)
        }
        break

      default: throw new Error(`Invalid opcode: ${formatOpcode(opcode)}`)
    }
  }

  function load (buffer) {
    vm.load(buffer)
  }

  return {
    vm: vm,
    step: step,
    load: load,
    disassemble: disassemble.bind(null, vm),
    keyDown (key) {
      vm.keyDown(key)
    },
    keyUp (key) {
      vm.keyUp(key)
    }
  }
}
