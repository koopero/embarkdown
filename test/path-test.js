const assert = require('chai').assert
const deepeq = assert.deepEqual
const { resolve } = require('../src/path')

describe('path', () => {
  it('will do simple resolves', () => {
    deepeq( resolve(), [] )
    deepeq( resolve('foo'), ['foo'] )
    deepeq( resolve('foo/bar'), ['foo','bar'] )
  })

  it('leading slash goes back to root', () => {
    deepeq( resolve('foo', 'bar'), ['foo', 'bar'] )
    deepeq( resolve('foo', '/bar'), ['bar'] )
  })

  it('go up a level with dots', () => {
    deepeq( resolve('foo/bar', '../baz'), ['foo', 'baz'] )
  })

  it('ignore single dots', () => {
    deepeq( resolve('foo/bar', '../baz'), ['foo', 'baz'] )
  })

  it('skip blank segments', () => {
    deepeq( resolve('foo//bar', '', 'baz'), ['foo', 'bar', 'baz'] )
  })
})