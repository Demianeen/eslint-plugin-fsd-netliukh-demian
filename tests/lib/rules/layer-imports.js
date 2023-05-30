/**
 * @fileoverview Check for imports from upper layers
 * @author Demian
 */
'use strict'

const rule = require('../../../lib/rules/layer-imports'),
  RuleTester = require('eslint').RuleTester

const resolveProjectPath = require('../helpers/resolveProjectPath')

const alias = {
  alias: '@/',
}

const ignoreFilesPatterns = {
  ignoreFilesPatterns: ['entities/User'],
}

const generateInvalidLayerError = (importLayer, currentFileLayer) => ({
  message: `You can't import layer '${importLayer}' inside '${currentFileLayer}' layer`,
  type: 'ImportDeclaration',
})

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 6,
    sourceType: 'module',
  },
})
ruleTester.run('layer-imports', rule, {
  valid: [
    {
      filename: resolveProjectPath('features', 'NewFeature'),
      code: "import { UserCard } from 'entities/User'",
    },
    {
      filename: resolveProjectPath(
        '..',
        'config',
        'babel',
        'newBabelPlugin'
      ),
      code: "import { PluginItem } from '@babel/core'",
    },
    // should work with alias
    {
      filename: resolveProjectPath('features', 'NewFeature'),
      code: "import { UserCard } from 'entities/User'",
      options: [alias],
    },
    // should work with ignore pattern
    {
      filename: resolveProjectPath('entities', 'Article'),
      code: "import { UserCard } from 'entities/User'",
      options: [ignoreFilesPatterns],
    },
  ],

  invalid: [
    {
      filename: resolveProjectPath('shared', 'Button'),
      code: "import { UserCard } from 'entities/User'",
      errors: [generateInvalidLayerError('entities', 'shared')],
    },
    {
      filename: resolveProjectPath('features', 'NewFeature'),
      code: "import HomePage from 'pages/HomePage'",
      errors: [generateInvalidLayerError('pages', 'features')],
    },
    {
      filename: resolveProjectPath('entities', 'Article'),
      code: "import { User } from 'entities/User'",
      errors: [generateInvalidLayerError('entities', 'entities')],
    },
    // should work with alias
    {
      filename: resolveProjectPath('features', 'NewFeature'),
      code: "import HomePage from 'pages/HomePage'",
      errors: [generateInvalidLayerError('pages', 'features')],
      options: [alias],
    },
  ],
})