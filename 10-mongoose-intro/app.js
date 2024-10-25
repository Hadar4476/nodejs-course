const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const errorController = require("./controllers/error");
const User = require("./models/user");

const app = express();

app.set("view engine", "ejs");
app.set("views", "views");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use((req, res, next) => {
  User.findById("671b646f82c15ee43071e272")
    .then((user) => {
      req.user = new User({
        name: user.name,
        email: user.email,
        cart: user.cart,
        _id: user._id,
      });
      next();
    })
    .catch((err) => console.log(err));
});

app.use("/admin", adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

mongoose
  .connect(
    "mongodb+srv://hadar-read-write:aXRMIfT9ItS6RM40@mongointrocluster09.uwvnh.mongodb.net/shop?retryWrites=true&w=majority"
  )
  .then(() => {
    // create a new user for the first time
    // const user = new User({
    //   name: "hadar",
    //   email: "hadar@gmail.com",
    //   cart: {
    //     items: [],
    //   },
    // });

    // user.save();

    app.listen(3000);
  })
  .catch((err) => {
    console.log(err);
  });
