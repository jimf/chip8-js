const test = require('tape')
const scanner = require('../src/scanner')

test('scanner skips whitespace', (t) => {
  t.equal(scanner('   ').nextToken(), null)
  t.end()
})

test('scanner skips comments', (t) => {
  t.equal(scanner('; comment').nextToken(), null)
  t.end()
})

test('scanner recognizes hex literals', (t) => {
  t.deepEqual(scanner('#3f').nextToken(), { type: 'Literal', value: 0x3f })
  t.end()
})

test('scanner recognizes binary literals', (t) => {
  const cases = [
    { input: '%11..11..', expected: 204 },
    { input: '%11001100', expected: 204 }
  ]
  cases.forEach(({ input, expected }) => {
    t.deepEqual(scanner(input).nextToken(), { type: 'Literal', value: expected })
  })
  t.end()
})

test('scanner recognizes decimal literals', (t) => {
  const cases = [
    { input: '90210', expected: 90210 },
    { input: '-42', expected: -42 },
    { input: '007', expected: 7 } // Dunno about this
  ]
  cases.forEach(({ input, expected }) => {
    t.deepEqual(scanner(input).nextToken(), { type: 'Literal', value: expected })
  })
  t.end()
})

test('scanner recognizes V literals', (t) => {
  for (let i = 0; i <= 0xF; i += 1) {
    t.deepEqual(scanner(` V${i.toString(16)}`).nextToken(), { type: 'V', value: i })
    t.deepEqual(scanner(` v${i.toString(16).toUpperCase()}`).nextToken(), { type: 'V', value: i })
  }
  t.end()
})

test('scanner recognizes register literals', (t) => {
  const cases = [
    { input: ' I', expected: 'I' },
    { input: ' DT', expected: 'DT' },
    { input: ' ST', expected: 'ST' }
  ]
  cases.forEach(({ input, expected }) => {
    t.deepEqual(scanner(input).nextToken(), { type: expected, value: null })
    t.deepEqual(scanner(input.toLowerCase()).nextToken(), { type: expected, value: null })
  })
  t.end()
})

test('scanner recognizes instruction literals', (t) => {
  const cases = [
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
  ]
  cases.forEach((inst) => {
    t.deepEqual(scanner(` ${inst}`).nextToken(), { type: 'Instruction', value: inst })
    t.deepEqual(scanner(` ${inst.toLowerCase()}`).nextToken(), { type: 'Instruction', value: inst })
  })
  t.end()
})

test('scanner recognizes label literals', (t) => {
  const cases = [
    { input: 'abcDEF123_', expected: 'abcDEF123_' },
    { input: '\nLABEL', expected: 'LABEL' }
  ]
  cases.forEach(({ input, expected }) => {
    t.deepEqual(scanner(input).nextToken(), { type: 'Label', value: expected })
  })
  t.end()
})

test('scanner recognizes identifiers', (t) => {
  const cases = [
    { input: ' abcDEF123_', expected: 'abcDEF123_' }
  ]
  cases.forEach(({ input, expected }) => {
    t.deepEqual(scanner(input).nextToken(), { type: 'Identifier', value: expected })
  })
  t.end()
})

test('scanner recognizes special characters', (t) => {
  const cases = [
    { input: ',', expected: 'Comma' }
  ]
  cases.forEach(({ input, expected }) => {
    t.deepEqual(scanner(input).nextToken(), { type: expected, value: null })
  })
  t.end()
})

test('scanner recognizes strings', (t) => {
  const cases = [
    { input: '"hello world"', expected: 'hello world' },
    { input: '`hello world`', expected: 'hello world' },
    { input: "'hello world'", expected: 'hello world' }
  ]
  cases.forEach(({ input, expected }) => {
    t.deepEqual(scanner(input).nextToken(), { type: 'String', value: expected })
  })
  t.end()
})

test('scanner throws for invalid inputs', (t) => {
  const cases = [
    '#',
    '"unterminated string',
    '"invalid multiline string\n2"',
    '%2',
    '-feelings',
    '$$$'
  ]
  cases.forEach((input) => {
    t.throws(scanner(input).nextToken)
  })
  t.end()
})
