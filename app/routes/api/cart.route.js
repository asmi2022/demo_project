const express = require("express");
const router = express.Router();
const route_label = require("route-label");
const namedRouter = route_label(router);
const Auth = require("../../middleware/auth");
const cartController = require("../../modules/webservices/cart.controller.cjs");

namedRouter.all("/cart*", Auth.authenticate);

namedRouter.post("api.cart.handler", '/cart/handler', cartController.cartHandler);

module.exports = router;