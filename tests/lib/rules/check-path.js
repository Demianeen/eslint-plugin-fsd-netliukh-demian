/**
 * @fileoverview Check pathes according to Feature-sliced design methodology.
 * @author Netliukh Feliche-Demian
 */
'use strict'

const rule = require('../../../lib/rules/check-path'),
  RuleTester = require('eslint').RuleTester
const resolveProjectPath = require('../helpers/resolveProjectPath')

const { messageIds } = rule

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 6,
    sourceType: 'module',
  },
})

// options
const alias = {
  alias: '@/',
}

// errors
const relativeError = {
  messageId: messageIds.RELATIVE_ERROR,
  type: 'Literal',
}

const publicApiError = {
  messageId: messageIds.PUBLIC_API_ERROR,
  type: 'Literal',
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
    // path outside src should not be fixed by default
    {
      filename: resolveProjectPath(
        '..',
        'cypress',
        'e2e',
        'common',
        'routing.ts'
      ),
      code: "import { AnimationContext } from 'shared/lib/components/AnimationProvider/lib/AnimationContext'",
    },
    // should ignore relative path
    {
      filename: resolveProjectPath(
        '..',
        'cypress',
        'e2e',
        'common',
        'routing.ts'
      ),
      code: "import { method } from './lib'",
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
      errors: [relativeError],
      options: [alias],
      output: "import { UserCard } from '../UserCard/UserCard'",
    },
    {
      filename: resolveProjectPath(
        'shared',
        'lib',
        'components',
        'AnimationProvider',
        'lib',
        'useAnimationLibs.ts'
      ),
      code: "import { AnimationContext } from 'shared/lib/components/AnimationProvider/lib/AnimationContext'",
      errors: [relativeError],
      output: "import { AnimationContext } from './AnimationContext'",
    },
    // import from public api in the same slice
    {
      filename: resolveProjectPath(
        'entities',
        'User',
        'ui',
        'UserCardHeader',
        'UserCardHeader.ts'
      ),
      code: "import { UserCard } from 'entities/User'",
      errors: [publicApiError],
      output: null,
    },
    // import from testing public api in the same slice
    {
      filename: resolveProjectPath(
        'entities',
        'User',
        'ui',
        'UserCardHeader',
        'UserCardHeader.ts'
      ),
      code: "import { UserCard } from 'entities/User/testing'",
      errors: [publicApiError],
      output: null,
    },
    // import from testing folder
    {
      filename: resolveProjectPath(
        'entities',
        'User',
        'ui',
        'UserCardHeader',
        'UserCardHeader.ts'
      ),
      code: "import { UserCard } from 'entities/User/testing/mockUser'",
      errors: [relativeError],
      output: "import { UserCard } from '../../testing/mockUser'",
    },
    // path outside src should be fixed if shouldFixOutsideSrc is true
    // {
    //   filename: resolveProjectPath(
    //     '..',
    //     'cypress',
    //     'e2e',
    //     'common',
    //     'routing.ts'
    //   ),
    //   code: "import { AnimationContext } from 'shared/lib/components/AnimationProvider/lib/AnimationContext'",
    //   options: [shouldFixOutsideSrc],
    //   errors: [relativeError],
    //   output:
    //     "import { AnimationContext } from '../../src/shared/lib/components/AnimationProvider/lib/AnimationContext'",
    // },
  ],
})
