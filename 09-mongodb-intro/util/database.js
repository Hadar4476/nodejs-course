const mongodb = require("mongodb");
const MongoClient = mongodb.MongoClient;

let _db;

const mongoConnect = (callback) => {
  MongoClient.connect(
    "mongodb+srv://hadar-read-write:8699377Aa!@mongointrocluster09.uwvnh.mongodb.net/shop?retryWrites=true&w=majority&appName=MongoIntroCluster09"
  )
    .then((client) => {
      _db = client.db();
      callback();
    })
    .catch((err) => {
      console.log("err");
      throw err;
    });
};

const getDb = () => {
  if (_db) {
    return _db;
  }

  throw "No database found";
};

module.exports = { mongoConnect, getDb };
