# eslint-plugin-netliukh-demian-fsd-plugin

Plugin designed to find and fix Feature-sliced design violations.

## Installation

You'll first need to install [ESLint](https://eslint.org/):

```sh
npm i eslint --save-dev
```

Next, install `eslint-plugin-netliukh-demian-fsd-plugin`:

```sh
npm install eslint-plugin-netliukh-demian-fsd-plugin --save-dev
```

## Usage

Add `netliukh-demian-fsd-plugin` to the plugins section of your `.eslintrc` configuration file. You can omit the `eslint-plugin-` prefix:

```json
{
  "plugins": ["netliukh-demian-fsd-plugin"]
}
```

Then configure the rules you want to use under the rules section.

```json
{
  "rules": {
    "netliukh-demian-fsd-plugin/rule-name": 2
  }
}
```

## Rules

<!-- begin auto-generated rules list -->

| Name                                                   | Description                                                                      |
| :----------------------------------------------------- | :------------------------------------------------------------------------------- |
| [check-path](docs/rules/check-path.md)                 | Check is path should be relative according to Feature-sliced design methodology. |
| [layer-imports](docs/rules/layer-imports.md)           | Check for imports from upper layers                                              |
| [public-api-imports](docs/rules/public-api-imports.md) | Checks if absolute path imports from public api                                  |

<!-- end auto-generated rules list -->
