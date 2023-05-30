const path = require('path')

const getSourcePathArray = (importPath) => {
  const normalizedPath = path.normalize(importPath)
  const projectFrom = normalizedPath.split('src')[1]
  if (projectFrom === undefined) return []
  const pathArray = projectFrom.split(path.sep) // ['', 'entities', ...]
  pathArray.shift()

  return pathArray
}

module.exports = getSourcePathArray
