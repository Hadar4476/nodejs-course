const express = require("express");

const authController = require("../controllers/auth");

const verifyCsrfToken = require("../middleware/csrf");

const router = express.Router();

router.get("/login", authController.getLogin);

router.get("/signup", authController.getSignup);

router.post("/login", verifyCsrfToken, authController.postLogin);

router.post("/signup", verifyCsrfToken, authController.postSignup);

router.post("/logout", verifyCsrfToken, authController.postLogout);

router.get("/password-reset", authController.getResetPassword);

router.post(
  "/password-reset",
  verifyCsrfToken,
  authController.postResetPassword
);

router.get("/new-password/:token", authController.getNewPassword);

router.post("/new-password", verifyCsrfToken, authController.postNewPassword);

module.exports = router;
