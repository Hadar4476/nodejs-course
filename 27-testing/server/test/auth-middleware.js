import { expect } from "chai";
import jwt from "jsonwebtoken";

// a package for testing the functionality of other packages
import sinon from "sinon";

import checkAuthentication from "../middleware/auth.js";

// describe groups tests into one category
describe("Auth Middleware", function () {
  it("should throw an error if Authorization header is not present", function () {
    const req = {
      headers: {
        Authorization: null,
      },
      get: function (header) {
        return this.headers[header];
      },
    };

    // The reason for using bind here is that expect(result).to.throw("Not authenticated");
    // expects result to be a function that, when invoked, throws an error.
    // bind accomplishes this by creating a function that encapsulates the call to checkAuthentication with the provided arguments.

    // Why bind is Necessary?
    // Error-throwing Expectation: expect(...).to.throw(...) works only when the argument is a function that,
    // when called, throws an error. If you directly invoke checkAuthentication(req, {}, () => {}); within expect(...),
    // the error will be thrown immediately, outside the context of expect, which results in the test failing since it doesn't capture the error.
    // Using bind: With bind, result becomes a function reference that wraps checkAuthentication with the arguments you provided.
    //  expect(result).to.throw(...) can then call result and correctly capture any error thrown for assertion.

    const result = checkAuthentication.bind(this, req, {}, () => {});

    // expecting checkAuthentication to throw an error because Authorization header is not present
    expect(result).to.throw("Not authenticated");
  });

  it("should yield a userId after decoding the token", function () {
    // Arrange: Set up request, response, and next objects
    const req = {
      headers: {
        Authorization: "Bearer SOME_TOKEN",
      },
      get: function (header) {
        return this.headers[header];
      },
    };
    const res = {};
    const next = sinon.spy(); // to check if next() is called

    // Stub jwt.verify to return a mock decoded token
    // A stub is a controllable replacement for an Existing Dependency (or collaborator) in the system.
    // By using a stub, you can test your code without dealing with the dependency directly.
    sinon.stub(jwt, "verify").returns({ userId: "12345" });

    // Act: Call the middleware
    checkAuthentication(req, res, next);

    // Assert: Check if req.userId is set correctly and next() is called
    expect(req).to.have.property("userId", "12345");
    expect(next.calledOnce).to.be.true;

    // Cleanup: Restore jwt.verify to its original implementation
    jwt.verify.restore();
  });
});
