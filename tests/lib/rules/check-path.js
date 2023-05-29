/**
 * @fileoverview Check pathes according to Feature-sliced design methodology.
 * @author Netliukh Feliche-Demian
 */
"use strict";

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const rule = require("../../../lib/rules/check-path"),
  RuleTester = require("eslint").RuleTester
const path = require("path");


//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester({
  parserOptions: {
    ecmaVersion: 6,
    sourceType: 'module'
  }
});

// TODO: Add tests for windows environment
const resolveProjectPath = (...segments) => path.resolve(__dirname, 'src', ...segments)

ruleTester.run("check-path", rule, {
  valid: [
    {
      filename: resolveProjectPath('features', 'LoginByUsername', 'ui', 'LoginForm'),
      code: "import { UserCard } from 'entities/User/ui/UserCard/UserCard'",
      errors: [{ message: "All paths should be relative within the same slice.", type: "ImportDeclaration" }],
    },
  ],

  invalid: [
    {
      filename: resolveProjectPath('entities', 'User', 'ui', 'UserCard'),
      code: "import { UserCard } from 'entities/User/ui/UserCard/UserCard'",
      errors: [{ message: "All paths should be relative within the same slice.", type: "ImportDeclaration" }],
    },
    // should work with alias
    {
      filename: resolveProjectPath('entities', 'User', 'ui', 'UserCard'),
      code: "import { UserCard } from '@/entities/User/ui/UserCard/UserCard'",
      errors: [{ message: "All paths should be relative within the same slice.", type: "ImportDeclaration" }],
      options: [{
        alias: '@/'
      }]
    },
  ],
});
