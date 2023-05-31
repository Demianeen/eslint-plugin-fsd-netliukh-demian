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
const { Project } = require('ts-morph')

const PUBLIC_ERROR = 'PUBLIC_ERROR'
const TESTING_PUBLIC_ERROR = 'TESTING_PUBLIC_ERROR'

const isPublicApiHaveExport = (pathToPublicApi, exportedObject) => {
  const project = new Project()

  project.addSourceFileAtPath(pathToPublicApi)

  const file = project.getSourceFile(pathToPublicApi)

  if (file == null) return false

  const exportDeclarations = file.getExportDeclarations()
  const namedExports = exportDeclarations.map((exportDeclaration) =>
    exportDeclaration.getNamedExports()
  )

  for (let i = 0; i < namedExports.length; i += 1) {
    for (let j = 0; j < namedExports[i].length; j += 1) {
      if (namedExports[i][j].getName() === exportedObject) return true
    }
  }

  return false
}

module.exports = {
  messageIds: {
    PUBLIC_ERROR,
    TESTING_PUBLIC_ERROR,
  },
  meta: {
    type: 'problem',
    docs: {
      description: 'Checks if absolute path imports from public api',
      recommended: true,
      url: null, // URL to the documentation page for this rule
    },
    messages: {
      [PUBLIC_ERROR]:
        'Absolute import allowed only from public API (index.ts).',
      [TESTING_PUBLIC_ERROR]:
        'Only test files can import from testing public api.',
    },
    fixable: 'code',
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
    ],
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
          return context.report({
            node,
            messageId: PUBLIC_ERROR,
            fix: (fixer) => {
              const normalizedPath = path.normalize(context.getFilename())
              const pathToSrc = normalizedPath.split('src')[0]

              const pathToSlice = path.resolve(
                pathToSrc,
                'src',
                segments[0],
                segments[1]
              )
              const pathToIndexTs = path.resolve(pathToSlice, 'index.ts')
              const pathToTestingTS = path.resolve(
                pathToSlice,
                'testing.ts'
              )

              const absoluteSlicePath = `${alias ?? ''}${segments[0]}/${
                segments[1]
              }`

              const importedValue = node.specifiers[0].imported.name

              if (isPublicApiHaveExport(pathToIndexTs, importedValue)) {
                return fixer.replaceText(
                  node.source,
                  `'${absoluteSlicePath}'`
                )
              }

              if (isPublicApiHaveExport(pathToTestingTS, importedValue)) {
                return fixer.replaceText(
                  node.source,
                  `'${absoluteSlicePath}/testing'`
                )
              }
            },
          })
        }

        if (isImportFromTestingPublicApi) {
          const fromFilename = context.getFilename()

          const isTestFile = isMatchSomePattern(
            fromFilename,
            testFilesPatterns
          )

          if (!isTestFile) {
            return context.report({
              node,
              messageId: TESTING_PUBLIC_ERROR,
            })
          }
        }
      },
    }
  },
}
