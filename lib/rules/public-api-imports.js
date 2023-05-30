/**
 * @fileoverview Checks if absolute path imports from public api
 * @author Demian
 */
'use strict'

/** @type {import('eslint').Rule.RuleModule} */
const path = require('path')
const micromatch = require('micromatch')

const isPathRelative = require('../helpers/isPathRelative')
const replaceAlias = require('../helpers/replaceAlias')
const isMatchSomePattern = require('../helpers/isMatchSomePattern')

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Checks if absolute path imports from public api',
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
          testFilesPatterns: {
            type: 'array',
          },
        },
        additionalProperties: false,
      },
    ], // Add a schema if the rule has options
  },

  create(context) {
    const { alias, testFilesPatterns = [] } = context.options[0] ?? {}

    const availableLayers = {
      entities: 'entities',
      features: 'features',
      widgets: 'widgets',
      pages: 'pages',
    }

    return {
      ImportDeclaration(node) {
        const importTo = replaceAlias(node.source.value, alias)

        if (isPathRelative(importTo)) return

        // [entities, article, ...]
        const segments = importTo.split('/')
        const layer = segments[0]

        if (availableLayers[layer] === undefined) return

        const isImportFromPublicApi = segments.length === 2
        // [entities, article, testing]
        const isImportFromTestingPublicApi =
          segments[2] === 'testing' && segments.length < 4

        if (!isImportFromPublicApi && !isImportFromTestingPublicApi) {
          return context.report(
            node,
            'Absolute import allowed only from public API (index.ts).'
          )
        }

        if (isImportFromTestingPublicApi) {
          const fromFilename = context.getFilename()

          const isTestFile = isMatchSomePattern(
            fromFilename,
            testFilesPatterns
          )

          if (!isTestFile) {
            return context.report(
              node,
              'Only test files can import from testing public api.'
            )
          }
        }
      },
    }
  },
}
