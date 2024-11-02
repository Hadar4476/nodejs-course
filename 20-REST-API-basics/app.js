const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const feedRoutes = require("./routes/feed");

const app = express();

// will parse the body as json instead of the traditional parsing of x-www-form-urlencoded
// it will parsed as application/json
app.use(bodyParser.json());

// CORS stands for Cross Origin Resource Sharing which is disabled by defaut
// if the client and the server shares the same domain like in previous lessions when express is used with ejs
// then there is no problem. the issue is when trying to access a domain from a different domain, thats why
// the browser blocks this access for security purposes.
// this middleware will enable CORS
app.use((req, res, next) => {
  // allows access to the server from any domain with using "*"
  req.setHeader("Access-Control-Allow-Origin", "*");
  // allows http methods to the server
  req.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE"
  );
  // allows type of headers which can be passed in the request
  req.header("Access-Control-Allow-Headers", "Content-Type, Authorization");

  next();
});

// // CORS enabling can also be done with using the cors package as middleware
// app.use(cors());

app.use("/feed", feedRoutes);

app.listen(8080);
