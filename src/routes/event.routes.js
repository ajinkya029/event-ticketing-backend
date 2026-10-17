const router = require("express").Router();
const controller = require("../controllers/event.controller");
const { protect, authorize } = require("../middleware/auth.middleware");

router.get("/", controller.listEvents);
router.get("/admin/all", protect, authorize("admin"), controller.adminListEvents);
router.post("/", protect, authorize("admin"), controller.createEvent);
router.get("/:id", controller.getEvent);
router.patch("/:id", protect, authorize("admin"), controller.updateEvent);
router.delete("/:id", protect, authorize("admin"), controller.deleteEvent);

module.exports = router;
