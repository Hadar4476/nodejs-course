const mongodb = require("mongodb");
const database = require("../util/database");

class Product {
  constructor(title, price, description, imageUrl, id, userId) {
    this._id = id ? new mongodb.ObjectId(`${id}`) : null;
    this.title = title;
    this.price = price;
    this.description = description;
    this.imageUrl = imageUrl;
    this.userId = userId ? new mongodb.ObjectId(`${userId}`) : null;
  }

  save() {
    const db = database.getDb();

    let dbOp;

    if (this._id) {
      dbOp = db
        .collection("products")
        .updateOne({ _id: this._id }, { $set: this });
    } else {
      dbOp = db.collection("products").insertOne(this);
    }

    return dbOp
      .then((result) => {
        console.log(result);
      })
      .catch((err) => {
        console.log(err);
      });
  }

  static fetchAll() {
    const db = database.getDb();

    return db
      .collection("products")
      .find()
      .toArray()
      .then((products) => {
        return products;
      })
      .catch((err) => {
        console.log(err);
      });
  }

  static findById(id) {
    const db = database.getDb();

    // using find instead of findOne here for an example
    // calling next after find will get the last document in the results
    return db
      .collection("products")
      .find({ _id: new mongodb.ObjectId(`${id}`) })
      .next()
      .then((product) => {
        console.log(product);

        return product;
      })
      .catch((err) => {
        console.log(err);
      });
  }

  static deleteById(id) {
    const db = database.getDb();

    return db
      .collection("products")
      .deleteOne({ _id: new mongodb.ObjectId(`${id}`) })
      .then((result) => {
        // deleting all products from all carts of all users
        return db.collection("users").updateMany(
          {},
          {
            $pull: {
              "cart.items": { productId: new mongodb.ObjectId(`${id}`) },
            },
          }
        );
      })
      .catch((err) => {
        console.log(err);
      });
  }
}

module.exports = Product;
