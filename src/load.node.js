const fs = require('fs')

exports.loadFile = function loadFile (path) {
  return new Promise((resolve, reject) => {
    fs.readFile(path, (err, data) => {
      if (err) {
        reject(err)
        return
      }
      resolve(data.slice(data.byteOffset, data.byteLength))
    })
  })
}
