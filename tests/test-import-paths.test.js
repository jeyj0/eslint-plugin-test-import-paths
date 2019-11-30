import { RuleTester } from 'eslint'
import rule from '../src/rules/test-import-paths.js'

RuleTester.setDefaultConfig({
  parserOptions: {
    ecmaVersion: 6,
    sourceType: 'module',
  },
})

function test(c) {
  return {
    code: c,
    filename: 'MyComponent.jsx',
    options: [
      {
        sharedFilesRootPrefixes: ['lib', '~'],
        validSiblingExtensions: ['s?css', 'txt'],
      },
    ],
    parser: require.resolve('babel-eslint'),
  }
}

const ruleTester = new RuleTester()

function codesFromPath(path) {
  return [
    `import sth from "${path}"`,
    `import "${path}"`,
    `require("${path}")`,
    `import("${path}")`,
  ]
}

function codesFromPaths(paths) {
  return paths.map(codesFromPath).reduce((acc, paths) => acc.concat(paths), [])
}

const valids = codesFromPaths([
  'jest-expect-message',
  'babel-eslint',
  './myComponent/SubComponent.jsx',
  './myComponent/subFile',
  './myComponent.scss',
  './myComponent.css',
  './myComponent.txt',
  '~/SharedComponent.jsx',
  'lib/util.js',
]).concat([
  'not.require("./myComponent.invalid")'
])

const invalidPaths = [
  [
    './myComponent.invalid',
    ["Not a valid import path: './myComponent.invalid'. Sibling imports must match 'myComponent.[s?css|txt]'."],
  ],
  [
    './myComponent/sub/sub',
    ["Not a valid import path: './myComponent/sub/sub'. Child imports must be one level deep."],
  ],
  ['../', ["Not a valid import path: '../'. Upwards imports are not allowed."]],
]

const invalids = invalidPaths
  .map(([path, errors]) => codesFromPath(path).map(path => [path, errors]))
  .reduce((acc, arr) => acc.concat(arr), [])

ruleTester.run('test-import-paths', rule, {
  valid: valids.map(code => test(code)),
  invalid: invalids.map(([code, errors]) => ({
    ...test(code),
    errors: errors.map(message => ({ message })),
  })),
})
