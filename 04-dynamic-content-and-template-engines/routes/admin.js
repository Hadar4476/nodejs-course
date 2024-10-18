const path = require('path');

const express = require('express');

const rootDir = require('../utils/path');

const router = express.Router();

// this will be shared with every user as long as the server is running, not a good practice but
// will keep it that way for this topic
const products = [];

// /admin/add-product => GET
router.get('/add-product', (req, res, next) => {
  const dataToInject = {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    isAddProductActive: true,
    applyProductCSS: true,
    applyFormsCSS: true,
  };

  res.render('add-product', dataToInject);
});

// /admin/add-product => POST
router.post('/add-product', (req, res, next) => {
  products.push({ title: req.body.title });
  res.redirect('/');
});

module.exports = {
  routes: router,
  products,
};
