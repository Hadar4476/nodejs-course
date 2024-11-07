const path = require("path");

const { validationResult } = require("express-validator");

const fileHelper = require("../util/file");

const Product = require("../models/product");

const ITEMS_PER_PAGE = 2;

exports.getAddProduct = (req, res, next) => {
  res.render("admin/edit-product", {
    pageTitle: "Add Product",
    path: "/admin/add-product",
    editing: false,
    errorMessage: null,
  });
};

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;

  // const imageUrl = req.body.imageUrl;
  const image = req.file;
  console.log(image);

  const price = req.body.price;
  const description = req.body.description;
  const userId = req.session.user._id;

  if (!image) {
    return res.status(422).render("admin/edit-product", {
      pageTitle: "Add Product",
      path: "/admin/add-product",
      editing: false,
      errorMessage: "Attached file is not an image",
    });
  }

  const imageUrl = "/" + image.path.replace("\\", "/");

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorsArray = errors.array();

    return res.status(422).render("admin/edit-product", {
      pageTitle: "Add Product",
      path: "/admin/add-product",
      editing: false,
      errorMessage: errorsArray[0].msg,
    });
  }

  const product = new Product({
    title,
    price,
    description,
    imageUrl,
    userId,
  });
  product
    .save()
    .then((result) => {
      // console.log(result);
      console.log("Created Product");
      res.redirect("/admin/products");
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect("/");
  }
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then((product) => {
      if (!product) {
        return res.redirect("/");
      }
      res.render("admin/edit-product", {
        pageTitle: "Edit Product",
        path: "/admin/edit-product",
        editing: editMode,
        product: product,
        errorMessage: null,
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postEditProduct = (req, res, next) => {
  const prodId = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedPrice = req.body.price;

  const image = req.file;

  const updatedDesc = req.body.description;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorsArray = errors.array();

    return res.status(422).render("admin/edit-product", {
      pageTitle: "Add Product",
      path: "/admin/add-product",
      editing: false,
      errorMessage: errorsArray[0].msg,
    });
  }

  Product.findOne({ _id: prodId, userId: req.user._id })
    .then((product) => {
      product.title = updatedTitle;
      product.price = updatedPrice;
      product.description = updatedDesc;

      if (image) {
        // deleting a file with a helper
        fileHelper.deleteFile(product.imageUrl);

        // adding '/' to make it absolute
        product.imageUrl = "/" + image.path.replace("\\", "/");
      }

      return product.save();
    })
    .then((result) => {
      console.log("UPDATED PRODUCT!");
      res.redirect("/admin/products");
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getProducts = (req, res, next) => {
  const page = +req.query.page || 1;

  Product.find()
    // PAGINATION
    .skip((page - 1) * ITEMS_PER_PAGE)
    // limits the amount of fetched items from mongo
    .limit(ITEMS_PER_PAGE)
    .then((products) => {
      // counting the amount of documents
      Product.countDocuments()
        .then((totalProductsCount) => {
          const pagesCount = Math.ceil(totalProductsCount / ITEMS_PER_PAGE);
          return {
            totalPages: pagesCount,
            currPage: page,
            hasPrev: page > 1,
            hasNext: page < pagesCount,
          };
        })
        .then((pagingData) => {
          res.render("admin/products", {
            prods: products,
            pageTitle: "Admin Products",
            path: "/admin/products",
            pagination: pagingData,
          });
        });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.deleteProduct = (req, res, next) => {
  const prodId = req.params.productId;

  Product.findById(prodId)
    .then((product) => {
      if (!product) {
        return next(new Error("Product not found"));
      }

      const imagePath = path.join(process.cwd(), product.imageUrl);

      fileHelper.deleteFile(imagePath);

      return Product.deleteOne({ _id: prodId, userId: req.user._id });
    })
    .then(() => {
      console.log("DESTROYED PRODUCT");
      // res.redirect("/admin/products");

      res.status(200).json({ message: "Success" });
    })
    .catch((err) => {
      // const error = new Error(err);
      // error.httpStatusCode = 500;
      // return next(error);

      res.status(500).json({ message: "Failed" });
    });
};
