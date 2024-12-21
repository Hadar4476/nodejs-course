// readFile/writeFile vs. readFileSync/writeFileSync

// readFile/writeFile:
// - an asynchronous operation which happens in the background without blocking any code.
// - suitable for high-performance and scalable apps.
// - DOES NOT BLOCK THE EVENT LOOP.
// - good for scenarios when:
//   * writing a server-side apps where blocking the event loop could degrade performance.
//   * multiple file operations should be handled.

// readFileSync/writeFileSync:
// - a synchronous operation which blocks the code until its complete.
// - not recommanded for performance-critical or asynchronous enviroments, like handling HTTP requests.
// - BLOCKS THE EVENT LOOP.
// - good for scenerios when:
//   * simplicity is more important than performance.
//   * operation completion must be ensured before proceeding.
//   * performing file operations during the application startup(e.g, loading configuration files).

const fs = require("fs");
const path = require("path");

const rootDir = require("../utils/path");

const filePath = path.join(rootDir, "data", "products.json");

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
