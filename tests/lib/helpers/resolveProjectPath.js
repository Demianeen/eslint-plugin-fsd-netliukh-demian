const path = require('path')

const resolveSourcePath = (...segments) =>
  path.resolve(__dirname, 'src', ...segments)

module.exports = resolveSourcePath
