const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const flash = require("connect-flash");

const session = require("express-session");
const MongoDbStore = require("connect-mongodb-session");
const MongoDbStoreSession = MongoDbStore(session);

const errorController = require("./controllers/error");
const User = require("./models/user");

const csrfToken = require("./util/csrfToken");

const MONGODB_URI =
  "mongodb+srv://hadar-read-write:aXRMIfT9ItS6RM40@mongointrocluster09.uwvnh.mongodb.net/shop?retryWrites=true&w=majority";

const app = express();

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

app.use(
  session({
    secret: "9f86d081884c7d659a2feaa0",
    resave: false,
    saveUninitialized: false,
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

// CSRF stand for Cross Site Request Forgery which is an attack that exploits the usage of a session

// in the client's Network, the requests information is visual, including the session
// with that information another user can take advantage of it and send a request to my server from
// another website and apply some unwanted actions.

// To avoid this and optimize the security, instead of just relying on the session
// I can generate a token on my server and attach it to the request and the session
// so now I can verify this csrfToken with verifyCsrfToken middleware for every POST request
// GET request are just for read purposes so there is no need to add it there.

// Adding is done by creating a hidden input element, see forms in ejs files for more information
app.use(csrfToken.generateCsrfToken);

// a package which can be used as middleware for displaying messages to the user
app.use(flash());

// sets a global variable which can be used in the views files
app.use((req, res, next) => {
  res.locals.isLoggedIn = req.session.isLoggedIn;

  next();
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
