const markdown = exports
const _ = require('lodash')

markdown.join = function() {
  let result = ''

  _.map( arguments, arg => {
    if ( _.isString( arg ) && arg ) {
      if ( result ) 
        result += '\r\n'

      result += arg
    }
  })

  return result 
}