const path = require("path");

const bcrypt = require("bcryptjs");
const validator = require("validator");
const jwt = require("jsonwebtoken");

const config = require("../config/token");

const fileUtil = require("../utils/file");

const User = require("../models/user");
const Post = require("../models/post");

// send a POST request with Postman or other way
// set the URL to localhost:8080/graphql
// pass this JSON data in the body:

// "{
//     "query": "{ RESOLVER_NAME { KEY_#1, KEY_#2 } }"
// }"

// this will get only KEY_#1 and KEY_#2 fields on the "RESOLVER_NAME" schema

const helloResolver = () => {
  return { text: "Hello World!", views: 2 };
};

const loginResolver = async (args, req) => {
  const errorMessage = "Invalid email or password";

  const email = args.email;
  const password = args.password;

  const user = await User.findOne({ email });

  if (!user) {
    const error = new Error(errorMessage);
    error.statusCode = 401;
    throw error;
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    const error = new Error(errorMessage);
    error.statusCode = 401;
    throw error;
  }

  const tokenJsonData = {
    email: user.email,
    userId: user._id.toString(),
  };

  const tokenSecret = config.tokenSecret;

  const tokenConfig = {
    expiresIn: "1h",
  };

  const token = jwt.sign(tokenJsonData, tokenSecret, tokenConfig);

  return { token, userId: user._id.toString() };
};

const createUserResolver = async (args, req) => {
  const email = args.userInput.email;
  const name = args.userInput.name;
  const password = args.userInput.password;

  const errors = [];

  if (!validator.isEmail(email)) {
    errors.push({ message: "Email is invalid" });
  }

  if (
    validator.isEmpty(password.trim()) ||
    !validator.isLength(password, { min: 5 })
  ) {
    errors.push({ message: "Password is invalid" });
  }

  if (errors.length) {
    const error = new Error("Invalid input");

    error.data = errors;
    error.statusCode = 422;

    throw error;
  }

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    const error = new Error("User already exists!");
    throw error;
  }

  const hashedPaaword = await bcrypt.hash(password, 12);
  const user = new User({
    email,
    name,
    password: hashedPaaword,
  });

  const createdUser = await user.save();

  return {
    ...createdUser._doc,
    _id: createdUser._id.toString(),
  };
};

const createPostResolver = async (args, req) => {
  if (!req.isAuth) {
    const error = new Error("Not authenticated");
    error.statusCode = 401;

    throw error;
  }

  const title = args.postInput.title;
  const content = args.postInput.content;
  const imageUrl = args.postInput.imageUrl;

  const errors = [];

  if (validator.isEmpty(title) || !validator.isLength(title, { min: 5 })) {
    errors.push({ message: "Title is invalid" });
  }

  if (validator.isEmpty(content) || !validator.isLength(content, { min: 5 })) {
    errors.push({ message: "Content is invalid" });
  }

  if (errors.length) {
    const error = new Error("Invalid input");

    error.data = errors;
    error.statusCode = 422;

    throw error;
  }

  const userId = req.userId;

  const user = await User.findById(userId);

  if (!user) {
    const error = new Error("Invalid user");
    error.statusCode = 401;
    throw error;
  }

  const newPost = await new Post({
    title,
    content,
    imageUrl,
    creator: user,
  });

  const createdPost = await newPost.save();

  user.posts.push(createdPost);
  await user.save();

  return {
    ...createdPost._doc,
    _id: createdPost._id.toString(),
    createdAt: createdPost.createdAt.toISOString(),
    updatedAt: createdPost.updatedAt.toISOString(),
  };
};

const getPostsResolver = async (args, req) => {
  if (!req.isAuth) {
    const error = new Error("Not authenticated");
    error.statusCode = 401;

    throw error;
  }

  const currentPage = args.page || 1;
  const perPage = 2;

  const totalPosts = await Post.find().countDocuments();
  const posts = await Post.find()
    .sort({ createdAt: -1 })
    .populate("creator")
    .skip((currentPage - 1) * perPage)
    .limit(perPage);

  const mappedPosts = posts.map((post) => {
    return {
      ...post._doc,
      _id: post._id.toString(),
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
    };
  });

  return { posts: mappedPosts, totalPosts };
};

