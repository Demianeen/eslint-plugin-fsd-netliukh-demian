const { isMatch } = require('micromatch')

const isMatchSomePattern = (fileName, filesPatterns) => {
  return filesPatterns.some((pattern) => isMatch(fileName, pattern))
}

module.exports = isMatchSomePattern
