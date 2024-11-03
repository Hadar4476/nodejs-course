const jwt = require("jsonwebtoken");

const config = require("../config/token");

const checkAuthentication = (req, res, next) => {
  const authHeader = req.get("Authorization");

  if (!authHeader) {
    const error = new Error("Not authenticated");
    error.statusCode = 401;

    throw error;
  }

  const token = authHeader.split(" ")[1];

  let decodedToken;

  try {
    decodedToken = jwt.verify(token, config.tokenSecret);
  } catch (err) {
    err.statusCode = 500;

    throw err;
  }

  // case for JWT not enabling to verify the token
  if (!decodedToken) {
    const error = new Error("Not authenticated");
    error.statusCode = 401;

    throw error;
  }

  req.userId = decodedToken.userId;

  next();
};

module.exports = checkAuthentication;
