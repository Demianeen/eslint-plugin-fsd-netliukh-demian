const replaceAlias = (importPath, alias) => {
  if (alias != null) {
    return importPath.replace(alias, '')
  }

  return importPath
}

module.exports = replaceAlias
