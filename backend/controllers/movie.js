const { db } = require('../firebase.js')
const jwt = require('jsonwebtoken')
const moment = require('moment/moment.js')
const { FieldValue, FieldPath } = require('firebase-admin/firestore')

module.exports = {
    getMovieById: async (req, res) => {
        const { id } = req.params
        const movieRef = db.collection('movies').doc(id)

        try {
            const doc = await movieRef.get()

            if (!doc.exists) {
                return res.status(404).json({
                    message: "Movie with that ID does not exists"
                })
            }

            const movie = doc.data()

            return res.status(200).json({
                movie
            })
        } catch (error) {
            return res.status(500).json({
                message: "Error retrieving movie"
            })
        }
    },
    getAllMovies: async (req, res) => {
        const moviesRef = db.collection('movies')

        try {
            const snapshot = await moviesRef.get()

            if (snapshot.empty) {
                return res.status(404).json({
                    message: "No movies"
                })
            }

            const movies = []
            snapshot.forEach(doc => {
                movies.push(doc.data())
            })

            return res.status(200).json({
                movies
            })
        } catch (error) {
            return res.status(500).json({
                message: "Error retrieving movies"
            })
        }
    },
    addMovie: async (req, res) => {
        const extractedToken = req.headers.authorization.split(" ")[1]
        if (!extractedToken || extractedToken.trim() === "") {
            return res.status(404).json({
                message: "Token not found"
            })
        }

        try {
            const { id: adminId } = await jwt.verify(extractedToken, process.env.EXPRESS_APP_SECRET_KEY);

            const {
                title,
                description,
                release_date,
                poster_url,
                age_rating,
                ticket_price
            } = req.body
            const moviesRef = db.collection('movies')

            if (
                !title ||
                title.trim() === "" ||
                !description ||
                description.trim() === "" ||
                !release_date ||
                release_date.trim() === "" ||
                !moment(release_date, "YYYY-MM-DD", true).isValid() ||
                !poster_url ||
                poster_url.trim() === "" ||
                !age_rating ||
                typeof age_rating !== "number" ||
                !ticket_price ||
                typeof ticket_price !== "number"
            ) {
                return res.status(422).json({
                    message: "Invalid inputs"
                })
            }

            const snapshot = await moviesRef
                .where('title', '==', title)
                .where('release_date', '==', release_date)
                .get()

            if (!snapshot.empty) {
                return res.status(409).json({
                    message: "Movie with the same title and release date already exists"
                })
            }

            const movieRef = moviesRef.doc()
            const movieId = movieRef.id

            const seatsRef = db.collection('seats').doc(movieId)
            const adminRef = db.collection('admins').doc(adminId)

            await adminRef.update({
                added_movie: FieldValue.arrayUnion(movieId)
            })

            await movieRef.set({
                id: movieId,
                title: title,
                description: description,
                release_date: release_date,
                poster_url: poster_url,
                age_rating: age_rating,
                ticket_price: ticket_price,
                admin: adminId,
                bookings: []
            })

            const seatData = {
                movieId: movieId,
                seats: Array(64).fill(false)
            }
            await seatsRef.set(seatData)

            const createdMovieRef = db.collection('movies').doc(movieId)
            const createdMovieDoc = await createdMovieRef.get()
            const createdMovie = createdMovieDoc.data()

            return res.status(201).json({
                message: "Movie added successfully",
                createdMovie
            })
        } catch (error) {
            if (error.name === 'JsonWebTokenError') {
                return res.status(400).json({
                    message: "Invalid token"
                });
            }

            return res.status(500).json({
                message: "Error adding movie"
            })
        }
    },
    deleteMovie: async (req, res) => {
        const extractedToken = req.headers.authorization.split(" ")[1]
        if (!extractedToken || extractedToken.trim() === "") {
            return res.status(404).json({
                message: "Token not found"
            })
        }

        try {
            const { id: adminId } = await jwt.verify(extractedToken, process.env.EXPRESS_APP_SECRET_KEY);
            const { id } = req.params
            const movieRef = db.collection('movies').doc(id)
            const movieDoc = await movieRef.get()

            const bookingSnapshot = await db.collection('bookings').where('movieId', '==', id).get();
            const deleteBookingsPromises = []
            bookingSnapshot.forEach(async (doc) => {
                const booking = doc.data();
                const { id: bookingId, userId } = booking;

                const userRef = db.collection('users').doc(userId);
                await userRef.update({
                    bookings: FieldValue.arrayRemove(bookingId)
                });

                deleteBookingsPromises.push(doc.ref.delete());
            })

            if (!movieDoc.exists) {
                return res.status(404).json({
                    message: "Movie with that ID does not exists"
                })
            }

            await Promise.all(deleteBookingsPromises)
            await movieRef.delete()

            const seatsRef = db.collection('seats');
            const seatsQuery = await seatsRef.where('movieId', '==', id).get();

            const batch = db.batch()

            seatsQuery.forEach((doc) => {
                batch.delete(doc.ref)
            });

            await batch.commit()

            const adminRef = db.collection('admins').doc(adminId)

            await adminRef.update({
                added_movie: FieldValue.arrayRemove(id)
            })

            return res.status(200).json({
                message: "Movie deleted successfully"
            })
        } catch (error) {
            if (error.name === 'JsonWebTokenError') {
                return res.status(400).json({
                    message: "Invalid token"
                });
            }

            return res.status(500).json({
                message: "Error deleting movie"
            })
        }
    },
    updateMovie: async (req, res) => {
        const extractedToken = req.headers.authorization.split(" ")[1]
        if (!extractedToken || extractedToken.trim() === "") {
            return res.status(404).json({
                message: "Token not found"
            })
        }

        try {
            const { id: adminId } = await jwt.verify(extractedToken, process.env.EXPRESS_APP_SECRET_KEY);
            const { id } = req.params
            const { title, description, release_date, poster_url, age_rating, ticket_price } = req.body
            const movieRef = db.collection('movies').doc(id)
            const movieDoc = await movieRef.get()

            if (!movieDoc.exists) {
                return res.status(404).json({
                    message: "Movie with that ID does not exists"
                })
            }

            if (
                !title ||
                title.trim() === "" ||
                !description ||
                description.trim() === "" ||
                !release_date ||
                release_date.trim() === "" ||
                !moment(release_date, "YYYY-MM-DD", true).isValid() ||
                !poster_url ||
                poster_url.trim() === "" ||
                !age_rating ||
                typeof age_rating !== "number" ||
                !ticket_price ||
                typeof ticket_price !== "number"
            ) {
                return res.status(422).json({
                    message: "Invalid inputs"
                })
            }

            const updateFields = {
                ...(title && { title }),
                ...(description && { description }),
                ...(release_date && { release_date }),
                ...(poster_url && { poster_url }),
                ...(age_rating !== undefined && { age_rating }),
                ...(ticket_price !== undefined && { ticket_price })
            }

            await movieRef.update(updateFields)

            return res.status(200).json({
                message: "Movie updated successfully"
            })
        } catch (error) {
            if (error.name === 'JsonWebTokenError') {
                return res.status(400).json({
                    message: "Invalid token"
                });
            }

            return res.status(500).json({
                message: "Error updating movie"
            })
        }
    }
}