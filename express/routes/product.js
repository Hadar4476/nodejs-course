const path = require('path');

const express = require('express');

const router = express.Router();

const route = '/product';

router.get(route, (req, res, next) => {
  // sending response as string which will be treated as HTML
  // res.send(`
  //   <form action="/product" method="POST">
  //       <input name="title"/>
  //       <button type="submit">Add Product</button>
  //   </form>
  //   `);

  // see routes/shop.js for full explanation
  res.sendFile(path.join(__dirname, '../', 'views', 'product-editor.html'));
});

router.post(route, (req, res, next) => {
  console.log(req.body);

  res.redirect('/');
});

module.exports = router;
