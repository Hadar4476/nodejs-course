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
      if (!user) {
        return next();
      }

      req.user = user;

      next();
    })
    .catch((err) => {
      next(new Error(err));
    });
});

app.use(csrfToken.generateCsrfToken);

app.use(flash());

app.use((req, res, next) => {
  res.locals.isLoggedIn = req.session.isLoggedIn;

  next();
});

app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.get("/500", errorController.get500);

app.use(errorController.get404);

// this is a special middleware which is detected by express because it is 4 arguments
// and can be used in catch blocks on the controllers
// in catch blocks when you use next(err) it will trigger this middleware
app.use((error, req, res, next) => {
  console.log(error);

  res.status(500).render("500", {
    pageTitle: "Error!",
    path: "/500",
    isAuthenticated: req.session.isLoggedIn,
  });
});

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    app.listen(3000);
  })
  .catch((err) => {
    console.log(err);
  });
