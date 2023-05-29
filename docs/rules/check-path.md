# Check is path should be relative according to Feature-sliced design methodology (`netliukh-demian-fsd-plugin/check-path`)

<!-- end auto-generated rule header -->

Please describe the origin of the rule here.

## Rule Details

This rule aims to...

Examples of **incorrect** code for this rule:

from/to

```js
'entities/User/ui/UserCard',
  'entities/User/model/slice/userSlice'
'entities/User', 'entities/User/ui/UserCard/UserCard'
'entities/User/ui/UserCard', 'entities/User'
```

Examples of **correct** code for this rule:

from/to

```js
'features/LoginByUsername/ui/LoginForm',
  'entities/User/ui/UserCard'
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
