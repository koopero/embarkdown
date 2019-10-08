const assert = require('chai').assert
const deepeq = assert.deepEqual
const fs = require('fs-extra')
const path = require('path')
const barkdown = require('../index')
const loader = async ( file ) => fs.readFile( path.resolve( __dirname, 'content', file ) )

xdescribe('barkdown', () => {
  it('will load chunks from args', async () => {
    let chunk = { foo: 'bar' }
    let result = await barkdown( chunk )
    deepeq( result.errors, [] )
    assert( result.chunks.length > 0, 'No chunks in result' )

    assert.equal( result.chunks[0], chunk )
    deepeq( chunk.path, [] )

    // console.dir( result, { depth: 5 } )
  })

  it('will load minimal.md', async () => {
    const file = 'minimal.md'
    let result = await barkdown( { loader, file } )

    deepeq( result.errors, [] )
    assert( result.chunks.length > 0, 'No chunks in result' )
  })

  it('will do a query', async () => {
    const file = 'example.yaml'
    let data = await barkdown( { loader, file } )

    let sub = data.query( {
      // title: 'Section'
    } )

    let chunks = sub.chunks
    console.dir( sub.tree, { depth: 6 } )

  })
})