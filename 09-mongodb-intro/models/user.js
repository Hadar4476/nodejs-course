const mongodb = require("mongodb");

const database = require("../util/database");

class User {
  constructor(name, email, cart, id) {
    this._id = id ? new mongodb.ObjectId(`${id}`) : null;
    this.name = name;
    this.email = email;
    this.cart = cart;
  }

  save() {
    const db = database.getDb();

    return db.collection("users").insertOne(this);
  }

  addToCart(product) {
    const db = database.getDb();

    const cartProductIndex = this.cart.items.findIndex(
      (item) => item.productId.toString() === product._id.toString()
    );
    const updatedCartItems = [...this.cart.items];
    let quantity = 1;

    const isExist = cartProductIndex >= 0;

    if (isExist) {
      quantity = this.cart.items[cartProductIndex].quantity + 1;
      updatedCartItems[cartProductIndex].quantity = quantity;
    } else {
      updatedCartItems.push({
        productId: new mongodb.ObjectId(`${product._id}`),
        quantity,
      });
    }

    const updatedCart = {
      items: updatedCartItems,
    };

    return db
      .collection("users")
      .updateOne({ _id: this._id }, { $set: { cart: updatedCart } });
  }

  getCart() {
    const db = database.getDb();

    const productsIds = this.cart.items.map((item) => item.productId);

    return db
      .collection("products")
      .find({ _id: { $in: productsIds } })
      .toArray()
      .then((products) => {
        return products.map((product) => {
          const quantity = this.cart.items.find(
            (item) => item.productId.toString() === product._id.toString()
          ).quantity;

          return { ...product, quantity };
        });
      })
      .catch((err) => {
        console.log(err);
      });
  }

  deleteCartProduct(prodId) {
    const db = database.getDb();

    const cart = {
      ...this.cart,
      items: this.cart.items.filter(
        (item) => item.productId.toString() !== prodId.toString()
      ),
    };

    return db
      .collection("users")
      .updateOne({ _id: this._id }, { $set: { cart } });
  }

  addOrder() {
    const db = database.getDb();

    return this.getCart().then((products) => {
      const order = {
        user: {
          _id: this._id,
          name: this.name,
        },
        items: products,
      };

      return db
        .collection("orders")
        .insertOne(order)
        .then((result) => {
          this.cart = { items: [] };

          return db
            .collection("users")
            .updateOne({ _id: this._id }, { $set: { cart: { items: [] } } });
        })
        .catch((err) => {
          console.log(err);
        });
    });
  }

  getOrders() {
    const db = database.getDb();

    return db
      .collection("orders")
      .find({ "user._id": new mongodb.ObjectId(this._id) })
      .toArray();
  }

  static findById(id) {
    const db = database.getDb();

    return db
      .collection("users")
      .findOne({ _id: new mongodb.ObjectId(`${id}`) })
      .then((user) => {
        return user;
      })
      .catch((err) => {
        console.log(err);
      });
  }
}

module.exports = User;
