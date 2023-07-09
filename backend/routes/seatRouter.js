const express = require("express");
const {
  getAllSeats,
  getSeatsByMovieId
} = require("../controllers/seat");
const router = express.Router();

router.get("/", getAllSeats)
router.get("/:id", getSeatsByMovieId)

module.exports = router;