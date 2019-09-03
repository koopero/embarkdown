
const fs = require('fs-extra')
const path = require('path')
const file = path.resolve( __dirname, 'test/content/example.md') 
const text = fs.readFileSync( file, 'utf8' )
const markdownAst = require('markdown-ast')

let result = markdownAst( text )
console.dir( result, { showHidden: false, depth: 4 } )