function fail(context, node, importString, reason) {
  context.report({
    node,
    message: errorMessage(importString, reason)
  });
}

function errorMessage(importString, specifics) {
  return `Not a valid import path: '${importString}'. ${specifics}`
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

  const validSiblingImport = new RegExp(
    `^\\.\\/${foldername}\\.(${siblingExtensions})$`
  )
  const childImport = new RegExp(`^\\.\/${foldername}\\/.*$`)
  const validChildImport = new RegExp(`^\\.\/${foldername}\\/[^\\/]+$`)
  const sharedImport = new RegExp(`^(${sharedRoots})\\/.*$`)
  const validSharedImport = new RegExp(`^(${sharedRoots})\\/[^\\/]+$`)

  // sibling or child import
  if (importString.substr(0, 2) == './') {
    if (childImport.test(importString)) {
      // child import
      if (!validChildImport.test(importString)) {
        fail(context, node, importString,  'Child imports must be one level deep.')
        return;
      }
    } else {
      // sibling import
      if (!validSiblingImport.test(importString)) {
        fail(context, node, importString,  `Sibling imports must match '${foldername}.[${siblingExtensions}]'.`)
        return;
      }
    }
  }

  // parent import
  if (importString.substr(0, 3) == '../') {
    fail(context, node, importString,  'Upwards imports are not allowed.')
    return;
  }

  // root or node import
  if (sharedImport.test(importString) && !validSharedImport.test(importString)) {
    // shared import (but not valid)
    context.report({
      node,
      message: errorMessage(importString, 'You may only import from the root of shared folders.')
    })
    return;
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
