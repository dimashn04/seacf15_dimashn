const express = require('express');
const router = express.Router()

const moviesRouter = require("./movieRouter")
const usersRouter = require("./userRouter")
const bookingsRouter = require("./bookingRouter")
const seatsRouter = require("./seatRouter")

router.get("/", (req, res) => {
  res.json({message: "selamat datang di server"})
})

router.use("/movie", moviesRouter)
router.use("/user", usersRouter)
router.use("/booking", bookingsRouter)
router.use("/seat", seatsRouter)

module.exports = router