const path = require("path");

const express = require("express");

const shopController = require("../controllers/shop");

const checkAuthentication = require("../middleware/auth");

const router = express.Router();

router.get("/", shopController.getIndex);

router.get("/products", shopController.getProducts);

router.get("/products/:productId", shopController.getProduct);

router.get("/cart", checkAuthentication, shopController.getCart);

router.post("/cart", checkAuthentication, shopController.postCart);

router.post(
  "/cart-delete-item",
  checkAuthentication,
  shopController.postCartDeleteProduct
);

router.post("/create-order", checkAuthentication, shopController.postOrder);

router.get("/orders", checkAuthentication, shopController.getOrders);

module.exports = router;
