#!/usr/bin/env node
runCLI()

function runCLI() {
  const _ = require('lodash')
  require('yargs')
    .usage('Usage: $0 <command> [options]')
    .alias('f','file')
    .command('tree load', 'Show tree from index file', (yargs)=>{
      yargs.positional('load', {
        describe: 'index file to load'
      })
    }, async (argv) => {
      let chunk = _.pick( argv, ['load'] )
      const ingest = require('../index').ingest
      const site = await ingest( chunk )
      let chunks = site.chunks

      let tree = site.tree()
      let result = site.pages( {
        minLevel: 1,
        maxLevel: 1,
      }) 

      console.dir( result, {depth: 10} )
      process.exit()
    })
    .argv
}