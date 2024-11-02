const fs = require("fs");
const path = require("path");

const { validationResult } = require("express-validator");

const Post = require("../models/post");

exports.getPosts = (req, res, next) => {
  Post.find()
    .then((posts) => {
      res.status(200).json({
        message: "Posts fetched successfully!",
        posts,
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }

      next(err);
    });
};

exports.createPost = (req, res, next) => {
  const errors = validationResult(req);

  const isExressValidatorError = !errors.isEmpty();
  const isNoImage = !req.file;

  if (isExressValidatorError || isNoImage) {
    // // instead of in MVC:
    // return res.status(422).render("VIEW ROUTE", {
    //   pageTitle: "TITLE",
    //   path: "PATH",
    //   errorMessage: "Validation failed, data is incorrect",
    // });

    const message = isExressValidatorError
      ? "Validation failed, data is incorrect"
      : "No image provided";

    const error = new Error(message);
    error.statusCode = 422;

    throw error;
  }

  const title = req.body.title;
  const content = req.body.content;
  const imageUrl = req.file.path.replace("\\", "/");

  const newPost = new Post({
    title,
    content,
    imageUrl,
    creator: {
      name: "Hadar",
    },
  });

  newPost
    .save()
    .then((result) => {
      res.status(201).json({
        message: "Post created successfully!",
        post: result,
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }

      next(err);
    });
};

exports.getPostById = (req, res, next) => {
  const postId = req.params.postId;

  Post.findById(postId)
    .then((post) => {
      if (!post) {
        const error = new Error("No post was found");
        error.statusCode = 404;

        throw error;
      }

      res.status(200).json({ message: "Post fetched successfully!", post });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }

      next(err);
    });
};

const clearImage = (filePath) => {
  const absolutePath = path.join(process.cwd(), filePath);

  fs.unlink(absolutePath, (err) => {
    if (err) {
      throw err;
    }
  });
};

exports.updatePostById = (req, res, next) => {
  const errors = validationResult(req);

  const isExressValidatorError = !errors.isEmpty();

  if (isExressValidatorError) {
    const message = "Validation failed, data is incorrect";
    const error = new Error(message);
    error.statusCode = 422;

    throw error;
  }

  const postId = req.params.postId;

  const title = req.body.title;
  const content = req.body.content;
  let imageUrl = req.body.image;

  const imageFile = req.file;

  if (imageFile) {
    imageUrl = imageFile.path.replace("\\", "/");
  }

  if (!imageUrl) {
    const error = new Error("No file picked");
    error.statusCode = 422;

    throw error;
  }

  Post.findById(postId)
    .then((post) => {
      if (!post) {
        const error = new Error("No post was found");
        error.statusCode = 404;

        throw error;
      }

      // checking if imageUrl has changed, if so - delete it
      if (imageUrl !== post.imageUrl) {
        clearImage(post.imageUrl);
      }

      post.title = title;
      post.content = content;
      post.imageUrl = imageUrl;

      return post.save();
    })
    .then((updatedPost) => {
      res.status(200).json({
        message: "Post updated successfully!",
        post: updatedPost,
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }

      next(err);
    });
};

exports.deletePostbyId = (req, res, next) => {
  const postId = req.params.postId;

  Post.findById(postId)
    .then((post) => {
      if (!post) {
        const error = new Error("No post was found");
        error.statusCode = 404;

        throw error;
      }

      clearImage(post.imageUrl);

      return Post.findByIdAndDelete(postId);
    })
    .then((result) => {
      res.status(200).json({
        message: "Post deleted successfully",
      });
    })
    .catch((err) => {
      if (!err.statusCode) {
        err.statusCode = 500;
      }

      next(err);
    });
};
