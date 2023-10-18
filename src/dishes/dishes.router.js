const router = require("express").Router();
const methodNotAllowed = require("../errors/methodNotAllowed");
const controller = require("./dishes.controller");

// add two routes: /dishes, and /dishes/:dishId and attach the handlers 
// (create, read, update, and list) exported from src/dishes/dishes.controller.js.
router.route("/:dishId").get(controller.read).put(controller.update).all(methodNotAllowed);
router.route("/").get(controller.list).post(controller.create).all(methodNotAllowed);

module.exports = router;
