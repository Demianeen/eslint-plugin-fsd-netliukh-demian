/**
 * @fileoverview Checks if absolute path imports from public api
 * @author Demian
 */
'use strict'

/** @type {import('eslint').Rule.RuleModule} */
const path = require('path')

const alias = require('../schema/alias')

const isPathRelative = require('../helpers/isPathRelative')

module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Checks if absolute path imports from public api',
      recommended: true,
      url: null, // URL to the documentation page for this rule
    },
    fixable: null, // Or `code` or `whitespace`
    schema: [alias], // Add a schema if the rule has options
  },

  create(context) {
    const alias = context.options[0]?.alias

    const availableLayers = {
      entities: 'entities',
      features: 'features',
      widgets: 'widgets',
      pages: 'pages',
    }

    return {
      ImportDeclaration(node) {
        let importTo = node.source.value

        if (alias != null) {
          importTo = importTo.replace(alias, '')
        }

        if (isPathRelative(importTo)) return

        // [entities, article, ...]
        const segments = importTo.split('/')
        const layer = segments[0]

        if (availableLayers[layer] === undefined) return

        const isNotFromPublicApi = segments.length > 2

        if (isNotFromPublicApi) {
          return context.report(
            node,
            'Absolute import allowed only from public API (index.ts).'
          )
        }
      },
    }
  },
}
