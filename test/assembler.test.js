const test = require('tape')
const assemble = require('../src/assembler')

test('assembler assembles CLS (00E0) instructions', (t) => {
  t.deepEqual(assemble(' CLS'), new Uint8Array([0x00, 0xE0]))
  t.end()
})

test('assembler assembles RET (00EE) instructions', (t) => {
  t.deepEqual(assemble(' RET'), new Uint8Array([0x00, 0xEE]))
  t.end()
})

test('assembler assembles SYS (0nnn) instructions', (t) => {
  t.deepEqual(assemble(' SYS #ABC'), new Uint8Array([0x0A, 0xBC]))
  t.end()
})

test('assembler assembles JP (1nnn) instructions', (t) => {
  t.deepEqual(assemble(' JP #416'), new Uint8Array([0x14, 0x16]))
  t.end()
})

test('assembler assembles CALL (2nnn) instructions', (t) => {
  t.deepEqual(assemble(' CALL #CAB'), new Uint8Array([0x2C, 0xAB]))
  t.end()
})

test('assembler assembles SE (3xkk) instructions', (t) => {
  t.deepEqual(assemble(' SE v4, 0'), new Uint8Array([0x34, 0x00]))
  t.end()
})

test('assembler assembles SNE (4xkk) instructions', (t) => {
  t.deepEqual(assemble(' SNE v1, #1f'), new Uint8Array([0x41, 0x1F]))
  t.end()
})

test('assembler assembles SE (5xy0) instructions', (t) => {
  t.deepEqual(assemble(' SE v1, v2'), new Uint8Array([0x51, 0x20]))
  t.end()
})

test('assembler assembles LD (6xkk) instructions', (t) => {
  t.deepEqual(assemble(' LD v2, -1'), new Uint8Array([0x62, -1]))
  t.end()
})

test('assembler assembles ADD (7xkk) instructions', (t) => {
  t.deepEqual(assemble(' ADD v5, 7'), new Uint8Array([0x75, 7]))
  t.end()
})

test('assembler assembles LD (8xy0) instructions', (t) => {
  t.deepEqual(assemble(' LD v4, v5'), new Uint8Array([0x84, 0x50]))
  t.end()
})

test('assembler assembles OR (8xy1) instructions', (t) => {
  t.deepEqual(assemble(' OR v4, v5'), new Uint8Array([0x84, 0x51]))
  t.end()
})

test('assembler assembles AND (8xy2) instructions', (t) => {
  t.deepEqual(assemble(' AND v4, v5'), new Uint8Array([0x84, 0x52]))
  t.end()
})

test('assembler assembles XOR (8xy3) instructions', (t) => {
  t.deepEqual(assemble(' XOR v4, v5'), new Uint8Array([0x84, 0x53]))
  t.end()
})

test('assembler assembles ADD (8xy4) instructions', (t) => {
  t.deepEqual(assemble(' ADD v4, v5'), new Uint8Array([0x84, 0x54]))
  t.end()
})

test('assembler assembles SUB (8xy5) instructions', (t) => {
  t.deepEqual(assemble(' SUB v4, v5'), new Uint8Array([0x84, 0x55]))
  t.end()
})

test('assembler assembles SHR (8xy6) instructions', (t) => {
  t.deepEqual(assemble(' SHR v4'), new Uint8Array([0x84, 0x06]))
  t.end()
})

test('assembler assembles SUBN (8xy7) instructions', (t) => {
  t.deepEqual(assemble(' SUBN v4, v5'), new Uint8Array([0x84, 0x57]))
  t.end()
})

test('assembler assembles SHL (8xyE) instructions', (t) => {
  t.deepEqual(assemble(' SHL v4'), new Uint8Array([0x84, 0x0E]))
  t.end()
})

test('assembler assembles SNE (9xy0) instructions', (t) => {
  t.deepEqual(assemble(' SNE v4, v5'), new Uint8Array([0x94, 0x50]))
  t.end()
})

test('assembler assembles LD I (Annn) instructions', (t) => {
  t.deepEqual(assemble(' LD I, #666'), new Uint8Array([0xA6, 0x66]))
  t.end()
})

