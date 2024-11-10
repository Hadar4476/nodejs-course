import { validationResult } from "express-validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

import config from "../config/token.js";

import User from "../models/user.js";

const signup = async (req, res, next) => {
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

  try {
    const hashedPassword = await bcrypt.hash(password, 12);

    const user = new User({
      email,
      name,
      password: hashedPassword,
    });

    const result = await user.save();

    if (result) {
      res
        .status(201)
        .json({ message: "User created successfully", userId: result._id });
    }
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }

    next(err);
  }
};

const login = async (req, res, next) => {
  const errorMessage = "Invalid email or password";

  const email = req.body.email;
  const password = req.body.password;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      const error = new Error(errorMessage);
      error.statusCode = 401;
      throw error;
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      const error = new Error(errorMessage);
      error.statusCode = 401;
      throw error;
    }

    const tokenJsonData = {
      email: user.email,
      userId: user._id.toString(),
    };

    const tokenSecret = config.tokenSecret;

    const tokenConfig = {
      expiresIn: "1h",
    };

    const token = jwt.sign(tokenJsonData, tokenSecret, tokenConfig);

    if (token) {
      res.status(200).json({ token, userId: user._id.toString() });
    }

    // only for testing purposes
    // to return the promise of this function
    return;
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }

    next(err);

    // only for testing purposes
    // to return the promise of this function
    return err;
  }
};

export default {
  login,
  signup,
};
