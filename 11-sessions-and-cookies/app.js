const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const session = require("express-session");
const MongoDbStore = require("connect-mongodb-session");
const MongoDbStoreSession = MongoDbStore(session);

const errorController = require("./controllers/error");
const User = require("./models/user");

const MONGODB_URI =
  "mongodb+srv://hadar-read-write:aXRMIfT9ItS6RM40@mongointrocluster09.uwvnh.mongodb.net/shop?retryWrites=true&w=majority";

const app = express();

// SESSION
const store = new MongoDbStoreSession({
  uri: MONGODB_URI,
  collection: "sessions",
});

app.set("view engine", "ejs");
app.set("views", "views");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

// SESSION
// using session inside a middleware
// this session will also be saved under Application -> Cookie in DevTools under the name of 'connect.sid'
// closing the browser will result in losing the cookie session
app.use(
  session({
    // secret will be used to sign the hash which will be stored in the client's cookie
    secret: "9f86d081884c7d659a2feaa0",

    // resave: false will disable the session of being saved on every request that is done and
    // will listen to changes to the session only which also improve performance
    resave: false,

    // saveUninitialized: false makes sure that sessions will only be saved in store if they are modified
    saveUninitialized: false,

    // storing the session in mongodb database
    // store points to the storing resource of the session, there are many stores and in this case its mongodb
    store: store,
  })
);

app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }

  User.findById(req.session.user._id)
    .then((user) => {
      req.user = user;

      next();
    })
    .catch((err) => console.log(err));
});

app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.use(errorController.get404);

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    app.listen(3000);
  })
  .catch((err) => {
    console.log(err);
  });
