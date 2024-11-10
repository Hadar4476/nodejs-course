import express from "express";
import { body } from "express-validator";

import checkAuthentication from "../middleware/auth.js";

import userController from "../controllers/user.js";

const router = express.Router();

router.get("/status", checkAuthentication, userController.getUserStatus);

router.patch(
  "/status",
  checkAuthentication,
  [body("status").trim().not().isEmpty()],
  userController.updateUserStatus
);

export default router;
