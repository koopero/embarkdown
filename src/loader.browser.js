const EMBDLoaderBase = require('./loader.base')

const _ = require('lodash')
const URL = require('url')
const pathlib = require('path')
const axios = require('axios')

class EMBDLoaderBrowser extends EMBDLoaderBase {
  extname( url ) {
    let { pathname } = URL.parse( url )
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

  async load( url ) {
    // url = URL.parse( url )
    let response = await axios.get( url )
    return response.data 
  }
}

module.exports = EMBDLoaderBrowser