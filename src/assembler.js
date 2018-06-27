const Scanner = require('./scanner')

function SymbolTable () {
  this.symbols = {}
  this.unresolved = {}
}

SymbolTable.prototype.has = function has (name) {
  return Object.prototype.hasOwnProperty.call(this.symbols, name)
}

SymbolTable.prototype.add = function add (name, value) {
  if (this.has(name)) {
    throw new Error(`Symbol ${name} already defined`)
  }
  this.symbols[name] = value
  if (Object.prototype.hasOwnProperty.call(this.unresolved, name)) {
    this.unresolved[name].forEach((callback) => {
      callback(value)
    })
    delete this.unresolved[name]
  }
}

SymbolTable.prototype.lookup = function lookup (name, callback) {
  if (this.has(name)) {
    callback(this.symbols[name])
  } else {
    this.unresolved[name] = this.unresolved[name] || []
    this.unresolved[name].push(callback)
  }
}

SymbolTable.prototype.unresolvedSymbols = function unresolvedSymbols () {
  return Object.keys(this.unresolved)
}

module.exports = function (input) {
  const rom = new Uint8Array(0x1000 - 0x200)
  const labels = new SymbolTable()
  const tokens = (function () {
    const scanner = Scanner(input)
    const ts = []
    let token = scanner.nextToken()
    while (token !== null) {
      ts.push(token)
      token = scanner.nextToken()
    }
    return ts
  }())
  let pos = 0
  let pc = 0

  function nextToken () {
    const token = tokens[pos]
    pos += 1
    return token
  }

  function match (type) {
    return (tokens[pos] && tokens[pos].type === type) ? nextToken() : false
  }

  function emit (vals) {
    vals.forEach((val) => {
      rom[pc] = val
      pc += 1
    })
  }

  function emitWithLabel (labelName, callback) {
    const currPc = pc
    emit([0, 0])
    labels.lookup(labelName, (val) => {
      const result = callback(val)
      rom[currPc] = result[0]
      rom[currPc + 1] = result[1]
    })
  }

  function assemble () {
    lines()
    const unresolved = labels.unresolvedSymbols()
    if (unresolved.length) {
      throw new Error(`Unresolved symbols: ${unresolved.join(', ')}`)
    }
    return rom.slice(0, pc)
  }

  function lines () {
    while (pos < tokens.length) {
      line()
    }
  }

  function line () {
    label()
    const inst = match('Instruction')
    const args = arglist()
    const arg0 = args[0] && args[0].value
    const arg1 = args[1] && args[1].value
    const arg2 = args[2] && args[2].value
    const sig = `${inst.value} ${args.map(a => a.type).join(', ')}`.trim()

    switch (sig) {
      case 'CLS': emit([0x00, 0xE0]); break
      case 'RET': emit([0x00, 0xEE]); break
      case 'SYS Literal': emit([arg0 >> 8, arg0 & 0xFF]); break
      case 'SYS Identifier': emitWithLabel(arg0, addr => [addr >> 8, addr & 0xFF]); break
      case 'JP Literal': emit([0x10 | (arg0 >> 8), arg0 & 0xFF]); break
      case 'JP Identifier': emitWithLabel(arg0, addr => [0x10 | (addr >> 8), addr & 0xFF]); break
      case 'JP V, Literal':
        if (arg0 !== 0) {
          throw new Error('Parse error: unexpected token')
        }
        emit([0xB0 | (arg1 >> 8), arg1 & 0xFF])
        break
      case 'JP V, Identifier': {
        if (arg0 !== 0) {
          throw new Error('Parse error: unexpected token')
        }
        emitWithLabel(arg1, addr => [0xB0 | (addr >> 8), addr & 0xFF])
        break
      }
      case 'CALL Literal': emit([0x20 | (arg0 >> 8), arg0 & 0xFF]); break
      case 'CALL Identifier': emitWithLabel(arg0, addr => [0x20 | (addr >> 8), addr & 0xFF]); break
      case 'SE V, Literal': emit([0x30 | arg0, arg1]); break
      case 'SE V, V': emit([0x50 | arg0, arg1 << 4]); break
      case 'SNE V, Literal': emit([0x40 | arg0, arg1]); break
      case 'SNE V, V': emit([0x90 | arg0, arg1 << 4]); break
      case 'LD V, Literal': emit([0x60 | arg0, arg1]); break
      case 'LD V, V': emit([0x80 | arg0, arg1 << 4]); break
      case 'LD I, Literal': emit([0xA0 | (arg1 >> 8), arg1 & 0xFF]); break
      case 'LD I, Identifier': emitWithLabel(arg1, addr => [0xA0 | (addr >> 8), addr & 0xFF]); break
      case 'LD V, DT': emit([0xF0 | arg0, 0x07]); break
      case 'LD V, K': emit([0xF0 | arg0, 0x0A]); break
      case 'LD DT, V': emit([0xF0 | arg1, 0x15]); break
      case 'LD ST, V': emit([0xF0 | arg1, 0x18]); break
      case 'LD F, V': emit([0xF0 | arg1, 0x29]); break
      case 'LD B, V': emit([0xF0 | arg1, 0x33]); break
      case 'LD EffectiveAddress, V': emit([0xF0 | arg1, 0x55]); break
      case 'LD V, EffectiveAddress': emit([0xF0 | arg0, 0x65]); break
      case 'ADD V, Literal': emit([0x70 | arg0, arg1]); break
      case 'ADD V, V': emit([0x80 | arg0, (arg1 << 4) | 4]); break
      case 'ADD I, V': emit([0xF0 | arg1, 0x1E]); break
      case 'OR V, V': emit([0x80 | arg0, (arg1 << 4) | 1]); break
      case 'AND V, V': emit([0x80 | arg0, (arg1 << 4) | 2]); break
      case 'XOR V, V': emit([0x80 | arg0, (arg1 << 4) | 3]); break
      case 'SUB V, V': emit([0x80 | arg0, (arg1 << 4) | 5]); break
      case 'SHR V': emit([0x80 | arg0, 0x06]); break
      case 'SUBN V, V': emit([0x80 | arg0, (arg1 << 4) | 7]); break
      case 'SHL V': emit([0x80 | arg0, 0x0E]); break
      case 'RND V, Literal': emit([0xC0 | arg0, arg1]); break
      case 'DRW V, V, Literal': emit([0xD0 | arg0, (arg1 << 4) | arg2]); break
      case 'SKP V': emit([0xE0 | arg0, 0x9E]); break
      case 'SKNP V': emit([0xE0 | arg0, 0xA1]); break
      case 'BYTE Literal':
        if (arg0 > 0xFF) {
          throw new Error('Byte out of range')
        }
        emit([arg0])
        break
      default: throw new Error('Parse error: unexpected token')
    }
  }

  function label () {
    const lbl = match('Label')
    if (!lbl) { return false }
    labels.add(lbl.value, 0x200 | pc)
  }

  function arglist () {
    const args = []
    let token = arg()

    while (token) {
      args.push(token)
      token = match('Comma') && arg()
    }

    return args
  }

  function arg () {
    const currToken = tokens[pos]
    if (currToken && !['Label', 'Instruction', 'Comma'].includes(currToken.type)) {
      return nextToken()
    }
    return false
  }

  return assemble()
}
