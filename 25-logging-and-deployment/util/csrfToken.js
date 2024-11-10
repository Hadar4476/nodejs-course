const crypto = require("crypto");

exports.generateCsrfToken = (req, res, next) => {
  if (!req.session.csrfToken) {
    req.session.csrfToken = crypto.randomBytes(64).toString("hex");
  }

  res.locals.csrfToken = req.session.csrfToken; // Make it accessible in EJS views

  next();
};
