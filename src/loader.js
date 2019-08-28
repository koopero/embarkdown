const fs = require('fs-extra')
module.exports = async ( file ) => fs.readFile( file )
