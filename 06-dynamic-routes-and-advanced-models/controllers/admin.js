const Product = require('../models/product');

exports.getAddProduct = (req, res, next) => {
  res.render('admin/edit-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    product: null,
    isEditMode: false,
  });
};

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const imageUrl = req.body.imageUrl;
  const price = req.body.price;
  const description = req.body.description;
  const product = new Product(null, title, imageUrl, description, price);
  product.save();
  res.redirect('/');
};

exports.getEditProduct = (req, res, next) => {
  const isEditMode = req.query.edit;

  if (!isEditMode) {
    return res.redirect('/');
  }

  const productId = req.params.productId;

  Product.findById(productId, (product) => {
    if (!product) {
      return res.redirect('/');
    }

    res.render('admin/edit-product', {
      pageTitle: 'Add Product',
      path: '/admin/edit-product',
      isEditMode: isEditMode === 'true',
      product,
    });
  });
};

exports.postEditProduct = (req, res, next) => {
  const { productId, title, imageUrl, description, price } = req.body;
  const updatedProduct = new Product(productId, title, imageUrl, description, price);
  updatedProduct.save();
  res.redirect('/admin/products');
};

exports.deleteProduct = (req, res, next) => {
  const productId = req.params.productId;

  Product.deleteById(productId);
  res.redirect('/admin/products');
};

exports.getProducts = (req, res, next) => {
  Product.fetchAll((products) => {
    res.render('admin/products', {
      prods: products,
      pageTitle: 'Admin Products',
      path: '/admin/products',
    });
  });
};
