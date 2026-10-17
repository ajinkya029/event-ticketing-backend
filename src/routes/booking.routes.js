const router = require("express").Router();
const controller = require("../controllers/booking.controller");
const { protect, authorize } = require("../middleware/auth.middleware");

router.use(protect);
router.post("/event/:eventId", controller.createBooking);
router.get("/my", controller.myBookings);
router.get("/admin/all", authorize("admin"), controller.adminListBookings);
router.post("/check-in", authorize("admin"), controller.checkInTicket);
router.get("/:id", controller.getBooking);
router.post("/:id/cancel", controller.cancelBooking);

module.exports = router;
