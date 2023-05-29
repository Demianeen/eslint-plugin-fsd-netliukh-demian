const path = require('path')

const resolveProjectPath = (...segments) =>
  path.resolve(__dirname, 'src', ...segments)

module.exports = resolveProjectPath
