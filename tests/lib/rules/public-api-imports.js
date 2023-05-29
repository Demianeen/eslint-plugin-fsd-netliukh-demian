/**
 * @fileoverview Checks if absolute path imports from public api
 * @author Demian
 */
'use strict'

const rule = require('../../../lib/rules/public-api-imports'),
  RuleTester = require('eslint').RuleTester

const resolveProjectPath = require('../helpers/resolveProjectPath')

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 6,
    sourceType: 'module',
  },
})

const alias = {
  alias: '@/',
}

const testingFilesPatterns = {
  testFilesPatterns: ['**/*.test.ts', '**/storybook/*'],
}

const publicApiError = {
  message:
    'Absolute import allowed only from public API (index.ts).',
  type: 'ImportDeclaration',
}

const testApiError = {
  message:
    'Only test files can import from testing public api.',
  type: 'ImportDeclaration',
}

ruleTester.run('public-api-imports', rule, {
  valid: [
    {
      code: "import { UserCard } from 'entities/User'",
    },
    // should work with alias
    {
      code: "import { UserCard } from '@/entities/User'",
      options: [alias],
    },
    // should work with test file patterns
    {
      filename: resolveProjectPath(
        'features',
        'LoginByUsername',
        'ui',
        'LoginForm.test.ts'
      ),
      code: "import { mockUser } from 'entities/User/testing'",
      options: [testingFilesPatterns],
    },
  ],

  invalid: [
    {
      code: "import { UserCard } from 'entities/User/ui/UserCard/UserCard'",
      errors: [publicApiError],
    },
    // should work with alias
    {
      code: "import { UserCard } from '@/entities/User/ui/UserCard/UserCard'",
      errors: [publicApiError],
      options: [alias],
    },
    // should work with test file patterns
    {
      filename: resolveProjectPath(
        'features',
        'LoginByUsername',
        'ui',
        'LoginForm.ts'
      ),
      code: "import { mockUser } from 'entities/User/testing'",
      options: [testingFilesPatterns],
      errors: [testApiError],
    },
    {
      filename: resolveProjectPath(
        'features',
        'LoginByUsername',
        'ui',
        'LoginForm.test.ts'
      ),
      code: "import { mockUser } from 'entities/User/testing/mockUser.ts'",
      options: [testingFilesPatterns],
      errors: [publicApiError],
    },
  ],
})
