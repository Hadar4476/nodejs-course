const fs = require('fs');
const path = require('path');

const rootDir = require('../utils/path');

const filePath = path.join(rootDir, 'data', 'products.json');

const getProductsFromJSON = (callback) => {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      return callback([]);
    }

    return callback(JSON.parse(data));
  });
};

class Product {
  constructor(title) {
    this.title = title;
  }

  save() {
    getProductsFromJSON((products) => {
      products.push(this);

      fs.writeFile(filePath, JSON.stringify(products), (err) => {
        console.log(err);
      });
    });
  }

  static fetchAll(callback) {
    getProductsFromJSON(callback);
  }
}

module.exports = Product;
