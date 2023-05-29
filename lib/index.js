/**
 * @fileoverview Plugin designed to find and fix Feature-sliced design violations.
 * @author Netliukh Feliche-Demian
 */
'use strict'

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const requireIndex = require('requireindex')

//------------------------------------------------------------------------------
// Plugin Definition
//------------------------------------------------------------------------------

// import all rules in lib/rules
module.exports.rules = requireIndex(__dirname + '/rules')
