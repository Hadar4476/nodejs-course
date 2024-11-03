// WEBSOCKETS
// websockets are used to inform the client about something that happend on the server.
// like a chat feature, user A posted a message which user B should be informed about.
// it does not work like the traditional request-response behavior.
// in this example, we are using Socket.io which uses websockets behind the scenes.
// setting a websocket connection is done both in client and server(see socket.io-client in client -> Feed.js)

const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");

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
    const server = app.listen(8080);

    const io = require("./socket").init(server);

    // setting event listeners
    io.on("connection", (socket) => {
      console.log("Client connected to socket");
    });
  })
  .catch((err) => {
    console.log(err);
  });
