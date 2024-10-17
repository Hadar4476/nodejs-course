const path = require('path');

const rootDir = require('../utils/path');

const express = require('express');

const router = express.Router();

router.get('/', (req, res, next) => {
  // sending response as string which will be treated as HTML
  // res.send('<h1>Homepage</h1>');

  // sending an actual HTML file with sendFile
  // __dirname is a global variable which holds the absolute directory on the operating system to this
  // routes folder
  // path.join builds the relative path for multiple operating systems by detecting them
  // adding "../" ensures that it will go one level up
  // res.sendFile(path.join(__dirname, '../', 'views', 'shop.html'));

  // using rootDir here instead of accessing __dirname with the relative path
  res.sendFile(path.join(rootDir, 'views', 'shop.html'));
});

module.exports = router;
