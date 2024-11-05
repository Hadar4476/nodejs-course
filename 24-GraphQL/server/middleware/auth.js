const jwt = require("jsonwebtoken");

const config = require("../config/token");

const checkAuthentication = (req, res, next) => {
  const authHeader = req.get("Authorization");

  if (!authHeader) {
    // this will get passed to the resolver
    req.isAuth = false;
    return next();
  }

  const token = authHeader.split(" ")[1];

  let decodedToken;

  try {
    decodedToken = jwt.verify(token, config.tokenSecret);
  } catch (err) {
    // this will get passed to the resolver
    req.isAuth = false;
    return next();
  }

  // case for JWT not enabling to verify the token
  if (!decodedToken) {
    // this will get passed to the resolver
    req.isAuth = false;
    return next();
  }

  req.userId = decodedToken.userId;
  req.isAuth = true;

  next();
};

module.exports = checkAuthentication;
