const path = require("path");

// NPM
// npm install --save express
// why do we add --save for installation?

// because the package will get installed in the node_modules folder
// but won't be included in the package.json file
// in npm version 5.0, the default installation is --save so no need to add that
const express = require("express");
const bodyParser = require("body-parser");

// ROUTES
const productRoutes = require("./routes/product");
const shopRoutes = require("./routes/shop");

const app = express();

// urlencoded uses a middleware and triggers the parsing automatically
// "extended" allows to parse non default features
app.use(bodyParser.urlencoded({ extended: true }));

// serving static files
app.use(express.static(path.join(__dirname, "public")));

// app.use('/add-product', (req, res, next) => {
//   res.send(`
//     <form action="/product" method="POST">
//         <input name="title"/>
//         <button type="submit">Add Product</button>
//     </form>
//     `);
// });

// using app.use here is a bad practice because this route should only be accessible with POST method
// app.use('/product', (req, res, next) => {
//   // without installing and using body-parser - this will result in "undefined"
//   console.log(req.body);

//   res.redirect('/');
// });

// using app.post here is better to config that this route available method is only POST
// app.post('/product', (req, res, next) => {
//   // without installing and using body-parser - this will result in "undefined"
//   console.log(req.body);

//   res.redirect('/');
// });

// for this point there is not exact which can be set, so the general route should always stay
// at the bottom because if not, it will treat the "/" for every route that start with it.
// app.use('/', (req, res, next) => {
//   res.send('<h1>Homepage</h1>');
// });

// you can also apply filtering to routes, now all the routes of product should have "/admin" in-front of them
// app.use('/admin' + productRoutes);

// using routes as middlewares
// the order here does not matter, it matters when using app.use instead of app.get
app.use(productRoutes);
app.use(shopRoutes);

// using the general app.use without setting a path can be treated as a 404 page
app.use((req, res, next) => {
  // res.status(404).send('<h1>Page not found</h1>');

  res.status(404).sendFile(path.join(__dirname, "views", "404-page.html"));
});

app.listen(3000);
