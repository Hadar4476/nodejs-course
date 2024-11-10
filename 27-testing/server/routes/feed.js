import express from "express";

import { body } from "express-validator";

import feedController from "../controllers/feed.js";

import checkAuthentication from "../middleware/auth.js";

const router = express.Router();

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

export default router;
