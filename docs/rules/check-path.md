# Check pathes according to Feature-sliced design methodology. (`check-path`)

Please describe the origin of the rule here.

## Rule Details

This rule aims to...

Examples of **incorrect** code for this rule:

from/to
```js
'entities/User/ui/UserCard', 'entities/User/model/slice/userSlice'
'entities/User', 'entities/User/ui/UserCard/UserCard'
'entities/User/ui/UserCard', 'entities/User'
```

Examples of **correct** code for this rule:

from/to
```js
'features/LoginByUsername/ui/LoginForm', 'entities/User/ui/UserCard'
```

### Options

If there are any options, describe them here. Otherwise, delete this section.

## When Not To Use It

When you not use Feature-sliced design methodology

## Further Reading

https://feature-sliced.design/docs
