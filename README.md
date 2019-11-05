# eslint-plugin-test-import-paths

Check the import paths of modules to ensure project guidelines.

## Installation

You'll first need to install [ESLint](http://eslint.org):

```
$ npm i eslint --save-dev
```

Next, install `eslint-plugin-test-import-paths`:

```
$ npm install eslint-plugin-test-import-paths --save-dev
```

**Note:** If you installed ESLint globally (using the `-g` flag) then you must also install `eslint-plugin-test-import-paths` globally.

## Usage

Add `test-import-paths` to the plugins section of your `.eslintrc` configuration file. You can omit the `eslint-plugin-` prefix:

```json
{
    "plugins": [
        "test-import-paths"
    ]
}
```





