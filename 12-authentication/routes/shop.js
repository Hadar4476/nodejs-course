const path = require("path");

const express = require("express");

const shopController = require("../controllers/shop");

const checkAuthentication = require("../middleware/auth");
const verifyCsrfToken = require("../middleware/csrf");

const router = express.Router();

router.get("/", shopController.getIndex);

router.get("/products", shopController.getProducts);

router.get("/products/:productId", shopController.getProduct);

router.get("/cart", checkAuthentication, shopController.getCart);

router.post(
  "/cart",
  verifyCsrfToken,
  checkAuthentication,
  shopController.postCart
);

router.post(
  "/cart-delete-item",
  verifyCsrfToken,
  checkAuthentication,
  shopController.postCartDeleteProduct
);

router.post(
  "/create-order",
  verifyCsrfToken,
  checkAuthentication,
  shopController.postOrder
);

router.get("/orders", checkAuthentication, shopController.getOrders);

module.exports = router;
