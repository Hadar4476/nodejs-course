const fs = require("fs");
const path = require("path");

const { validationResult } = require("express-validator");

const Post = require("../models/post");
const User = require("../models/user");

exports.getPosts = async (req, res, next) => {
  const currentPage = req.query.page || 1;
  const perPage = 2;

  try {
    const count = await Post.find().countDocuments();
    const posts = await Post.find()
      .populate("creator")
      .skip((currentPage - 1) * perPage)
      .limit(perPage);

    res.status(200).json({
      message: "Posts fetched successfully!",
      posts,
      totalItems: count,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }

    next(err);
  }
};

exports.createPost = async (req, res, next) => {
  const errors = validationResult(req);

  const isExressValidatorError = !errors.isEmpty();
  const isNoImage = !req.file;

  if (isExressValidatorError || isNoImage) {
    const message = isExressValidatorError
      ? "Validation failed, data is incorrect"
      : "No image provided";

    const error = new Error(message);
    error.statusCode = 422;

    throw error;
  }

  const userId = req.userId;

  const title = req.body.title;
  const content = req.body.content;
  const imageUrl = req.file.path.replace("\\", "/");

  try {
    const newPost = new Post({
      title,
      content,
      imageUrl,
      creator: userId,
    });

    await newPost.save();

    const user = await User.findById(req.userId);
    user.posts.push(newPost);

    await user.save();

    res.status(201).json({
      message: "Post created successfully!",
      post: newPost,
      creator: {
        _id: user._id,
        name: user.name,
      },
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }

    next(err);
  }
};

exports.getPostById = async (req, res, next) => {
  const postId = req.params.postId;

  try {
    const post = await Post.findById(postId);

    if (!post) {
      const error = new Error("No post was found");
      error.statusCode = 404;

      throw error;
    }

    res.status(200).json({ message: "Post fetched successfully!", post });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }

    next(err);
  }
};

const clearImage = (filePath) => {
  const absolutePath = path.join(process.cwd(), filePath);

  fs.unlink(absolutePath, (err) => {
    if (err) {
      throw err;
    }
  });
};

exports.updatePostById = async (req, res, next) => {
  const errors = validationResult(req);

  const isExressValidatorError = !errors.isEmpty();

  if (isExressValidatorError) {
    const message = "Validation failed, data is incorrect";
    const error = new Error(message);
    error.statusCode = 422;

    throw error;
  }

  const postId = req.params.postId;
  const userId = req.userId;

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

  try {
    const post = await Post.findById(postId);

    if (!post) {
      const error = new Error("No post was found");
      error.statusCode = 404;

      throw error;
    }

    if (post.creator.toString() !== userId) {
      const error = new Error("Not authorized");
      error.statusCode = 403;

      throw error;
    }

    if (imageUrl !== post.imageUrl) {
      clearImage(post.imageUrl);
    }

    post.title = title;
    post.content = content;
    post.imageUrl = imageUrl;

    const updatedPost = await post.save();

    res.status(200).json({
      message: "Post updated successfully!",
      post: updatedPost,
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }

    next(err);
  }
};

exports.deletePostbyId = async (req, res, next) => {
  const postId = req.params.postId;
  const userId = req.userId;

  try {
    const post = await Post.findById(postId);

    if (!post) {
      const error = new Error("No post was found");
      error.statusCode = 404;

      throw error;
    }

    if (post.creator.toString() !== userId) {
      const error = new Error("Not authorized");
      error.statusCode = 403;

      throw error;
    }

    clearImage(post.imageUrl);

    await Post.findByIdAndDelete(postId);

    const user = await User.findById(userId);
    user.posts.pull(postId);

    await user.save();

    res.status(200).json({
      message: "Post deleted successfully",
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }

    next(err);
  }
};
