const _ = require('lodash')
const matchArray = require('searchjs').matchArray

class Result {
  constructor( result ) {
    Object.assign( this, result )
  }

  renderNavTree( {
    path = [],
    highlight = [],
    levels = 999,
  } = {} ) {

  }

  query( query ) {
    let names = {}
    let { chunks } = this 

    chunks = matchArray( chunks, query )

    return { chunks, names }
  }
}

module.exports = Result