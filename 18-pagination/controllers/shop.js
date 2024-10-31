const fs = require("fs");
const path = require("path");

const PDFDocument = require("pdfkit");

const Product = require("../models/product");
const Order = require("../models/order");

const ITEMS_PER_PAGE = 2;

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
          res.render("shop/product-list", {
            prods: products,
            pageTitle: "All Products",
            path: "/products",
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

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then((product) => {
      res.render("shop/product-detail", {
        product: product,
        pageTitle: product.title,
        path: "/products",
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getIndex = (req, res, next) => {
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
          res.render("shop/index", {
            prods: products,
            pageTitle: "All Products",
            path: "/shop",
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

exports.getCart = (req, res, next) => {
  req.user
    .populate("cart.items.productId")
    .then((user) => {
      const products = user.cart.items;

      res.render("shop/cart", {
        path: "/cart",
        pageTitle: "Your Cart",
        products: products,
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;

  Product.findById(prodId)
    .then((product) => {
      return req.user.addToCart(product);
    })
    .then((user) => {
      req.session.user = user;
      return req.session.save();
    })
    .then((result) => {
      console.log(result);
      res.redirect("/cart");
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postCartDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  req.user
    .removeFromCart(prodId)
    .then((result) => {
      res.redirect("/cart");
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.postOrder = (req, res, next) => {
  req.user
    .populate("cart.items.productId")
    .then((user) => {
      console.log(user.cart.items);

      const products = user.cart.items.map((item) => {
        return {
          product: { ...item.productId },
          quantity: item.quantity,
        };
      });

      const order = new Order({
        userId: req.session.user._id,
        products,
      });

      return order.save();
    })
    .then(() => {
      return req.user.clearCart();
    })
    .then((result) => {
      res.redirect("/orders");
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getOrders = (req, res, next) => {
  Order.find({ userId: req.session.user._id })
    .then((orders) => {
      res.render("shop/orders", {
        path: "/orders",
        pageTitle: "Your Orders",
        orders: orders,
      });
    })
    .catch((err) => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      return next(error);
    });
};

exports.getInvoice = (req, res, next) => {
  const orderId = req.params.orderId;

  Order.findById(orderId)
    .then((order) => {
      if (!order) {
        return next(new Error("No order found."));
      }

      const isUserOrder = order.userId.toString() === req.user._id.toString();

      if (!isUserOrder) {
        return next(new Error("Unauthorized"));
      }

      const invoiceName = "invoice-" + orderId + ".pdf";
      const invoicePath = path.join("data", "invoices", invoiceName);

      const pdfDoc = new PDFDocument();

      res.setHeader("Content-Type", "application/pdf");

      res.setHeader(
        "Content-Disposition",
        'attachment; filename="' + invoiceName + '"'
      );

      pdfDoc.pipe(fs.createWriteStream(invoicePath));
      pdfDoc.pipe(res);

      pdfDoc.fontSize(26).text("Invoice", {
        underline: true,
      });

      pdfDoc.text("----------------------------------");

      let totalPrice = 0;
      order.products.forEach((productData) => {
        const { product, quantity } = productData;

        totalPrice += quantity * product.price;

        pdfDoc
          .fontSize(14)
          .text(product.title + "-" + quantity + "x" + "$" + product.price);
      });

      pdfDoc.text("----------------------------------");
      pdfDoc.fontSize(20).text("Total Price: $" + totalPrice);

      pdfDoc.end();

      // // this is fine for small files which won't take very long
      // // it may cause overloading because the server process this in memory and memory is limited
      // fs.readFile(invoicePath, (err, data) => {
      //   if (err) {
      //     return next(err);
      //   }

      //   // will open the pdf in another tab
      //   res.setHeader("Content-Type", "application/pdf");

      //   // will download the file with its extension
      //   res.setHeader(
      //     "Content-Disposition",
      //     'attachment; filename="' + invoiceName + '"'
      //   );

      //   res.send(data);
      // });

      // // instead of reading it like above, it should be streamed
      // // this will ensure that Node will read the file step by step - in chunks
      // const file = fs.createReadStream(invoicePath);

      // res.setHeader("Content-Type", "application/pdf");

      // res.setHeader(
      //   "Content-Disposition",
      //   'attachment; filename="' + invoiceName + '"'
      // );

      // // because the response is a writable stream, we can pipe the file to it
      // file.pipe(res);
    })
    .catch((err) => {
      return next(err);
    });
};
