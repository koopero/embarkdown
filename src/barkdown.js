module.exports = barkdown

const pathlib = require('path').posix
const _ = require('lodash')
const YAML = require('js-yaml')

async function barkdown( {
  file = '',
  files = [],
  loader = null
} ) {
  let errors = []
  let result = { errors, files: [] }

  queueFile( file )
  queueFile( files )

  do {
    var filesToLoad = _.filter( result.files, chunk => !chunk.loaded )
    let filesLoaded = await Promise.all( _.map( filesToLoad, fetchFile ) )
    await Promise.all( _.map( filesLoaded, parseFile ) )

  } while ( filesToLoad.length )

  result.files = await Promise.all( files.map( fetchFile ) )


  return result 

  function queueFile( file ) {
    if ( _.isArray( file ) ) {
      _.map( file, queueFile )
    } else if ( _.isString( file ) ) {
      if ( !_.find( result.files, test => test.file == file ) )
        result.files.push( { file } )
    }
  }

  async function parseFile( chunk ) {
    let { file, extension, content } = chunk
    let result = Object.assign( {}, chunk )

    switch ( extension ) {
      case 'yaml':
      case 'json':
      case 'yml':
        try {
          result.data = YAML.safeLoad( content )
        } catch ( detail ) {
          result.error = addError( { file, detail } )
        }
      break
    }

    result.loaded = true 

    return result
  }

  async function fetchFile( chunk ) {
    let { file } = chunk
    let extension = pathlib.extname( file )

    extension = _.trimStart( extension, '.' ).toLowerCase()
    let content
    
    try {
      content = await loader( file )
    } catch ( detail ) {
      let error = addError( { detail } )
      return { file, error }
    }

    if ( Buffer.isBuffer( content ) )
      content = content.toString('utf8')


    return { file, extension, content }
  }

  function addError( error ) {
    errors.push( error )
    return error
  }

}
