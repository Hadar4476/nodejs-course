// GRAPHQL
// GraphQL is an API with high query flexibility and it solves some limits of REST API
// for example, one limit could be that we don't want the REST API server to fetch the whole document
// we just want some data on this document, what we needed to do is create a seperate endpooint.
// in GraphQL you can define which content the server should send as a response.

// GraphQL only expose one endpoint of POST request with a route of "/graphql"(typically).
// in the body of that POST request you send a query which define the data you want as response.

// the GraphQL communication process goes like this:
// - a client send a POST request with a query which define the data that should be retrieved.
// - the query should contain a mutation or a query(mutation is for creating, updating & deleting and query is just for getting data)
// - these queries or mutations are connected to a resolver with the same name which plays the role of a controller

const path = require("path");
const fs = require("fs");

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");

const { graphqlHTTP } = require("express-graphql");

const graphqlSchema = require("./graphql/schema");
const graphqlResolver = require("./graphql/resolvers");

const checkAuthentication = require("./middleware/auth");

const fileUtil = require("./utils/file");

const MONGODB_DATABASE = "messages";
const MONGODB_URI = `mongodb+srv://hadar-read-write:aXRMIfT9ItS6RM40@mongointrocluster09.uwvnh.mongodb.net/${MONGODB_DATABASE}?retryWrites=true&w=majority`;

const app = express();

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    cb(null, uuidv4() + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  const isImageType =
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg";

  cb(null, isImageType);
};

app.use(bodyParser.json());

app.use(multer({ storage: fileStorage, fileFilter }).single("image"));

app.use("/images", express.static(path.join(__dirname, "images")));

app.use(cors());

// checking authentication on every request and handling it in specific resolvers
app.use(checkAuthentication);

// a route for posting images
app.put("/post-image", (req, res, next) => {
  if (!req.isAuth) {
    const error = new Error("Not authenticated");
    error.statusCode = 401;

    throw error;
  }

  if (!req.file) {
    return res.status(200).json({ message: "No file provided!" });
  }

  if (req.body.oldPath) {
    const oldPath = path.join(__dirname, ".", req.body.oldPath);
    fileUtil.clearImage(oldPath);
  }

  const filePath = req.file.path.replace("\\", "/");

  return res.status(201).json({ message: "File stored", filePath });
});

// this is the single route for GraphQL
app.use(
  "/graphql",
  graphqlHTTP({
    schema: graphqlSchema,
    rootValue: graphqlResolver,
    // in browser, go to localhost:8080/graphql and you should get screen to play with your graphql API
    graphiql: true,
    // allows to customize error handling because when throwing an error
    // GraphQL always send 500
    customFormatErrorFn(err) {
      if (!err.originalError) {
        return err;
      }

      const data = err.originalError.data;
      const message = err.message || "An error occurred";
      const statusCode = err.originalError.statusCode || 500;

      return { message, statusCode, data };
    },
  })
);

app.use((error, req, res, next) => {
  console.log(error);

  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;

  res.status(status).json({ message, data });
});

mongoose
  .connect(MONGODB_URI)
  .then((result) => {
    app.listen(8080);
  })
  .catch((err) => {
    console.log(err);
  });
