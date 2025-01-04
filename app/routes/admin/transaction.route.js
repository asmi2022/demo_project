const express = require("express");
const route = express.Router();
const route_label = require("route-label");
const named_router = route_label(route);
const transactionController = require("../../modules/transaction/controllers/transaction.controller");

named_router.get("payment.response", "/payment/response", transactionController.paymentResponse);

module.exports = route;