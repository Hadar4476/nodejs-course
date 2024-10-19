const fs = require('fs');
const path = require('path');

const p = path.join(path.dirname(process.mainModule.filename), 'data', 'cart.json');

module.exports = class Cart {
  static getCart(cb) {
    fs.readFile(p, (err, data) => {
      const cart = JSON.parse(data);

      if (err) {
        cb(null);
      } else {
        cb(cart);
      }
    });
  }

  static addProduct(id, price) {
    fs.readFile(p, (err, data) => {
      let cart = { products: [], totalPrice: 0 };

      if (!err) {
        cart = JSON.parse(data);
      }

      const existingProductIndex = cart.products.findIndex((i) => i.id === id);
      const existingProduct = cart.products[existingProductIndex];

      let updatedProduct;

      if (existingProduct) {
        updatedProduct = { ...existingProduct };
        updatedProduct.qty = updatedProduct.qty + 1;

        cart.products = [...cart.products];
        cart.products[existingProductIndex] = updatedProduct;
      } else {
        updatedProduct = {
          id,
          qty: 1,
        };
        cart.products = [...cart.products, updatedProduct];
      }

      cart.totalPrice = cart.totalPrice + +price;

      fs.writeFile(p, JSON.stringify(cart), (err) => {
        console.log(err);
      });
    });
  }

  static deleteProduct(id, price) {
    fs.readFile(p, (err, data) => {
      if (err) {
        return;
      }

      const updatedCart = { ...JSON.parse(data) };
      const product = updatedCart.products.find((item) => item.id === id);

      if (!product) {
        return;
      }

      updatedCart.products = updatedCart.products.filter((i) => i.id !== id);
      updatedCart.totalPrice = updatedCart.totalPrice - product.qty * price;

      fs.writeFile(p, JSON.stringify(updatedCart), (err) => {
        console.log(err);
      });
    });
  }
};
