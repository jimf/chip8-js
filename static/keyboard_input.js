// Remap hex keypad to keyboard keys:
// 1 2 3 C      1 2 3 4
// 4 5 6 D  ->  Q W E R
// 7 8 9 E      A S D F
// A 0 B F      Z X C V
const keyMap = {
  ['1'.charCodeAt(0)]: 0x1,
  ['2'.charCodeAt(0)]: 0x2,
  ['3'.charCodeAt(0)]: 0x3,
  ['4'.charCodeAt(0)]: 0xC,
  ['Q'.charCodeAt(0)]: 0x4,
  ['W'.charCodeAt(0)]: 0x5,
  ['E'.charCodeAt(0)]: 0x6,
  ['R'.charCodeAt(0)]: 0xD,
  ['A'.charCodeAt(0)]: 0x7,
  ['S'.charCodeAt(0)]: 0x8,
  ['D'.charCodeAt(0)]: 0x9,
  ['F'.charCodeAt(0)]: 0xE,
  ['Z'.charCodeAt(0)]: 0xA,
  ['X'.charCodeAt(0)]: 0x0,
  ['C'.charCodeAt(0)]: 0xB,
  ['V'.charCodeAt(0)]: 0xF
}
const revKeyMap = Object.keys(keyMap).reduce((acc, k) => {
  const value = keyMap[k]
  acc[value] = acc[value] || []
  acc[value].push(k)
  return acc
}, {})

module.exports = function (chip8) {
  return {
    onKeydown (e) {
      if (e.which in keyMap) {
        const key = keyMap[e.which]
        chip8.keyDown(key)
        return key
      }
    },
    onKeyup (e) {
      if (e.which in keyMap) {
        const key = keyMap[e.which]
        chip8.keyUp(key)
        return key
      }
    },
    keyNames (hex) {
      return revKeyMap[hex].map(ascii => String.fromCharCode(Number(ascii)))
    }
  }
}
