const express = require("express");
const router = express.Router();
const route_label = require("route-label");
const namedRouter = route_label(router);
const Auth = require("../../middleware/auth");
const categoryController = require("../../modules/category/controller/category.controller");

namedRouter.all("/faq*", Auth.authenticate);

namedRouter.post("category.add", '/category/add', categoryController.add);
namedRouter.post("category.update", '/category/update', categoryController.update);
namedRouter.get("category.delete", '/category/delete/:id', categoryController.delete);

module.exports = router;