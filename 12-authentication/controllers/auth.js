// a package for hashing strings
const bcrypt = require("bcryptjs");

const User = require("../models/user");

exports.getLogin = (req, res, next) => {
  console.log(req.session.isLoggedIn);

  res.render("auth/login", {
    pageTitle: "Login",
    path: "/login",
    isLoggedIn: req.session.isLoggedIn,
  });
};

exports.getSignup = (req, res, next) => {
  console.log(req.session.isLoggedIn);

  res.render("auth/signup", {
    pageTitle: "Sign Up",
    path: "/signup",
    isLoggedIn: req.session.isLoggedIn,
  });
};

exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  User.findOne({ email })
    .then((user) => {
      if (!user) {
        return res.redirect("/login");
      }

      // using bcrypt.compare to compare the password input with the password in database
      return bcrypt.compare(password, user.password).then((isMatch) => {
        if (isMatch) {
          req.session.isLoggedIn = true;
          req.session.user = user;
          return req.session.save((err) => {
            return res.redirect("/");
          });
        }

        throw "No Match";
      });
    })
    .catch((err) => {
      console.log(err);
      res.redirect("/login");
    });
};

exports.postSignup = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;

  // serach for existing user by email
  User.findOne({ email })
    .then((user) => {
      if (user) {
        return res.redirect("/signup");
      }

      // PASSWORD HASH

      // the hash method receives the password and a salt

      // the salt is a random value which is added to the input
      // it is good for security, uniqueness and it also determine the number of iteration
      // for the hashing function to run - making it very hard for attackers and streghten security and uniqueness
      return bcrypt
        .hash(password, 12)
        .then((hashedPassword) => {
          console.log({ hashedPassword });

          const newUser = new User({
            email,
            password: hashedPassword,
            cart: { items: [] },
          });

          return newUser.save();
        })
        .then((result) => {
          console.log(result);

          res.redirect("/login");
        });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    console.log(err);

    res.redirect("/");
  });
};
