exports.ingest = require('./src/ingest')
exports.ingest.defaultLoader = exports.Loader = require('./src/loader.browser.js')
