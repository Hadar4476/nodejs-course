// RATE LIMIT
// a control mechanism which limit the number of requests can be sent to the server within a specified time frame.
// it is used to prevent abuse, ensure fair use of resources and protect the server from DDoS attacks.

// DDoS - Distributed Denial of Service
// a massive number of requests which are sent from multiple sources that floods the server.
// DDoS overwhelms the server and making it unavailable to legitimate users.
// by adding a defense tool like rate limit, you can restrict the number of requests a single user or IP address can make.

const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");

// this package can be used as a rate limiter
// this is good for small-medium application but there are alternatives of Cloudflare, AWS API Gateway, or NGINX.
const rateLimit = require("express-rate-limit");

const MONGODB_DATABASE = "messages";
const MONGODB_URI = `mongodb+srv://hadar-read-write:aXRMIfT9ItS6RM40@mongointrocluster09.uwvnh.mongodb.net/${MONGODB_DATABASE}?retryWrites=true&w=majority`;

const feedRoutes = require("./routes/feed");
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");

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

// Define rate limit rule
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  message: "Too many requests from this IP, please try again after 15 minutes.",
  headers: true, // Include rate limit info in response headers
});

app.use(bodyParser.json());

app.use(multer({ storage: fileStorage, fileFilter }).single("image"));

app.use("/images", express.static(path.join(__dirname, "images")));

app.use(cors());

// Apply rate limit to all requests
app.use(limiter);

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
