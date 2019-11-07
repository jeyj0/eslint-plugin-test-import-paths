// @codegen

const path = require('path')
const fs = require('fs')

const rulesDir = path.join(__dirname, 'rules')

const entries = fs.readdirSync(rulesDir, {
  withFileTypes: true,
})

const filenameRegex = new RegExp('^(.*).js$')

const rulesObj = {}

const rules = entries
  .map(entry => {
    if (!(entry.isFile() && filenameRegex.test(entry.name))) return null
    const name = entry.name.match(filenameRegex)[1]
    return name
  })
  .filter(rule => rule != null)
  .map(rule => `'${rule}': require('./rules/${rule}.js'),`)
  .join('\n')

module.exports = `module.exports = {
  ${rules}
}`
