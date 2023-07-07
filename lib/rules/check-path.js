/**
 * @fileoverview Check is path should be relative according to Feature-sliced design methodology.
 * @author Netliukh Feliche-Demian
 */
'use strict'

const isPathRelative = require('../helpers/isPathRelative')
const getSourcePathArray = require('../helpers/getSourcePathArray')
const replaceAlias = require('../helpers/replaceAlias')
const getRelativePath = require('../helpers/getRelativePath')

const RELATIVE_ERROR = 'RELATIVE_ERROR'
const PUBLIC_API_ERROR = 'RELATIVE_ERROR'

/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
  messageIds: {
    RELATIVE_ERROR,
    PUBLIC_API_ERROR,
  },
  meta: {
    type: 'problem',
    docs: {
      description:
        'Check if a path should be relative according to Feature-sliced design methodology.',
      recommended: true,
      url: null, // URL to the documentation page for this rule
    },
    messages: {
      [RELATIVE_ERROR]:
        'All paths should be relative within the same slice.',
      [PUBLIC_API_ERROR]:
        "You shouldn't import from public API in the same slice. This can lead to circular dependencies.",
    },
    fixable: 'code',
    schema: [
      {
        type: 'object',
        properties: {
          alias: {
            type: 'string',
          },
        },
        additionalProperties: false,
      },
    ],
  },

  create(context) {
    const alias = context.options[0]?.alias

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
      const toArray = to.split('/')
      const toLayer = toArray[0] // 'entities'
      const toSlice = toArray[1] // 'User'

      if (!toLayer || !toSlice || !layers[toLayer]) {
        return false
      }

      const fromArray = getSourcePathArray(context.getFilename())

      const fromLayer = fromArray[0] // 'entities'
      const fromSlice = fromArray[1] // 'User'

      if (!fromLayer || !fromSlice || !layers[fromLayer]) {
        return false
      }

      return fromLayer === toLayer && fromSlice === toSlice
    }

    return {
      ImportDeclaration(node) {
        /**
         * @example entities/User
         * @example entities/User/ui/UserCard
         */
        const importTo = replaceAlias(node.source.value, alias)

        /**
         * @example Windows
         * C:\Users\Netliukh Feliche-Demian\projects\feature-sliced-design\mocks\entities\User
         * C:\Users\Netliukh Feliche-Demian\projects\feature-sliced-design\mocks\entities\User\ui\UserCard\UserCard.tsx
         * @example Mac and Linux
         * /Users/netliukh-feliche-demian/projects/feature-sliced-design/mocks/entities/User
         * /Users/netliukh-feliche-demian/projects/feature-sliced-design/mocks/entities/User/ui/UserCard/UserCard.tsx
         */
        const fromFilename = context.getFilename()

        const shouldPathBeRelative = shouldBeRelative(
          fromFilename,
          importTo
        )

        const toArray = importTo.split('/')
        const isImportFromPublicApi = toArray.length === 2
        const isImportFromTestingPublicApi =
          toArray[2] === 'testing' && toArray.length < 4
        const isImportPublicApi =
          isImportFromPublicApi || isImportFromTestingPublicApi

        if (shouldPathBeRelative && !isImportPublicApi) {
          context.report({
            node: node.source,
            messageId: RELATIVE_ERROR,
            fix: (fixer) => {
              return fixer.replaceText(
                node.source,
                `'${getRelativePath(context.getFilename(), importTo)}'`
              )
            },
          })
        } else if (shouldPathBeRelative && isImportPublicApi) {
          context.report({
            node: node.source,
            messageId: PUBLIC_API_ERROR,
          })
        }
      },
    }
  },
}
