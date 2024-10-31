const express = require("express");
const { check, body } = require("express-validator");

const User = require("../models/user");

const authController = require("../controllers/auth");

const verifyCsrfToken = require("../middleware/csrf");

const router = express.Router();

router.get("/login", authController.getLogin);

router.get("/signup", authController.getSignup);

router.post(
  "/login",
  verifyCsrfToken,
  [
    body("email", "Please enter a valid email").isEmail().normalizeEmail(),
    body(
      "password",
      "Please enter a password of only numbers and characters with a length of 5"
    )
      .isLength({ min: 5 })
      .isAlphanumeric()
      .trim(),
  ],
  authController.postLogin
);

router.post(
  "/signup",
  verifyCsrfToken,
  [
    // go to signup.ejs and on the form element and add novalidate to disable default browser validatiion
    check("email")
      .isEmail()
      .withMessage("Please enter a valid email")
      // lowercase email
      .normalizeEmail()
      // you can also add custom validation
      .custom((value, { req }) => {
        // if (value === "test@test.com") {
        //   throw new Error("This email address is forbidden");
        // }

        // // return true if its valid
        // return true;

        return User.findOne({ email: value }).then((userDoc) => {
          if (userDoc) {
            return Promise.reject("Email already exists");
          }
        });
      }),
    // body is alternative to check
    // adding the 2nd paramter for validation message which will be general for all validation
    body(
      "password",
      "Please enter a password of only numbers and characters with a length of 5"
    )
      .isLength({ min: 5 })
      // // this is a validation message for password specifically
      // .withMessage(
      //   "Please enter a password of only numbers and characters with a length of 5"
      // )
      .isAlphanumeric()
      .trim(),
    body("confirmPassword").custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Passwords must match");
      }

      return true;
    }),
  ],
  authController.postSignup
);

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
