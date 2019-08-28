const DELIM = '/'
const _ = require('lodash')

function resolve() {
  let result = []
  parseAnything( arguments )
  return result

  function parseAnything( arg ) {
    if ( _.isNumber( arg ) )
      arg = String( arg )

    if ( _.isString( arg ) )
      parseString( arg )
    else if ( _.isArrayLike( arg ) )
      _.map( arg, parseAnything )
  }

  function parseString( arg ) {
    let segs = arg.split( DELIM )
    let len = segs.length
    for ( let index = 0; index < len; index ++ ) {
      let seg = segs[index]

      if ( !seg && !index && len > 1 ) {
        // Leading slash, go to root 
        result = []
        continue
      } 
      
      let dots = /^\.+$/.exec( seg )

      if ( dots ) {
        for ( let x = 0; x < seg.length - 1; x ++ ) 
          result.pop()

        continue
      }
      
      if ( seg )
        result.push( seg )
    }
  }
}

module.exports = { resolve }