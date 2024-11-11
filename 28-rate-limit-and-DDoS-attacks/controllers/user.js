const { validationResult } = require("express-validator");

const User = require("../models/user");

exports.getUserStatus = async (req, res, next) => {
  const userId = req.userId;

  try {
    const user = await User.findById(userId);

    if (!user) {
      const error = new Error("No user found");
      error.statusCode = 404;

      throw error;
    }

    res.status(200).json({ status: user.status });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }

    next(err);
  }
};

exports.updateUserStatus = async (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const error = new Error("validation failed");
    error.statusCode = 422;

    throw error;
  }

  const userId = req.userId;
  const status = req.body.status;

  try {
    const user = await User.findByIdAndUpdate(
      userId,
      { status },
      { new: true, runValidators: true }
    );

    if (!user) {
      const error = new Error("No user found");
      error.statusCode = 404;

      throw error;
    }

    res.status(200).json({ status: user.status });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }

    next(err);
  }
};
