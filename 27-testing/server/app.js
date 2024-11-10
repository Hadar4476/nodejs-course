// TESTING
// for testing there are 2 useful packages: mocha & chain
// mocha is for writing tests and chai is for asserting/validating the tests

// MOCHA
// to configure mocha, go to package.json -> in test script type "mocha"
// mocha will look for a test folder, create that
// inside that test folder create a js file with any name of your choice
// to run a test, type "npm test"

import path from "path";
import { fileURLToPath } from "url";

// Get the equivalent of __filename
const __filename = fileURLToPath(import.meta.url);

// Get the equivalent of __dirname
const __dirname = path.dirname(__filename);

import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import mongoose from "mongoose";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";

const MONGODB_DATABASE = "messages";
const MONGODB_URI = `mongodb+srv://hadar-read-write:aXRMIfT9ItS6RM40@mongointrocluster09.uwvnh.mongodb.net/${MONGODB_DATABASE}?retryWrites=true&w=majority`;

import feedRoutes from "./routes/feed.js";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/user.js";

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

app.use("/feed", feedRoutes);
app.use("/auth", authRoutes);
app.use("/user", userRoutes);

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
