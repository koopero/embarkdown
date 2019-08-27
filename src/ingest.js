module.exports = ingest

const posixpathlib = require('path').posix
const _ = require('lodash')
const YAML = require('js-yaml')
const parseSections = require('sections').parse
const parseFrontmatter = require('frontmatter')
const Result = require('./Result')

async function ingest( {
  file = '',
  files = [],
  loader = null
} ) {
  let errors = []
  let result = { errors, files: [], names: {}, chunks: [] }
  let names = result.names

  queueFile( file )
  queueFile( files )

  files = result.files

  do {
    var filesToLoad = _.filter( result.files, chunk => !chunk.loaded )
    await Promise.all( _.map( filesToLoad, fetchFile ) )
    await Promise.all( _.map( filesToLoad, parseFile ) )
  } while ( filesToLoad.length )

  return new Result( result  )

  function addChunk( chunk ) {
    result.chunks.push( chunk )
  }

  function mungeName( str ) {
    str = str.toLowerCase()
    str = str.replace( /[^\w\d]+/g, '_' )
    return str
  }

  function uniqueName( title ) {
    let str = mungeName( title )
    let index = 0 
    do {
      var check = str
      if ( index ) 
        check += '_'+index 
        
      index ++
    } while( names[check] )

    names[check] = title
    return check
  }

  function queueFile( file ) {
    if ( _.isArray( file ) ) {
      _.map( file, queueFile )
    } else if ( _.isString( file ) && file ) {
      if ( !_.find( result.files, test => test.file == file ) )
        result.files.push( { file } )
    }
  }

  async function parseFile( chunk ) {
    let { extension, content } = chunk

    if ( !content )
      return

    switch ( extension ) {
      case 'yaml':
      case 'json':
      case 'yml':
        parseYAML( chunk )
      break

      case 'md':
      case 'markdown':
        parseMarkdown( chunk )
      break
    }

  }

  function parseYAML( chunk ) {
    let { file, content } = chunk

    try {
      chunk.data = YAML.safeLoad( content )
    } catch ( detail ) {
      chunk.error = addError( { file, detail } )
    }

    queueLoadFromChunk( chunk )
    addChunk( chunk )
  }

  function parseMarkdown( chunk ) {
    let { file, content } = chunk
    let front = parseFrontmatter( content )

    chunk.data = _.merge( chunk.data || {}, front.data )

    addChunk( chunk )

    let { sections } = parseSections( front.content )


    sections = _.map( sections, ( section ) => {
      let content = section.body

      // Add trailing linebreak to ensure frontmatter parsing for blank content
      content = content + '\r\n'
      let front = parseFrontmatter( content )
      let result = _.pick( section, ['title','level'] )

      if ( !section.count && !section.level ) {
        // First section, pre-header.
        result.title = ''
        // result.preheading = section
        result.markdown = section.string
      } else { 
        result.data = front.data
        result.markdown = front.content  
      }

      if ( result.title )
        result.name = uniqueName( result.title )
      else 
        result.name = ''
      
      queueLoadFromChunk( result )
      addChunk( result )

      return result
    })

    chunk.children = _.filter( sections )
  }

  function queueLoadFromChunk( chunk ) {
    let { data } = chunk
    if ( data && data.load ) {
      queueFile( data.load )
      delete data.load
    }
  }

  async function fetchFile( chunk ) {
    chunk.loaded = true

    let { file } = chunk
    let extension = posixpathlib.extname( file )

    extension = _.trimStart( extension, '.' ).toLowerCase()
    let content
    
    try {
      content = await loader( file )
    } catch ( detail ) {
      let error = addError( { detail } )
      chunk.error = true 
      return chunk
    }

    if ( Buffer.isBuffer( content ) )
      content = content.toString('utf8')

    Object.assign( chunk, { file, extension, content } )

    return chunk
  }

  function addError( error ) {
    errors.push( error )
    return error
  }

}
