import { expect } from "chai";
import mongoose from "mongoose";

import User from "../models/user.js";

import feedController from "../controllers/feed.js";

const MONGODB_DATABASE = "test-messages";
const MONGODB_URI = `mongodb+srv://hadar-read-write:aXRMIfT9ItS6RM40@mongointrocluster09.uwvnh.mongodb.net/${MONGODB_DATABASE}?retryWrites=true&w=majority`;

describe("Feed Controller - Create New Post", function () {
  this.timeout(10000); // Increase timeout to 10 seconds

  // before, after, beforeEach & afterEach are hooks that run with tests
  before(function () {
    return mongoose.connect(MONGODB_URI);
  });

  after(function () {
    return mongoose.disconnect();
  });

  afterEach(function () {
    // Ensure database is clean after each test
    return User.deleteMany({});
  });

  it("should add a created post to the posts of the creator", function (done) {
    const user = new User({
      email: "test@test.com",
      password: "SOME_TEST_PASSWORD",
      name: "Test",
      status: "I am new!", // Add a status for testing
      posts: [],
    });

    user
      .save()
      .then((savedUser) => {
        const req = {
          userId: savedUser._id.toString(),
          file: {
            path: "SOME_FILE_PATH",
          },
          body: {
            title: "SOME_TITLE",
            content: "SOME_CONTENT",
          },
        };

        const res = {
          statusCode: 500,
          message: null,
          post: null,
          status: function (code) {
            this.statusCode = code;
            return this; // Enable chaining
          },
          json: function (data) {
            this.message = data.message;
            this.post = data.post;
          },
        };

        return feedController
          .createPost(req, res, () => {})
          .then((savedUser) => {
            expect(savedUser).to.have.property("posts");
            expect(savedUser.posts).to.have.length(1);

            done();
          });
      })
      .catch((err) => {
        throw err; // This will cause the test to fail if any error occurs
      });
  });
});
