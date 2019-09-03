const EMBDLoaderBase = require('./loader.base')

const _ = require('lodash')
const URL = require('url')
const posixpath = require('path')
const axios = require('axios')

class EMBDLoaderBrowser extends EMBDLoaderBase {
  extname( url ) {
    let { pathname } = URL.parse( url )
    let extname = posixpath.extname( pathname )
    extname = _.trimStart( extname, '.' ).toLowerCase()
    return extname
  }

  async load( url ) {
    // url = URL.parse( url )
    let response = await axios.get( url )
    return response.data 
  }
}

module.exports = EMBDLoaderBrowser