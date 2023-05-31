/**
 * @fileoverview Check pathes according to Feature-sliced design methodology.
 * @author Netliukh Feliche-Demian
 */
'use strict'

const rule = require('../../../lib/rules/check-path'),
  RuleTester = require('eslint').RuleTester
const path = require('path')
const resolveProjectPath = require('../helpers/resolveProjectPath')

const { messageIds } = rule

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 6,
    sourceType: 'module',
  },
})

const alias = {
  alias: '@/',
}

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
        'UserCardHeader',
        'UserCardHeader.ts'
      ),
      code: "import { UserCard } from 'entities/User/ui/UserCard/UserCard'",
      errors: [
        {
          messageId: messageIds.RELATIVE_ERROR,
          type: 'Literal',
        },
      ],
      output: "import { UserCard } from '../UserCard/UserCard'",
    },
    // should work with alias
    {
      filename: resolveProjectPath(
        'entities',
        'User',
        'ui',
        'UserCardHeader',
        'UserCardHeader.ts'
      ),
      code: "import { UserCard } from '@/entities/User/ui/UserCard/UserCard'",
      errors: [
        {
          messageId: messageIds.RELATIVE_ERROR,
          type: 'Literal',
        },
      ],
      options: [alias],
      output: "import { UserCard } from '../UserCard/UserCard'",
    },
  ],
})
