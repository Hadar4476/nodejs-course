import { expect } from "chai";
import mongoose from "mongoose";

import User from "../models/user.js";
import userController from "../controllers/user.js";

const MONGODB_DATABASE = "test-messages";
const MONGODB_URI = `mongodb+srv://hadar-read-write:aXRMIfT9ItS6RM40@mongointrocluster09.uwvnh.mongodb.net/${MONGODB_DATABASE}?retryWrites=true&w=majority`;

describe("User Controller - Get User Status", function () {
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

  it("should send a response with a valid user status for an existing user", function (done) {
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
        };

        const res = {
          statusCode: 500,
          userStatus: null,
          status: function (code) {
            this.statusCode = code;
            return this;
          },
          json: function (data) {
            this.userStatus = data.userStatus;
          },
        };

        return userController
          .getUserStatus(req, res, () => {})
          .then(() => {
            expect(res.statusCode).to.be.equal(200);
            expect(res.userStatus).to.be.equal("I am new!");

            done();
          });
      })
      .catch((err) => {
        throw err; // This will cause the test to fail if any error occurs
      });
  });
});
