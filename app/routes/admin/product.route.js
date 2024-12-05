const express = require("express");
const router = express.Router();
const Auth = require("../../middleware/auth");
const productController = require("../../modules/product/controller/product.controller");

namedRouter.all("/faq*", Auth.authenticate);

namedRouter.post("product.add", '/product/add', productController.add);
namedRouter.post("product.update", '/product/update', productController.update);
namedRouter.get("product.delete", '/product/delete/:id', productController.delete);