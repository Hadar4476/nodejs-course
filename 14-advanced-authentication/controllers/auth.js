const bcrypt = require("bcryptjs");
const nodeMailer = require("nodemailer");
const sendgridTransport = require("nodemailer-sendgrid-transport");
const crypto = require("crypto");

const User = require("../models/user");
const user = require("../models/user");

const transporter = nodeMailer.createTransport(
  sendgridTransport({
    auth: {
      api_key:
        "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",
    },
  })
);

const sendgridFromEmail = "hadarudemy@gmail.com";

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
            from: sendgridFromEmail,
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

exports.getResetPassword = (req, res, next) => {
  const message = req.flash("passwordResetError");

  res.render("auth/password-reset", {
    pageTitle: "Password Reset",
    path: "/password-reset",
    errorMessage: message[0],
  });
};

exports.postResetPassword = (req, res, next) => {
  const email = req.body.email;

  // creating a random token of 32 length with crypto
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log(err);
      return res.redirect("/password-reset");
    }

    const token = buffer.toString("hex");

    User.findOne({ email })
      .then((user) => {
        if (!user) {
          req.flash("passwordResetError", "No account with that email found.");

          return res.redirect("/password-reset");
        }

        const passwordReset = {
          token: token,
          // expire time will be 1 hour from now
          expiration: Date.now() + 3600000,
        };

        user.passwordReset = passwordReset;
        user
          .save()
          .then((result) => {
            res.redirect("/");

            const url = `http://localhost:3000/new-password/${token}`;

            transporter.sendMail({
              to: email,
              from: sendgridFromEmail,
              subject: "Password Reset",
              html: `
                <h1>Your Password Reset Request Is Ready</h1>
                <p>Please click the link to set a new password.</p>
                <a href="${url}">Reset Password</a>
              `,
            });
          })
          .catch((err) => {
            throw err;
          });
      })
      .catch((err) => {
        console.log(err);
      });
  });
};

exports.getNewPassword = (req, res, next) => {
  const token = req.params.token;

  // in case there is no matching user on `http://localhost:3000/new-password/<crypto token>`
  // checking both token and expiration date
  // checking if the expiration date is greater than now
  User.findOne({
    "passwordReset.token": token,
    "passwordReset.token": { $gt: Date.now() },
  })
    .then((user) => {
      const message = req.flash("newPasswordError");

      res.render("auth/new-password", {
        pageTitle: "Password Reset",
        path: "/password-reset",
        errorMessage: message[0],
        userId: user._id.toString(),
        passwordToken: token,
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.postNewPassword = (req, res, next) => {
  const newPassword = req.body.password;
  const userId = req.body.userId;
  const passwordToken = req.body.passwordToken;

  let updatedUser;

  User.findOne({
    _id: userId,
    "passwordReset.token": passwordToken,
    "passwordReset.token": { $gt: Date.now() },
  })
    .then((user) => {
      updatedUser = user;
      return bcrypt.hash(newPassword, 12);
    })
    .then((hashedPassword) => {
      console.log({ hashedPassword });

      updatedUser.password = hashedPassword;
      updatedUser.passwordReset = null;

      return updatedUser.save();
    })
    .then((result) => {
      console.log(result);

      res.redirect("/login");
    })
    .catch((err) => {
      console.log(err);
    });
};
