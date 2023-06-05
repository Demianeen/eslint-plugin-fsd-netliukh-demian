/**
 * @fileoverview Checks if absolute path imports from public api
 * @author Demian
 */
'use strict'

const rule = require('../../../lib/rules/public-api-imports'),
  RuleTester = require('eslint').RuleTester

const { messageIds } = rule

const path = require('path')
const resolveProjectPath = require('../helpers/resolveProjectPath')

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 6,
    sourceType: 'module',
  },
})

const resolveMockProjectPath = (...segments) =>
  path.resolve(__dirname, '..', 'mocks', 'src', ...segments)

const alias = {
  alias: '@/',
}

const testingFilesPatterns = {
  testFilesPatterns: ['**/*.test.ts', '**/storybook/*'],
}

const publicApiError = {
  messageId: messageIds.PUBLIC_ERROR,
  type: 'Literal',
}

const testApiError = {
  messageId: messageIds.TESTING_PUBLIC_ERROR,
  type: 'Literal',
}

const noFileInPublicApiError = {
  messageId: messageIds.NO_FILE_IN_PUBLIC_ERROR,
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
      filename: resolveMockProjectPath(
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
      filename: resolveMockProjectPath(
        'features',
        'LoginByUsername',
        'ui',
        'LoginForm.ts'
      ),
      code: "import { UserCard } from 'entities/User/ui/UserCard/UserCard'",
      errors: [publicApiError],
      output: "import { UserCard } from 'entities/User'",
    },
    // should work with alias
    {
      filename: resolveMockProjectPath(
        'features',
        'LoginByUsername',
        'ui',
        'LoginForm.ts'
      ),
      code: "import { UserCard } from '@/entities/User/ui/UserCard/UserCard'",
      errors: [publicApiError],
      options: [alias],
      output: "import { UserCard } from '@/entities/User'",
    },
    // should work with test file patterns
    {
      filename: resolveMockProjectPath(
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
      filename: resolveMockProjectPath(
        'features',
        'LoginByUsername',
        'ui',
        'LoginForm.test.ts'
      ),
      code: "import { mockUser } from 'entities/User/testing/mockUser.ts'",
      options: [testingFilesPatterns],
      errors: [publicApiError],
      output: "import { mockUser } from 'entities/User/testing'",
    },
    // should work when there is no file inside public apis
    {
      filename: resolveMockProjectPath(
        'features',
        'LoginByUsername',
        'ui',
        'LoginForm.test.ts'
      ),
      code: "import { mockUser2 } from 'entities/User/testing/mockUser.ts'",
      options: [testingFilesPatterns],
      errors: [noFileInPublicApiError, publicApiError],
    },
    // should work when there is no testing.ts
    {
      filename: resolveMockProjectPath(
        'entities',
        'EntityWithoutTesting',
        'ui',
        'UserCardHeader',
        'UserCardHeader.ts'
      ),
      code: "import { mockUser } from '@/entities/EntityWithoutTesting/model/mocks/mockUser'",
      errors: [noFileInPublicApiError, publicApiError],
      options: [alias],
    },
    // should work when there is no second file in index.ts
    {
      filename: resolveMockProjectPath(
        'entities',
        'EntityWithoutTesting',
        'ui',
        'UserCardHeader',
        'UserCardHeader.ts'
      ),
      code: "import { mockUser2 } from 'entities/User/testing/mockUser.ts'",
      errors: [noFileInPublicApiError, publicApiError],
      options: [alias],
    },
  ],
})
