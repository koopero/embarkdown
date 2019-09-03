const EMBDLoaderBase = require('./loader.base')

const _ = require('lodash')
const pathlib = require('path')
const fs = require('fs-extra')

class EMBDLoaderNode extends EMBDLoaderBase {
  extname( pathname ) {
    let extname = pathlib.extname( pathname )
    extname = _.trimStart( extname, '.' ).toLowerCase()
    return extname
  }

  dirname( pathname ) {
    let dirname = pathlib.dirname( pathname )
    return dirname
  }

  resolve() {
    let args = _.filter( arguments )
    // args = args.map()
    args.unshift('/')
    let file = pathlib.resolve.apply( null, args )
    file = file.substr(1)
    return file
  }

  async load( file ) {
    let data = await fs.readFile( file, 'utf8' )
    return data 
  }
}

module.exports = EMBDLoaderNode