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
const getRelativePath = require('../helpers/getRelativePath')

const PUBLIC_ERROR = 'PUBLIC_ERROR'
const NO_FILE_IN_PUBLIC_ERROR = 'NO_FILE_IN_PUBLIC_ERROR'
const TESTING_PUBLIC_ERROR = 'TESTING_PUBLIC_ERROR'

const isPublicApiHaveExport = (pathToPublicApi, exportedObject) => {
  const project = new Project()

  const file = project.addSourceFileAtPathIfExists(pathToPublicApi)

  if (file === undefined) return false

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

const addExportToPublicApi = (
  pathToPublicApi,
  exportedObjectName,
  exportedObjectPath
) => {
  const project = new Project()

  let file = project.addSourceFileAtPathIfExists(pathToPublicApi)

  if (file === undefined) {
    file = project.createSourceFile(pathToPublicApi, '')
  }

  const exportPath = getRelativePath(pathToPublicApi, exportedObjectPath)

  file.addExportDeclaration({
    namedExports: [exportedObjectName],
    moduleSpecifier: exportPath,
  })

  file.saveSync()
}

module.exports = {
  messageIds: {
    PUBLIC_ERROR,
    NO_FILE_IN_PUBLIC_ERROR,
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
      [NO_FILE_IN_PUBLIC_ERROR]:
        'There is no {{ fileName }} in public or testing api.',
    },
    fixable: 'code',
    hasSuggestions: true,
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
          const normalizedPath = path.normalize(context.getFilename())
          const pathToSrc = normalizedPath.split('src')[0]

          const pathToSlice = path.resolve(
            pathToSrc,
            'src',
            segments[0],
            segments[1]
          )
          const pathToIndexTs = path.resolve(pathToSlice, 'index.ts')
          const pathToTestingTS = path.resolve(pathToSlice, 'testing.ts')

          const absoluteSlicePath = `${alias ?? ''}${segments[0]}/${
            segments[1]
          }`

          const importedValue = node.specifiers[0].imported.name

          if (isPublicApiHaveExport(pathToIndexTs, importedValue)) {
            return context.report({
              node: node.source,
              messageId: PUBLIC_ERROR,
              fix: (fixer) => {
                return fixer.replaceText(
                  node.source,
                  `'${absoluteSlicePath}'`
                )
              },
            })
          } else if (
            isPublicApiHaveExport(pathToTestingTS, importedValue)
          ) {
            return context.report({
              node: node.source,
              messageId: PUBLIC_ERROR,
              fix: (fixer) => {
                return fixer.replaceText(
                  node.source,
                  `'${absoluteSlicePath}/testing'`
                )
              },
            })
          } else {
            context.report({
              node: node.source,
              messageId: PUBLIC_ERROR,
            })

            return context.report({
              node,
              messageId: NO_FILE_IN_PUBLIC_ERROR,
              data: {
                fileName: importedValue,
              },
              // suggest: [
              //   {
              //     desc: 'Create file in public api',
              //     fix: (fixer) => {
              //       addExportToPublicApi(
              //         pathToIndexTs,
              //         importedValue,
              //         importTo
              //       )
              //       return fixer.replaceText(
              //         node.source,
              //         `'${absoluteSlicePath}'`
              //       )
              //     },
              //   },
              //   {
              //     desc: 'Create file in testing public api',
              //     fix: (fixer) => {
              //       addExportToPublicApi(
              //         pathToTestingTS,
              //         importedValue,
              //         importTo
              //       )
              //
              //       return fixer.replaceText(
              //         node.source,
              //         `'${absoluteSlicePath}/testing'`
              //       )
              //     },
              //   },
              // ],
            })
          }
        }

        if (isImportFromTestingPublicApi) {
          const fromFilename = context.getFilename()

          const isTestFile = isMatchSomePattern(
            fromFilename,
            testFilesPatterns
          )

          if (!isTestFile) {
            return context.report({
              node: node.source,
              messageId: TESTING_PUBLIC_ERROR,
            })
          }
        }
      },
    }
  },
}
