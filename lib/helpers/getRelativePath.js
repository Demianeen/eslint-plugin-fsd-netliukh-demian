const path = require('path')
const getSourcePath = require('./getSourcePath')

function getRelativePath(currentFilePath, absolutePath) {
  const currentFileDirName = path.dirname(currentFilePath)
  const fromSource = getSourcePath(currentFileDirName)

  let relativePath = path.relative(
    `/src/${fromSource}`,
    `/src/${absolutePath}`
  )

  const parsedPath = path.parse(relativePath)

  // remove file extension
  relativePath = path.join(parsedPath.dir, parsedPath.name)

  if (!relativePath.startsWith('.')) {
    relativePath = `./${relativePath}`
  }

  return relativePath
}

module.exports = getRelativePath