const getPostResolver = async (args, req) => {
  if (!req.isAuth) {
    const error = new Error("Not authenticated");
    error.statusCode = 401;

    throw error;
  }

  const postId = args.postId;

  const post = await Post.findById(postId).populate("creator");

  if (!post) {
    const error = new Error("No post was found");
    error.statusCode = 404;

    throw error;
  }

  return {
    ...post._doc,
    _id: post._id.toString(),
    createdAt: post.createdAt.toISOString(),
    updatedAt: post.updatedAt.toISOString(),
  };
};

const updatePostResolver = async (args, req) => {
  if (!req.isAuth) {
    const error = new Error("Not authenticated");
    error.statusCode = 401;

    throw error;
  }

  const postId = args.postId;
  const postInput = args.postInput;

  const title = postInput.title;
  const content = postInput.content;
  const imageUrl = postInput.imageUrl;

  const userId = req.userId.toString();

  const post = await Post.findById(postId).populate("creator");

  if (!post) {
    const error = new Error("No post was found");
    error.statusCode = 404;

    throw error;
  }

  if (post.creator._id.toString() !== userId) {
    const error = new Error("Not authorized");
    error.statusCode = 403;

    throw error;
  }

  if (imageUrl !== "undefined") {
    post.imageUrl = imageUrl;
  }

  const errors = [];

  if (validator.isEmpty(title) || !validator.isLength(title, { min: 5 })) {
    errors.push({ message: "Title is invalid" });
  }

  if (validator.isEmpty(content) || !validator.isLength(content, { min: 5 })) {
    errors.push({ message: "Content is invalid" });
  }

  if (errors.length) {
    const error = new Error("Invalid input");

    error.data = errors;
    error.statusCode = 422;

    throw error;
  }

  post.title = title;
  post.content = content;
  post.imageUrl = imageUrl;

  const updatedPost = await post.save();

  return {
    ...updatedPost._doc,
    _id: updatedPost._id.toString(),
    createdAt: updatedPost.createdAt.toISOString(),
    updatedAt: updatedPost.updatedAt.toISOString(),
  };
};

const deletePostResolver = async (args, req) => {
  if (!req.isAuth) {
    const error = new Error("Not authenticated");
    error.statusCode = 401;

    throw error;
  }

  const postId = args.postId;
  const userId = req.userId;

  const post = await Post.findById(postId);

  if (!post) {
    const error = new Error("No post was found");
    error.statusCode = 404;

    throw error;
  }

  if (post.creator.toString() !== userId.toString()) {
    const error = new Error("Not authorized");
    error.statusCode = 403;

    throw error;
  }

  const filePath = path.join(__dirname, "..", post.imageUrl);
  fileUtil.clearImage(filePath);

  await Post.findByIdAndDelete(postId);

  const user = await User.findById(userId);
  user.posts.pull(postId);

  await user.save();

  return true;
};

const getUserStatusResolver = async (args, req) => {
  if (!req.isAuth) {
    const error = new Error("Not authenticated");
    error.statusCode = 401;

    throw error;
  }

  const userId = req.userId;

  const user = await User.findById(userId);

  if (!user) {
    const error = new Error("No user found");
    error.statusCode = 404;

    throw error;
  }

  return user.status;
};

const updateUserStatusResolver = async (args, req) => {
  if (!req.isAuth) {
    const error = new Error("Not authenticated");
    error.statusCode = 401;

    throw error;
  }

  const userId = req.userId;
  const status = args.status;

  const user = await User.findByIdAndUpdate(
    userId,
    { status },
    { new: true, runValidators: true }
  );

  if (!user) {
    const error = new Error("No user found");
    error.statusCode = 404;

    throw error;
  }

  return user.status;
};

module.exports = {
  // should match the name of the schema in schema.js
  // hello: helloResolver,
  login: loginResolver,
  getPosts: getPostsResolver,
  getPost: getPostResolver,
  getUserStatus: getUserStatusResolver,
  createUser: createUserResolver,
  createPost: createPostResolver,
  updatePost: updatePostResolver,
  updateUserStatus: updateUserStatusResolver,
  deletePost: deletePostResolver,
};
