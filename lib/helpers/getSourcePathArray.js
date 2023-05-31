const path = require('path')
const getSourcePath = require('./getSourcePath')

const getSourcePathArray = (importPath) => {
  const sourcePath = getSourcePath(importPath)
  if (sourcePath === undefined) return []
  return sourcePath.split(path.sep)
}

module.exports = getSourcePathArray
