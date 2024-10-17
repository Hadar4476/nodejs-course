const path = require('path');

// finds the absolute directory automatically
module.exports = path.dirname(require.main.filename);
