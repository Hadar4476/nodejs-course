const path = require('path');

const express = require('express');

const rootDir = require('../utils/path');
const adminData = require('./admin');

const router = express.Router();

router.get('/', (req, res, next) => {
  console.log('shop.js', adminData.products);
  const products = adminData.products;

  // instead of sending an HTML file like this
  // res.sendFile(path.join(rootDir, 'views', 'shop.html'));

  // this is the data which will be injectable in shop.pug/hbs/ejs file
  const dataToInject = {
    pageTitle: 'My Shop',
    path: '/',
    products,
    isNotEmpty: products.length > 0,
    isShopActive: true,
    applyProductCSS: true,

    // layout is a built-in key which express understands
    // by default, every hbs is going to be applied to the main layout,
    // by setting this to false it will seperate the file from the layout
    // layout:false
  };

  // there is no pointer for if this file is of type pug, express-handlebars or ejs,
  // it just stays the way it is with .render

  // using a view engine, pointing to the name of the file with the special method: .render
  // no need to add .pug here because using .set already adds the .pug extension
  res.render('shop', dataToInject);
});

module.exports = router;
