const path = require("path");
const fs = require("fs");
const https = require("https");

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const flash = require("connect-flash");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");

const dotenv = require("dotenv");

dotenv.config();

// this is a package which adds secured headers for production
const helmet = require("helmet");

// this is a package for compressing files
const compression = require("compression");

// this is a package for request logging
const morgan = require("morgan");

// SSL protection
// SSL is important for security which uses a mechanism of private and public keys
// this command creates those keys
// openssl req -nodes -new -x509 -keyout server.key -out server.cert

const session = require("express-session");
const MongoDbStore = require("connect-mongodb-session");
const MongoDbStoreSession = MongoDbStore(session);

const errorController = require("./controllers/error");
const User = require("./models/user");

const csrfToken = require("./util/csrfToken");

const app = express();

const store = new MongoDbStoreSession({
  uri: process.env.MONGODB_URI,
  collection: "sessions",
});

const privateKey = fs.readFileSync("server.key");
const certificate = fs.readFileSync("server.cert");

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

app.set("view engine", "ejs");
app.set("views", "views");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth");

// go to localhost:3000 -> dev tools -> network to see the headers which helmet attaches to each request
app.use(helmet());

// go to localhost:3000 -> dev tools -> network to see the size of the css and image file before and after adding this line
app.use(compression());

// the file which the logs will be
// flags: "a" is saying that the data will be appended to the file and not overwrite it
const accessLogSTream = fs.createWriteStream(
  path.join(__dirname, "access.log"),
  { flags: "a" }
);

// "combined" defines which data is being logged and formatted
app.use(morgan("combined", { stream: accessLogSTream }));

app.use(bodyParser.urlencoded({ extended: false }));

app.use(multer({ storage: fileStorage, fileFilter }).single("image"));

app.use(express.static(path.join(__dirname, "public")));

// to parse body as json from async requests
app.use(express.json());

app.use("/images", express.static(path.join(__dirname, "images")));

app.use(
  session({
    secret: "9f86d081884c7d659a2feaa0",
    resave: false,
    saveUninitialized: false,
    store: store,
  })
);

app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }

  User.findById(req.session.user._id)
    .then((user) => {
      if (!user) {
        return next();
      }

      req.user = user;

      next();
    })
    .catch((err) => {
      next(new Error(err));
    });
});

app.use(csrfToken.generateCsrfToken);

app.use(flash());

app.use((req, res, next) => {
  res.locals.isLoggedIn = req.session.isLoggedIn;

  next();
});

app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.get("/500", errorController.get500);

app.use(errorController.get404);

app.use((error, req, res, next) => {
  console.log(error);

  res.status(500).render("500", {
    pageTitle: "Error!",
    path: "/500",
    isAuthenticated: req.session.isLoggedIn,
  });
});

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    https
      .createServer(
        {
          key: privateKey,
          cert: certificate,
        },
        app
      )
      .listen(process.env.PORT || 3000);
  })
  .catch((err) => {
    console.log(err);
  });
