import { expect } from "chai";
import sinon from "sinon";

import User from "../models/user.js";
import authController from "../controllers/auth.js";

describe("Auth Controller - Login", function () {
  // by default mocha executes code in sync way
  // calling the done function for async await behavior
  it("should throw an error with status code 500 if accessing the database fails", function (done) {
    sinon.stub(User, "findOne");
    User.findOne.throws();

    const req = {
      body: {
        email: "test@test.com",
        password: "SOME_PASSWORD",
      },
    };

    authController
      .login(req, {}, () => {})
      .then((result) => {
        // expects to be a type of Error
        expect(result).to.be.an("error");
        expect(result).to.have.property("statusCode", 500);

        // tells mocha to wait before it treats the test as done
        done();
      });

    User.findOne.restore();
  });
});
