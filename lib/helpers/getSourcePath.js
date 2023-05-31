const path = require('path')

const getSourcePath = (importPath, afterSrc = true) => {
  const normalizedPath = path.normalize(importPath)
  return normalizedPath.split('/src/')[afterSrc ? 1 : 0]
}

module.exports = getSourcePath
