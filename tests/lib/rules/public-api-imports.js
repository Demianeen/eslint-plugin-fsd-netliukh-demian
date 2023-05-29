/**
 * @fileoverview Checks if absolute path imports from public api
 * @author Demian
 */
'use strict'

const rule = require('../../../lib/rules/public-api-imports'),
  RuleTester = require('eslint').RuleTester

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
  'Absolute import allowed only from public API (index.ts).'

ruleTester.run('public-api-imports', rule, {
  valid: [
    {
      code: "import { UserCard } from 'entities/User'",
    },
    // should work with alias
    {
      code: "import { UserCard } from '@/entities/User'",
    },
  ],

  invalid: [
    {
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
