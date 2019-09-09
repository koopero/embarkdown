const _ = require('lodash')
const Tree = require('./tree')
const markdown = require('./markdown')

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

  tree() {
    return new Tree( this.chunks )
  }

  pages( options ) {
    const tree = new Tree( this.chunks )
    let slice = tree.slice( options )

    let pages = _.map( slice.subs, page )

    return pages

    function page( branch ) {
      let { leaf, parents, subs } = branch

      let page = {}

      for ( let parent of parents )
        mergeData( page, parent )

      for ( let index in leaf )
        merge( page, leaf[index], !!index )

      return page

      function mergeData( dst, src ) {
        dst.data = _.merge( {}, dst.data, src.data )
      }

      function merge( dst, src, isSub ) {
        _.map( src, mergeKey )
        
        function mergeKey( value, key ) {
          switch ( key ) {
            case 'markdown':
              dst.markdown = markdown.join( dst.markdown, src.markdownHeading, value )
            break

            case 'data':
              if ( !isSub )
                dst[key] = _.merge( {}, dst[key], value )
            break

            default:
              if ( _.isUndefined( dst[key] ) )
                dst[key] = value 
              else if ( _.isObject( value ) && !_.isArrayLike( value ) && !isSub ) 
                dst[key] = _.merge( {}, dst[key], value )
              else if ( !isSub ) 
                dst[key] = value
            break
          }
        }
      }

    }

    function mergeForward( a, b ) {

    }

    function mergeBackward( a, b ) {

    }
  }

  page( sliced ) {
    let title = firstProp( 'title' )

    function firstProp( key ) {

    }
  }



  query( {
  } ) {
    let names = {}
    let { chunks } = this 

    let tree = { leaf: [], bran: {} }
    function branch( path ) {
      let branch = tree 

      for ( let i = 0; i < path.length; i ++ ) {
        let seg = path[i]
        if ( !branch.bran[seg] ) 
          branch.bran[seg] = { leaf: [], bran: {} }

        branch = branch.branches[seg]
      }

      return branch
    }

    chunks.map( chunk => {
      let pos = branch( chunk.path ) 
      pos.leaf.push( chunk ) 
    })


    // chunks = matchArray( chunks, query )

    return { chunks, names, tree }
  }
}

module.exports = Result