test('assembler assembles JP V0 (Bnnn) instructions', (t) => {
  t.deepEqual(assemble(' JP v0, #666'), new Uint8Array([0xB6, 0x66]))
  t.end()
})

test('assembler assembles RND (Cxkk) instructions', (t) => {
  t.deepEqual(assemble(' RND v6, #66'), new Uint8Array([0xC6, 0x66]))
  t.end()
})

test('assembler assembles DRW (Dxyn) instructions', (t) => {
  t.deepEqual(assemble(' DRW v1, v2, 5'), new Uint8Array([0xD1, 0x25]))
  t.end()
})

test('assembler assembles SKP (Ex9E) instructions', (t) => {
  t.deepEqual(assemble(' SKP v1'), new Uint8Array([0xE1, 0x9E]))
  t.end()
})

test('assembler assembles SKNP (ExA1) instructions', (t) => {
  t.deepEqual(assemble(' SKNP v1'), new Uint8Array([0xE1, 0xA1]))
  t.end()
})

test('assembler assembles LD Vx, DT (Fx07) instructions', (t) => {
  t.deepEqual(assemble(' LD v1, dt'), new Uint8Array([0xF1, 0x07]))
  t.end()
})

test('assembler assembles LD Vx, K (Fx0A) instructions', (t) => {
  t.deepEqual(assemble(' LD v1, k'), new Uint8Array([0xF1, 0x0A]))
  t.end()
})

test('assembler assembles LD DT, Vx (Fx15) instructions', (t) => {
  t.deepEqual(assemble(' LD dt, v1'), new Uint8Array([0xF1, 0x15]))
  t.end()
})

test('assembler assembles LD ST, Vx (Fx18) instructions', (t) => {
  t.deepEqual(assemble(' LD st, v1'), new Uint8Array([0xF1, 0x18]))
  t.end()
})

test('assembler assembles ADD I, Vx (Fx1E) instructions', (t) => {
  t.deepEqual(assemble(' ADD I, v1'), new Uint8Array([0xF1, 0x1E]))
  t.end()
})

test('assembler assembles LD F, Vx (Fx29) instructions', (t) => {
  t.deepEqual(assemble(' LD f, v1'), new Uint8Array([0xF1, 0x29]))
  t.end()
})

test('assembler assembles LD B, Vx (Fx33) instructions', (t) => {
  t.deepEqual(assemble(' LD b, v1'), new Uint8Array([0xF1, 0x33]))
  t.end()
})

test('assembler assembles LD [I], Vx (Fx55) instructions', (t) => {
  t.deepEqual(assemble(' LD [i], v1'), new Uint8Array([0xF1, 0x55]))
  t.end()
})

test('assembler assembles LD Vx, [I] (Fx65) instructions', (t) => {
  t.deepEqual(assemble(' LD v1, [i]'), new Uint8Array([0xF1, 0x65]))
  t.end()
})

test('assembler assembles labels', (t) => {
  const cases = [
    { input: 'lbl LD v1, 0\n JP lbl', expected: new Uint8Array([0x61, 0x00, 0x12, 0x00]) },
    { input: 'lbl LD v1, 0\n JP v0, lbl', expected: new Uint8Array([0x61, 0x00, 0xB2, 0x00]) },
    { input: 'lbl SYS lbl', expected: new Uint8Array([0x02, 0x00]) },
    { input: 'lbl LD v1, 0\n ret\n CALL lbl', expected: new Uint8Array([0x61, 0x00, 0x00, 0xEE, 0x22, 0x00]) },
    { input: 'lbl LD I, lbl', expected: new Uint8Array([0xA2, 0x00]) },
    { input: ' CALL lbl\nlbl LD v1, 0\n RET', expected: new Uint8Array([0x22, 0x02, 0x61, 0x00, 0x00, 0xEE]) }
  ]
  cases.forEach(({ input, expected }) => {
    t.deepEqual(assemble(input), expected)
  })
  t.end()
})

test('assembler assembles byte directives', (t) => {
  const cases = [
    { input: ' byte %11..11..', expected: new Uint8Array([0xCC]) }
  ]
  cases.forEach(({ input, expected }) => {
    t.deepEqual(assemble(input), expected)
  })
  t.end()
})
