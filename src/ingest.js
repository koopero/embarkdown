module.exports = ingest

const posixpathlib = require('path').posix
const _ = require('lodash')
const YAML = require('js-yaml')
const pathlib = require('./path')
const parseSections = require('sections').parse
const parseFrontmatter = require('frontmatter')
const Result = require('./Result')

async function ingest( {
  file = '',
  files = [],
  loader = null
} ) {
  // Declarations 
  let errors = []
  let result = { errors, files: [], names: {}, chunks: [] }
  let names = result.names
  let chunks = result.chunks

  _.map( arguments, parseArgument )

  do {
    var filesToLoad = _.filter( chunks, chunk => chunk.file && !chunk.loaded )
    await Promise.all( _.map( filesToLoad, fetchFile ) )
    await Promise.all( _.map( filesToLoad, parseContent ) )
  } while ( filesToLoad.length )

  return new Result( result  )

  

  function parseArgument( arg ) {
    if ( _.isString( arg ) ) 
      arg = { load: arg }

    if ( _.isArrayLikeObject( arg ) )
      return _.map( arg, parseArgument )

    if ( _.isObject( arg ) )
      parseChunk( arg )
  }

  function parseChunk( chunk, parent ) {
    chunk.path = pathlib.resolve( chunk.path || chunk.name )
    if ( parent && parent.file && parent.loaded && !chunk.file ) {
      chunk.file = parent.file
      chunk.loaded = parent.loaded
    } 

    if ( chunks.indexOf( chunk ) == -1 )
      chunks.push( chunk )

    queueLoadFromChunk( chunk )
  }

  function queueLoadFromChunk( chunk ) {
    let loader = findLoader( chunk )
    let dir
    if ( chunk.file ) 
      dir = loader.dirname( chunk.file )
      
    let { load } = chunk
    if ( chunk.load ) {
      addFileChunks( chunk.load )
    }

    function addFileChunks( file ) {
      if ( _.isArrayLikeObject( file ) )
        return _.map( file, addFileChunks )

      file = loader.resolve( dir, file )

      let existing = _.find( chunks, chunk => chunk.file == file )
      if ( existing )
        return 

      parseChunk( { file }, chunk )
    }
  }

  function mungeName( str ) {
    str = str.toLowerCase()
    str = str.replace( /[^\w\d]+/g, '_' )
    return str
  }

  function uniqueName( title ) {
    let str = mungeName( title || 'anon' ) || 'anon'
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



  async function parseContent( chunk ) {
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

    hoistChunkData( chunk, chunk.data )
    parseChunk( chunk )
  }

  function addSubChunks( chunk ) {
    let subChunks = _.get( chunk, 'data.chunks' )

    if ( subChunks ) {
      if ( _.isArrayLikeObject( subChunks ) )
        _.map( subChunks, sub => addSubChunk( sub, chunk ) )
      else if ( _.isObject( subChunks ) )
        _.map( subChunks, ( sub, path ) => addSubChunk( sub, chunk, path ) )

      delete chunk.data.chunks
    }

  }

  function addSubChunk( chunk, parent, path ) {
    // chunk.path = pathlib.resolve( parent.path, path, chunk.path ) 
    addChunk( chunk )
  }

  function parseMarkdown( chunk ) {
    let { file, content } = chunk
    let front = parseFrontmatter( content )

    hoistChunkData( chunk, front.data )
    chunk.data = _.merge( chunk.data || {}, front.data )

    parseChunk( chunk )

    let { sections } = parseSections( front.content )
    let hoistSection 

    // Pre-process sections
    var parentPath = []
    sections = _.map( sections, ( section ) => {
      let { body, level, title } = section


      // Add trailing linebreak to ensure frontmatter parsing for blank content
      body = body + '\r\n'
      let front = parseFrontmatter( body )
      let child = _.pick( section, ['title','level'] )

      if ( !section.count && !section.level ) {
        // First section, pre-header.
        hoistSection = section
        return 
      } 
      
      hoistChunkData( child, front.data )

      while( parentPath.length < level ) {
        parentPath.push( uniqueName() )
      }

      child.name = uniqueName( child.title )
      let path = pathlib.resolve( parentPath[level], child.path, child.name )
      child.path = pathlib.resolve( chunk.path, path )
      parentPath[level+1] = path

      child.markdownHeading = _.repeat('#',level)+' '+child.title
      child.data = front.data
      child.markdown = front.content  
      child.order = section.count
      child.type = child.type || 'markdown'
      

      // queueLoadFromChunk( child )
      parseChunk( child, chunk )
      // addSubChunks( child )

      return child
    })
    sections = _.filter( sections )

    if ( hoistSection ) {
      chunk.markdown = hoistSection.string
    }
    // addSubChunks( chunk )
    // chunk.children = sections
  }

  function hoistChunkData( chunk, data ) {
    data = data || chunk.data
    _.merge( chunk, _.omit( data, ['file','loaded','data' ] ) )
  }

  function findLoader( chunk ) {
    if ( _.isFunction( chunk.loader ) )
      return chunk.loader

    if ( chunk.parent )
      return findLoader( chunk.parent )


    let loader = new ingest.defaultLoader()
    return loader
  }

  async function fetchFile( chunk ) {
    let loader = findLoader( chunk )

    chunk.loaded = true

    let { file } = chunk
    let extension = loader.extname( file )
    let content
    
    try {
      content = await loader.load( file )
    } catch ( detail ) {
      throw detail 
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
