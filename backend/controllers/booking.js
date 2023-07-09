const { db } = require('../firebase.js')
const moment = require('moment/moment.js')
const { FieldValue, FieldPath } = require('firebase-admin/firestore')

module.exports = {
    newBooking: async (req, res) => {
        const { movieId, date, seat_number, userId } = req.body;
        const bookingsRef = db.collection('bookings');
        const seatsRef = db.collection('seats');
        const moviesRef = db.collection('movies');
        const usersRef = db.collection('users');

        if (!movieId || movieId.trim() === "" || date.trim() === "" || !moment(date, "YYYY-MM-DD", true).isValid() || !userId || userId.trim() === "" || !seat_number || typeof seat_number !== "number") {
            return res.status(422).json({ message: "Invalid inputs" });
        }

        try {
            const batch = db.batch();

            const bookingRef = bookingsRef.doc();
            const bookingId = bookingRef.id;

            const movieRef = moviesRef.doc(movieId);
            const movieDoc = await movieRef.get();
            if (!movieDoc.exists) {
                return res.status(404).json({ message: "Movie with that ID does not exist" });
            }

            const userRef = usersRef.doc(userId);
            const userDoc = await userRef.get();
            if (!userDoc.exists) {
                return res.status(404).json({ message: "User with that ID does not exist" });
            }

            const seatQuery = await seatsRef.where('movieId', '==', movieId).get();
            const seatsDoc = seatQuery.docs[0];
            const seatsData = seatsDoc.data();

            if (seatsData.seats[seat_number - 1] === true) {
                return res.status(409).json({ message: "Seat is already booked" });
            }

            const ticketPrice = movieDoc.data().ticket_price;
            const userBalance = userDoc.data().balance;
            const updatedUserBalance = userBalance - ticketPrice;

            if (updatedUserBalance < 0) {
                return res.status(409).json({ message: "User's balance is insufficient to make the booking" });
            }

            seatsData.seats[seat_number - 1] = true;

            const bookingData = {
                id: bookingId,
                movieId: movieId,
                movieTitle: movieDoc.data().title,
                ticketPrice: ticketPrice,
                date: date,
                seat_number: seat_number,
                userId: userId,
                username: userDoc.data().username
            };

            batch.set(bookingRef, bookingData);
            batch.update(movieRef, { bookings: FieldValue.arrayUnion(bookingId) });
            batch.update(userRef, { balance: updatedUserBalance, bookings: FieldValue.arrayUnion(bookingId) });
            batch.update(seatsDoc.ref, { seats: seatsData.seats });

            await batch.commit();

            const createdBookingDoc = await bookingsRef.doc(bookingId).get();
            const createdBooking = createdBookingDoc.data();

            return res.status(201).json({ message: "New booking added successfully", createdBooking });
        } catch (error) {
            return res.status(500).json({ message: "Error adding new booking" });
        }
    },
    deleteBooking: async (req, res) => {
        const { id } = req.params
        const bookingRef = db.collection('bookings').doc(id)

        try {
            const bookingDoc = await bookingRef.get()

            if (!bookingDoc.exists) {
                return res.status(404).json({
                    message: "Booking with that ID does not exists"
                })
            }

            const bookingData = bookingDoc.data();
            const { movieId, seat_number, userId } = bookingData;

            const movieRef = db.collection('movies').doc(movieId);
            await movieRef.update({
                bookings: FieldValue.arrayRemove(id),
            });

            const userRef = db.collection('users').doc(userId);
            await userRef.update({
                bookings: FieldValue.arrayRemove(id),
            });

            const seatRef = db.collection('seats');
            const seatsQuery = await seatRef.where('movieId', '==', movieId).get();

            if (!seatsQuery.empty) {
                const seatsDoc = seatsQuery.docs[0];
                const seatsData = seatsDoc.data();
                seatsData.seats[seat_number - 1] = false;

                await seatsDoc.ref.update({
                    seats: seatsData.seats,
                });
            }

            await bookingRef.delete()

            return res.status(200).json({
                message: "Booking deleted successfully"
            })
        } catch (error) {
            return res.status(500).json({
                message: "Error deleting booking"
            })
        }
    },
    getBookingById: async (req, res) => {
        const { id } = req.params
        const bookingRef = db.collection('bookings').doc(id)

        try {
            const doc = await bookingRef.get()

            if (!doc.exists) {
                return res.status(404).json({
                    message: "Booking with that ID does not exists"
                })
            }

            const booking = doc.data()

            return res.status(200).json({
                booking
            })
        } catch (error) {
            return res.status(500).json({
                message: "Error retrieving movie"
            })
        }
    }
}