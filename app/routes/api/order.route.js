const express = require("express");
const router = express.Router();
const route_label = require("route-label");
const namedRouter = route_label(router);
const Auth = require("../../middleware/auth");
const orderController = require("../../modules/webservices/order.controller.js");

namedRouter.post("webhook", "/hook", orderController.webHook);
namedRouter.all("/order*", Auth.authenticate);

namedRouter.post("api.order.placeorder", '/order/placeorder', orderController.placeOrder);
namedRouter.post("api.order.editOder", '/order/editOder', orderController.editOder);
namedRouter.post("api.order.cancelAllOrder", '/order/cancelAllOrder', orderController.cancelAllOrder);


module.exports = router;