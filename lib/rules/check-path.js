/**
 * @fileoverview Check is path should be relative according to Feature-sliced design methodology.
 * @author Netliukh Feliche-Demian
 */
"use strict";

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

const path = require('path')

/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
  meta: {
    type: 'problem', // `problem`, `suggestion`, or `layout`
    docs: {
      description: "Check is path should be relative according to Feature-sliced design methodology.",
      recommended: true,
      url: null, // URL to the documentation page for this rule
    },
    fixable: null, // Or `code` or `whitespace`
    schema: [{
      type: 'object',
      properties: {
        alias: {
          type: "string"
        }
      },
      additionalProperties: false
    }],
  },

  create(context) {
    const alias = context.options[0]?.alias
    const isPathRelative = (path) => {
      return path === '.' || path.startsWith("./") || path.startsWith("../")
    }

    const layers = {
      shared: 'shared',
      entities: 'entities',
      features: 'features',
      widgets: 'widgets',
      pages: 'pages',
    }

    /**
     * @example
     * shouldBeRelative('entities/User/ui/UserCard', 'entities/User/model/slice/userSlice') // true
     * shouldBeRelative('entities/User', 'entities/User/ui/UserCard/UserCard') // true
     * shouldBeRelative('entities/User/ui/UserCard', 'entities/User') // true
     * shouldBeRelative('features/LoginByUsername/ui/LoginForm', 'entities/User/ui/UserCard') // false
     * @param from
     * @param to
     */
    const shouldBeRelative = (from, to) => {
      if (isPathRelative(to)) {
        return false
      }

      /**
       * @example entities/User
       */
      const toArray = to.split(path.sep)
      const toLayer = toArray[0] // 'entities'
      const toSlice = toArray[1] // 'User'

      if (!toLayer || !toSlice || !layers[toLayer]) {
        return false
      }

      const normalizedPath = path.normalize(from) // 'entities/User/ui/UserCard'
      const projectFrom = normalizedPath.split('src')[1]
      const fromArray = projectFrom.split(path.sep)

      const fromLayer = fromArray[1] // 'entities'
      const fromSlice = fromArray[2] // 'User'

      if (!fromLayer || !fromSlice || !layers[fromLayer]) {
        return false
      }

      return fromLayer === toLayer && fromSlice === toSlice
    }

    return {
      // visitor functions for different types of nodes
      ImportDeclaration(node) {
        /**
         * @example entities/User
         * @example entities/User/ui/UserCard
         */
        let importTo = node.source.value

        if (alias != null) {
          importTo = importTo.replace(alias, '')
        }

        /**
         * @example Windows
         * C:\Users\Netliukh Feliche-Demian\projects\feature-sliced-design\src\entities\User
         * C:\Users\Netliukh Feliche-Demian\projects\feature-sliced-design\src\entities\User\ui\UserCard\UserCard.tsx
         * @example Mac and Linux
         * /Users/netliukh-feliche-demian/projects/feature-sliced-design/src/entities/User
         * /Users/netliukh-feliche-demian/projects/feature-sliced-design/src/entities/User/ui/UserCard/UserCard.tsx
         */
        const fromFilename = context.getFilename()

        if (shouldBeRelative(fromFilename, importTo)) {
          context.report(node, 'All paths should be relative within the same slice.')
        }
      }
    };
  },
};
