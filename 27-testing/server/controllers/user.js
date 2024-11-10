import { validationResult } from "express-validator";

import User from "../models/user.js";

const getUserStatus = async (req, res, next) => {
  const userId = req.userId;

  try {
    const user = await User.findById(userId);

    if (!user) {
      const error = new Error("No user found");
      error.statusCode = 404;

      throw error;
    }

    res.status(200).json({ userStatus: user.status });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }

    next(err);
  }
};

const updateUserStatus = async (req, res, next) => {
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

    res.status(200).json({ userStatus: user.status });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }

    next(err);
  }
};

export default {
  getUserStatus,
  updateUserStatus,
};
