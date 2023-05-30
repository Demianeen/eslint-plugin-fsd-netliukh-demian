/**
 * @fileoverview Check for imports from upper layers
 * @author Demian
 */
'use strict'

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

const isPathRelative = require('../helpers/isPathRelative')
const getSourcePathArray = require('../helpers/getSourcePathArray')
const replaceAlias = require('../helpers/replaceAlias')
const isMatchSomePattern = require('../helpers/isMatchSomePattern')
/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
  meta: {
    type: 'problem', // `problem`, `suggestion`, or `layout`
    docs: {
      description: 'Check for imports from upper layers',
      recommended: true,
      url: null, // URL to the documentation page for this rule
    },
    fixable: null, // Or `code` or `whitespace`
    schema: [
      {
        type: 'object',
        properties: {
          alias: {
            type: 'string',
          },
          ignoreFilesPatterns: {
            type: 'array',
          },
        },
        additionalProperties: false,
      },
    ], // Add a schema if the rule has options
  },

  create(context) {
    const { alias, ignoreFilesPatterns = [] } = context.options[0] ?? {}

    const layersOrder = {
      app: ['app', 'pages', 'widgets', 'features', 'shared', 'entities'],
      pages: ['widgets', 'features', 'shared', 'entities'],
      widgets: ['features', 'shared', 'entities'],
      features: ['shared', 'entities'],
      entities: ['shared', 'entities'],
      shared: ['shared'],
    }

    const availableLayers = {
      shared: 'shared',
      entities: 'entities',
      features: 'features',
      widgets: 'widgets',
      pages: 'pages',
      app: 'app',
    }

    const getImportArray = (importPath) => {
      const pathArray = importPath.split('/')
      return pathArray[0]
    }

    const getCurrentFileLayer = () => {
      const pathArray = getSourcePathArray(context.getFilename())
      return pathArray[0]
    }

    return {
      ImportDeclaration(node) {
        const importPath = replaceAlias(node.source.value, alias)

        const currentFileLayer = getCurrentFileLayer()
        const importLayer = getImportArray(importPath)

        if (isPathRelative(importPath)) return
        if (availableLayers[currentFileLayer] === undefined) return
        if (availableLayers[importLayer] === undefined) return
        if (isMatchSomePattern(importPath, ignoreFilesPatterns)) return

        if (!layersOrder[currentFileLayer].includes(importLayer)) {
          context.report(
            node,
            `You can't import layer '${importLayer}' inside '${currentFileLayer}' layer`
          )
        }
      },
    }
  },
}
