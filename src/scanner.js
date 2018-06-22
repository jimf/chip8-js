function Token (type, value) {
  this.type = type
  this.value = value
}

const instructions = new Set([
  'ADD',
  'AND',
  'CALL',
  'CLS',
  'DRW',
  'JP',
  'LD',
  'OR',
  'RET',
  'RND',
  'SE',
  'SHL',
  'SHR',
  'SKNP',
  'SKP',
  'SNE',
  'SUB',
  'SUBN',
  'SYS',
  'XOR'
])

module.exports = function (input) {
  let pos = 0
  let col = 1
  let c = input.charAt(pos)

  function read () {
    const result = c
    pos += 1
    if (c === '\n') {
      col = 0
    }
    col += 1
    c = input.charAt(pos)
    return result
  }

  function isLower (ch) {
    return ch >= 'a' && ch <= 'z'
  }

  function isUpper (ch) {
    return ch >= 'A' && ch <= 'Z'
  }

  function isDigit (ch) {
    return ch >= '0' && ch <= '9'
  }

  function skipWhitespace () {
    while (pos < input.length && (c === ' ' || c === '\t' || c === '\n')) { read() }
  }

  function skipComment () {
    while (pos < input.length && c !== '\n') { read() }
  }

  function scanHexLiteral () {
    read()
    let result = ''
    while (isDigit(c) || (c >= 'A' && c <= 'F') || (c >= 'a' && c <= 'f')) {
      result += read()
    }
    const value = parseInt(result, 16)
    if (!isNaN(value)) {
      return new Token('Literal', value)
    }
    throw new Error('Syntax error: Expected hex literal')
  }

  function scanBinaryLiteral () {
    read()
    let result = ''
    while (c === '.' || c === '0' || c === '1') {
      result += c === '1' ? '1' : '0'
      read()
    }
    const value = parseInt(result, 2)
    if (!isNaN(value)) {
      return new Token('Literal', value)
    }
    throw new Error('Syntax error: Expected binary literal')
  }

  function scanDecimalLiteral () {
    let result = ''
    if (c === '-') { result += read() }
    while (isDigit(c)) {
      result += read()
    }
    const value = parseInt(result, 10)
    if (!isNaN(value)) {
      return new Token('Literal', value)
    }
    throw new Error('Syntax error: Expected decimal literal')
  }

  function scanIdentifier () {
    let result = ''
    const myCol = col
    if (isUpper(c) || isLower(c)) {
      result += read()
      while (isUpper(c) || isLower(c) || isDigit(c) || c === '_') { result += read() }
      switch (true) {
        case myCol === 1: return new Token('Label', result)
        case result === 'I':
        case result === 'DT':
        case result === 'ST':
          return new Token(result, null)

        case instructions.has(result.toUpperCase()): return new Token('Instruction', result.toUpperCase())
        case /^V[0-9a-fA-F]$/.test(result): return new Token('V', parseInt(result.slice(1), 16))
      }
    }
    throw new Error(`Parse error: unexpected character ${c}`)
  }

  function nextToken () {
    skipWhitespace()
    if (pos >= input.length) { return null }
    switch (true) {
      case c === ';': skipComment(); return nextToken()
      case c === '#': return scanHexLiteral()
      case c === '%': return scanBinaryLiteral()
      case c === '-' || (c >= '0' && c <= '9'): return scanDecimalLiteral()
      default: return scanIdentifier()
    }
  }

  return {
    nextToken
  }
}
