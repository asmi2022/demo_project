const express = require("express");
const router = express.Router();
// const route_label = require("route-label");
// const named_router = route_label(router);
const roleController = require("../../modules/role/controllers/role.controller");

router.post("/role/add", roleController.add);
router.post("/role/update", roleController.update);
router.get("/role/delete/:id", roleController.delete);

module.exports = router;