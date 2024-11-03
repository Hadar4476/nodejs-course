const express = require("express");

const { body } = require("express-validator");

const router = express.Router();

const feedController = require("../controllers/feed");

const checkAuthentication = require("../middleware/auth");

router.get("/posts", checkAuthentication, feedController.getPosts);

router.post(
  "/posts",
  checkAuthentication,
  [
    body("title").trim().isLength({ min: 5 }),
    body("content").trim().isLength({ min: 5 }),
  ],
  feedController.createPost
);

router.get("/posts/:postId", checkAuthentication, feedController.getPostById);

router.put(
  "/posts/:postId",
  checkAuthentication,
  [
    body("title").trim().isLength({ min: 5 }),
    body("content").trim().isLength({ min: 5 }),
  ],
  feedController.updatePostById
);

router.delete(
  "/posts/:postId",
  checkAuthentication,
  feedController.deletePostbyId
);

module.exports = router;
