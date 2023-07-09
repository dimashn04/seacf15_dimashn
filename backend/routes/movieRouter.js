const express = require("express");
const {
  getAllMovies,
  getMovieById,
  addMovie,
  deleteMovie,
  updateMovie
} = require("../controllers/movie");
const router = express.Router();

router.get("/", getAllMovies);
router.get("/:id", getMovieById);
router.post("/", addMovie)
router.delete("/:id", deleteMovie)
router.put("/:id", updateMovie)

module.exports = router;