const path = require("path");

const express = require("express");

const adminController = require("../controllers/admin");

const checkAuthentication = require("../middleware/auth");
const verifyCsrfToken = require("../middleware/csrf");

const router = express.Router();

// /admin/add-product => GET
router.get("/add-product", checkAuthentication, adminController.getAddProduct);

// /admin/products => GET
router.get("/products", checkAuthentication, adminController.getProducts);

// // /admin/add-product => POST
router.post(
  "/add-product",
  verifyCsrfToken,
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
  verifyCsrfToken,
  checkAuthentication,
  adminController.postEditProduct
);

router.post(
  "/delete-product",
  verifyCsrfToken,
  checkAuthentication,
  adminController.postDeleteProduct
);

module.exports = router;