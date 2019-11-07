function checkNpmImport(importString) {
  try {
    require.resolve(importString)
  } catch (e) {
    return false
  }
  return true
}

function testImport(node, context) {
  const filenameRegExp = /^(.*\/)?(.*)\..*$/
  const filename = context.getFilename().match(filenameRegExp)[2]
  const foldername = filename.substr(0, 1).toLowerCase() + filename.substr(1)

  const importString = node.value

  const options = context.options[0] || {}
  const sharedFilesRootPrefixes = options.sharedFilesRootPrefixes || ['~']
  const validSiblingExtensions = options.validSiblingExtensions || [
    'scss',
    'css',
  ]

  const sharedRoots = sharedFilesRootPrefixes.join('|')
  const siblingExtensions = validSiblingExtensions.join('|')

  const npmImport = new RegExp(`^[^\\/|^\\.][a-zA-Z-_\\/]+$`)

  const isPossibleNpmImport = npmImport.test(importString)
  const isNpmImport = isPossibleNpmImport && checkNpmImport(importString)

  const siblingImport = new RegExp(
    `^\\.\\/${foldername}\\.(${siblingExtensions})$`
  )
  const dependencyImport = new RegExp(`^\\.\/${foldername}\\/[^\\/]+$`)
  const sharedImport = new RegExp(`^(${sharedRoots})\\/[^\\/]+$`)

  const isValidImport =
    isNpmImport ||
    siblingImport.test(importString) ||
    dependencyImport.test(importString) ||
    sharedImport.test(importString)

  if (!isValidImport) {
    context.report({
      node,
      message: `Not a valid import path: '${importString}'`,
    })
  }
}

function looksLike(a, b) {
  return (
    a &&
    b &&
    Object.keys(b).every(bKey => {
      const bVal = b[bKey]
      const aVal = a[bKey]
      if (typeof bVal === 'function') {
        return bVal(aVal)
      }
      return isPrimitive(bVal) ? bVal === aVal : looksLike(aVal, bVal)
    })
  )
}

function isPrimitive(val) {
  return val == null || /^[sbn]/.test(typeof val)
}

module.exports = {
  create: function(context) {
    return {
      ImportDeclaration(node) {
        testImport(node.source, context)
      },
      CallExpression(node) {
        const looksLikeRequireCall = looksLike(node, {
          callee: {
            type: 'Identifier',
            name: 'require',
          },
          arguments: [
            {
              type: 'Literal',
            },
          ],
        })

        const looksLikeDynamicImport = looksLike(node, {
          callee: {
            type: 'Import',
          },
        })

        if (looksLikeRequireCall || looksLikeDynamicImport) {
          testImport(node.arguments[0], context)
        }
      },
    }
  },
}
