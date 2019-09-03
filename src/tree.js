const _ = require('lodash')
const pathlib = require('./path')

class Branch {
  constructor() {
    this.leaf = []
    this.bran = {}
  }
}

class Tree {
  constructor( chunks ) {
    this.root = new Branch()
    this.ingest( chunks )
    // this.finalize()
  }

  ingest( chunk ) {
    if ( _.isArrayLikeObject( chunk ) )
      return _.map( chunk, chunk => this.ingest( chunk ) )

    let { path } = chunk || {}
    if ( !path )
      return 

    let branch = this.branch( path )
    branch.leaf.push( chunk )
  }

  slice( { minLevel, maxLevel } = {} ) {
    let result = compile( { branch: this.root, level: 0, path: [] })
    return result

    function compile( { branch, level, path, parents = [] } ) {
      let leaf = branch.leaf
      leaf = _.sortBy( leaf, 'order' )
      leaf = _.map( leaf, _.clone )
      _.forEach( leaf, leaf => {
        leaf.level = level

       } )

      parents = _.filter( parents )


      let subs = _.map( branch.bran, ( branch, name ) => compile( { branch, level: level + 1, parents: parents.concat( leaf ), path: [ ...path, name ] } ) )

      if ( level < minLevel ) {
        parents = parents.concat( leaf )
        leaf = []
        subs = subs
      } else if ( level >= maxLevel ) {
        leaf = leaf.concat( _.flatten( _.map( subs, sub => sub.leaf ) ) )
        subs = [] 
      }

      let result = { leaf, subs }

      Object.defineProperty( result, 'parents', { value: parents, enumerable: false })

      return result
    }
  }

  branch( path ) {
    path = pathlib.resolve( path )
    let target = this.root

    for ( let seg of path ) {
      if ( !target.bran[seg] ) 
        target.bran[seg] = new Branch()

      target = target.bran[seg]
    }

    return target
  }

}

module.exports = Tree