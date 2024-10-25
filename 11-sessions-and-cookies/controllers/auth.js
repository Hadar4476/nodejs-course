const User = require("../models/user");

const getCookies = require("../util/cookie");

exports.getLogin = (req, res, next) => {
  // COOKIE
  // uncomment in postLogin to make it work
  // get the cookie which is set on every request's headers

  // const cookies = getCookies(req.get("Cookie"));
  // console.log(cookies.isLoggedIn);

  // ----------------------------------------------------------------- //

  // SESSION

  console.log(req.session.isLoggedIn);

  res.render("auth/login", {
    pageTitle: "Login",
    path: "/login",
    isLoggedIn: req.session.isLoggedIn,
  });
};

exports.postLogin = (req, res, next) => {
  // COOKIE
  // setting an indicator of isAuthenticated in the request is impossible because
  // request is something that happens once and then its gone, thats why in app.js
  // there is a middleware for fetching and storing the user on EVERY REQUEST(bad practice)

  // setting this indicator with a cookie is basically setting a header
  // go to the browser -> DevTools -> Application -> Cookie to view the cookie's information
  // you can still manipulate the cookie data

  // cookies are very powerful because they are saved on every request in the headers
  // go to browser -> DevTools -> Network -> any request -> cookie is under Cookie in Request Headers

  // you can set more that just a value, you can set more properties of the cookie split with ";"
  // for example: Max-Age=10 is will make the cookie expire in 10 seconds
  // res.setHeader("Set-Cookie", "isLoggedIn=true; Max-Age-10");

  // for example: Secure will set the cookie for HTTPS only
  // res.setHeader("Set-Cookie", "isLoggedIn=true; Secure");

  // res.setHeader("Set-Cookie", "isLoggedIn=true");

  // ----------------------------------------------------------------- //

  // SESSION

  User.findById("671b646f82c15ee43071e272")
    .then((user) => {
      req.session.isLoggedIn = true;
      req.session.user = user;
      req.session.save((err) => {
        res.redirect("/");
      });
    })
    .catch((err) => console.log(err));
};

exports.postLogout = (req, res, next) => {
  // SESSION
  // destroying a session from store
  req.session.destroy((err) => {
    console.log(err);

    res.redirect("/");
  });
};
