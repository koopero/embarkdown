const Tree = require('./tree')

module.exports = function compile( chunks, {
  minLevel = 1,
  maxLevel = 1,
} = {} ) {
  let tree = new Tree( chunks )
  
  tree.walk( )


}