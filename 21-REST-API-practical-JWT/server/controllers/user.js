const { validationResult } = require("express-validator");

const User = require("../models/user");

exports.getUserStatus = (req, res, next) => {
  const userId = req.userId;

  User.findById(userId)
    .then((user) => {
      if (!user) {
        const error = new Error("No user found");
        error.statusCode = 404;

        throw error;
      }

      res.status(200).json({ status: user.status });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }

      next(err);
    });
};

exports.updateUserStatus = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const error = new Error("validation failed");
    error.statusCode = 422;

    throw error;
  }

  const userId = req.userId;
  const status = req.body.status;

  User.findByIdAndUpdate(userId, { status }, { new: true, runValidators: true })
    .then((user) => {
      if (!user) {
        const error = new Error("No user found");
        error.statusCode = 404;

        throw error;
      }

      res.status(200).json({ status: user.status });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }

      next(err);
    });
};
