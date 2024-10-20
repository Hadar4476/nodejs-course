const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');

const Product = require('./models/product');
const User = require('./models/user');

const Cart = require('./models/cart');
const CartItem = require('./models/cart-item');

const Order = require('./models/order');
const OrderItem = require('./models/order-item');

const errorController = require('./controllers/error');

const sequelize = require('./util/database');

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

// this middleware will execute on every request
app.use((req, res, next) => {
  User.findByPk(1)
    .then((user) => {
      // saving the user on the request
      req.user = user;

      // passing to the next middleware
      next();
    })
    .catch((err) => {
      console.log(err);
    });
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

// creates a relation between product and user models
Product.belongsTo(User, {
  constraints: true,
  onDelete: 'CASCADE',
});
User.hasMany(Product);

// user can only have one cart
User.hasOne(Cart);

// creates a relation between cart and user
Cart.belongsTo(User);

// creates a relataion between cart which can hold many products
// the connection is through the CartItem model
Cart.belongsToMany(Product, { through: CartItem });

// creates a relation between product and cart because many products can belong to more than 1 cart
// the connection is through the CartItem model
Product.belongsToMany(Cart, { through: CartItem });

// creating a relation between order and user
Order.belongsTo(User);

// user can have many orders
User.hasMany(Order);

// creating a relation between order and products and the connection is through order item
Order.belongsToMany(Product, { through: OrderItem });

sequelize
  // force an overwrite of the current tables on first init so no need to keep that
  // uncomment when you want to set new relations or tables
  // .sync({ force: true })
  .sync()
  .then((result) => {
    return User.findByPk(1);
  })
  .then((user) => {
    if (!user) {
      return User.create({ name: 'Hadar', email: 'hadar@gmail.com' });
    }

    return user;
  })
  // .then((user) => {
  //   return user.createCart();
  // })
  .then(() => {
    app.listen(3000);
  })
  .catch((err) => {
    console.log(err);
  });
