const verifyCsrfToken = (req, res, next) => {
  const tokenFromSession = req.session.csrfToken;
  const tokenFromRequest = req.body.csrfToken;

  if (!tokenFromRequest || tokenFromRequest !== tokenFromSession) {
    return res.status(403).send("Invalid CSRF token");
  }

  next();
};

module.exports = verifyCsrfToken;
