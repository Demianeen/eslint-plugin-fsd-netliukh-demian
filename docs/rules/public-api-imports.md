# Checks if absolute path imports from public api (`public-api-imports`)

Please describe the origin of the rule here.

## Rule Details

This rule aims to...

Examples of **incorrect** code for this rule:

```js
import { UserCard } from 'entities/User/ui/UserCard/UserCard'
import { UserCard } from '@/entities/User/ui/UserCard/UserCard'
```

Examples of **correct** code for this rule:

```js
import { UserCard } from 'entities/User'
```

### Options

alias - separator for absolute imports

Example: `alias: '@/'`

Will allow the following code:
```js
import { UserCard } from '@/entities/User/ui/UserCard/UserCard'
```

## When Not To Use It

When you not use Feature-sliced design methodology

## Further Reading

https://feature-sliced.design/docs
