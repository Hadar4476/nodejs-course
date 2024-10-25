const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const productSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  imageUrl: {
    type: String,
    required: true,
  },
  userId: {
    type: Schema.Types.ObjectId,

    // specify the referenced model because Schema.Types.ObjectId can be of any model
    ref: "User",
    required: true,
  },
});

// creates a collection with the name of "products" based on the passed string
// documents in the collection should have the same structure like the schema
module.exports = mongoose.model("Product", productSchema);
