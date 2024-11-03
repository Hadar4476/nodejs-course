const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const config = require("../config/token");

const User = require("../models/user");

exports.signup = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error("validation failed");
    error.statusCode = 422;
    error.data = errors.array();

    throw error;
  }

  const email = req.body.email;
  const name = req.body.name;
  const password = req.body.password;

  bcrypt
    .hash(password, 12)
    .then((hashedPassword) => {
      const user = new User({
        email,
        name,
        password: hashedPassword,
      });

      return user.save();
    })
    .then((result) => {
      res
        .status(201)
        .json({ message: "User created successfully", userId: result._id });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }

      next(err);
    });
};

exports.login = (req, res, next) => {
  const errorMessage = "Invalid email or password";

  const email = req.body.email;
  const password = req.body.password;

  let loadedUser;

  User.findOne({ email })
    .then((user) => {
      if (!user) {
        const error = new Error(errorMessage);
        error.statusCode = 401;
        throw error;
      }

      loadedUser = user;

      return bcrypt.compare(password, user.password);
    })
    .then((isMatch) => {
      if (!isMatch) {
        const error = new Error(errorMessage);
        error.statusCode = 401;
        throw error;
      }

      // JWT TOKEN
      // because REST APIs don't care about a client, there is no saved session on the server with a cookie
      // like in the previous lectures because the server does not store anthing about a client.
      // instead the server needs to identify the user by a generating a token on the server which will be attached to every
      // request which requires an authentication

      // the token is stored in the client inside local storage.
      // if a user will try to change that token the server will detect it is invalid and throw an error.
      // you can only create this token in the server, so it is very secured.

      // JWT TOKEN JSON DATA
      const tokenJsonData = {
        email: loadedUser.email,
        userId: loadedUser._id.toString(),
      };

      // JWT TOKEN SECRET
      const tokenSecret = config.tokenSecret;

      // JWT TOKEN CONFIG
      const tokenConfig = {
        // for security, the token will be invalid in 1 hour from use
        expiresIn: "1h",
      };

      // JWT TOKEN GENERATION
      const token = jwt.sign(tokenJsonData, tokenSecret, tokenConfig);

      res.status(200).json({ token, userId: loadedUser._id.toString() });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }

      next(err);
    });
};
