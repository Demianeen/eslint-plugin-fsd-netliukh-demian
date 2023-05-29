/**
 * @fileoverview Check pathes according to Feature-sliced design methodology.
 * @author Netliukh Feliche-Demian
 */
'use strict'

const rule = require('../../../lib/rules/check-path'),
  RuleTester = require('eslint').RuleTester
const path = require('path')
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

const errorMessage =
  'All paths should be relative within the same slice.'

ruleTester.run('check-path', rule, {
  valid: [
    {
      filename: resolveProjectPath(
        'features',
        'LoginByUsername',
        'ui',
        'LoginForm'
      ),
      code: "import { UserCard } from 'entities/User/ui/UserCard/UserCard'",
    },
  ],

  invalid: [
    {
      filename: resolveProjectPath(
        'entities',
        'User',
        'ui',
        'UserCard'
      ),
      code: "import { UserCard } from 'entities/User/ui/UserCard/UserCard'",
      errors: [
        {
          message: errorMessage,
          type: 'ImportDeclaration',
        },
      ],
    },
    // should work with alias
    {
      filename: resolveProjectPath(
        'entities',
        'User',
        'ui',
        'UserCard'
      ),
      code: "import { UserCard } from '@/entities/User/ui/UserCard/UserCard'",
      errors: [
        {
          message: errorMessage,
          type: 'ImportDeclaration',
        },
      ],
      options: [alias],
    },
  ],
})
