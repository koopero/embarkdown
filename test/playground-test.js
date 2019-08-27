const assert = require('chai').assert
const fs = require('fs-extra')
const path = require('path')
const barkdown = require('../index')
const loader = async ( file ) => fs.readFile( path.resolve( __dirname, 'content', file ) )

describe('barkdown', () => {
  it('will load a few files', async () => {
    const files = [ 'example.yaml' ]
    let result = await barkdown( {
      loader, files
    })

    console.log(result)
  })

  it('will pass operational error trying to load non-existent file', async () => {
    const files = [ 'notafile.yaml' ]
    let result = await barkdown( {
      loader, files
    })
    
    assert.equal( result.errors.length, 1 )
  })

  it('will pass operational error trying to load bad YAML', async () => {
    const files = [ 'badyaml.yaml' ]
    let result = await barkdown( {
      loader, files
    })

    assert.equal( result.errors.length, 1 )
  })
})