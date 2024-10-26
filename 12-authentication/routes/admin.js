const path = require("path");

const express = require("express");

const adminController = require("../controllers/admin");

const checkAuthentication = require("../middleware/auth");

const router = express.Router();

// /admin/add-product => GET
router.get("/add-product", checkAuthentication, adminController.getAddProduct);

// /admin/products => GET
router.get("/products", checkAuthentication, adminController.getProducts);

// // /admin/add-product => POST
router.post(
  "/add-product",
  checkAuthentication,
  adminController.postAddProduct
);

router.get(
  "/edit-product/:productId",
  checkAuthentication,
  adminController.getEditProduct
);

router.post(
  "/edit-product",
  checkAuthentication,
  adminController.postEditProduct
);

router.post(
  "/delete-product",
  checkAuthentication,
  adminController.postDeleteProduct
);

module.exports = router;
