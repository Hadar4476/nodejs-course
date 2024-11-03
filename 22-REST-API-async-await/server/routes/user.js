const express = require("express");
const { body } = require("express-validator");

const router = express.Router();

const checkAuthentication = require("../middleware/auth");

const userController = require("../controllers/user");

router.get("/status", checkAuthentication, userController.getUserStatus);

router.patch(
  "/status",
  checkAuthentication,
  [body("status").trim().not().isEmpty()],
  userController.updateUserStatus
);

module.exports = router;
