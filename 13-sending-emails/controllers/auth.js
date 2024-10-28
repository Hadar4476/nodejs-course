const bcrypt = require("bcryptjs");
const nodeMailer = require("nodemailer");
const sendgridTransport = require("nodemailer-sendgrid-transport");

const User = require("../models/user");

const transporter = nodeMailer.createTransport(
  sendgridTransport({
    auth: {
      api_key:
        "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",
    },
  })
);

exports.getLogin = (req, res, next) => {
  console.log(req.session.isLoggedIn);

  const message = req.flash("loginError");

  res.render("auth/login", {
    pageTitle: "Login",
    path: "/login",
    errorMessage: message[0],
  });
};

exports.getSignup = (req, res, next) => {
  console.log(req.session.isLoggedIn);

  const message = req.flash("signupError");

  res.render("auth/signup", {
    pageTitle: "Sign Up",
    path: "/signup",
    errorMessage: message[0],
  });
};

exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  User.findOne({ email })
    .then((user) => {
      if (!user) {
        req.flash("loginError", "Invalid email or password");

        return res.redirect("/login");
      }

      return bcrypt.compare(password, user.password).then((isMatch) => {
        if (isMatch) {
          req.session.isLoggedIn = true;
          req.session.user = user;
          return req.session.save((err) => {
            return res.redirect("/");
          });
        }

        req.flash("loginError", "Invalid email or password");

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

  User.findOne({ email })
    .then((user) => {
      if (user) {
        req.flash("signupError", "Email already exists");

        return res.redirect("/signup");
      }

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
          return transporter.sendMail({
            to: email,
            from: "hadarudemy@gmail.com",
            subject: "Signup succeeded!",
            html: "<h1>You successfully signed up!</h1>",
          });
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
