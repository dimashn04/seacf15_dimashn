const express = require("express");
const {
  newBooking, 
  deleteBooking,
  getBookingById
} = require("../controllers/booking");
const router = express.Router();

router.post("/", newBooking)
router.delete("/:id", deleteBooking)
router.get("/:id", getBookingById)

module.exports = router;