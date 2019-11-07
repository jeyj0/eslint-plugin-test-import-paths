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

Add `test-import-paths` to the plugins section of your `.eslintrc` configuration file and enable the `test-import-paths` rule. You can omit the `eslint-plugin-` prefix:

```json
{
    "plugins": [
        "test-import-paths"
    ],
    "rules": {
        "test-import-paths/test-import-paths": "error"
    }
}
```

By default, the rule is configured to only allow the following kinds of imports:

1. installed node-modules
2. sibling files with the the same name as the importing file in lower-camelCase, with the extensions `css` and `scss` (configurable)
3. files from a subdirectory with the same name as the importing file in lower-camelCase, but only one level.
4. files from a shared root folder called `~` (configurable)

Four import syntaxes are supported, including dynamic imports:
```javascript
import sth from "somewhere"
import "something"
require("something")
import("something")
```

### sibling files

Examples for default configuration:
```javascript
// MyFile.js

// valid
import "./myFile.css"
import "./myFile.scss"

// invalid
import "./myOtherFile"
import "./myOtherFile.css"
import "./myFile.txt"
import "./myFile"
```

The allowed extensions can be configured for the rule via the `validSiblingExtensions` key:
```json
{
    "rules": {
        "test-import-paths/test-import-paths": ["error", {
            "validSiblingExtensions": ["scss", "css"]
        }]
    }
}
```

### files from a subdirectory

```javascript
// MyFile.js

// valid
import "./myFile/MyOtherFile.js"
import "./myFile/mySecondFile.txt"

// invalid
import "./myDir/SomeFile.js"
import "./myFile/dir/AFile.js"
```

### shared root folders

Examples for default configuration:
```javascript
// valid
import "~/util.js"

// invalid
import "/util.js"
import "~/handlers/click_event.js"
```

The root folder resolvers can be configured with the `sharedFilesRootPrefixes` key:
```json
{
    "rules": {
        "test-import-paths": ["error", {
            "sharedFilesRootPrefixes": ["~"]
        }]
    }
}
```
