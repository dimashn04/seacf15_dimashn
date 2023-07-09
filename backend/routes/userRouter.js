const express = require("express");
const {
  getAllUsers,
  signupUser,
  updateUser,
  deleteUser,
  loginUser,
  getBookingsOfUser,
  // signupAdmin
  getUserBalance,
  topUpUserBalance,
  getUserDataById
} = require("../controllers/user");
const router = express.Router();

router.get("/", getAllUsers);
router.get("/:id", getUserDataById)
router.post("/signup", signupUser)
// router.post("/signupadmin", signupAdmin)
router.put("/:id", updateUser)
router.delete("/:id", deleteUser)
router.post("/login", loginUser)
router.get("/bookings/:id", getBookingsOfUser)
router.get("/balance/:id", getUserBalance)
router.post("/topup/:id", topUpUserBalance)

module.exports = router;