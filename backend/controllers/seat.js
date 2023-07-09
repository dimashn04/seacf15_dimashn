const { db } = require('../firebase.js')

module.exports = {
    getAllSeats: async (req, res) => {
        const seatsRef = db.collection('seats')

        try {
            const snapshot = await seatsRef.get()

            if (snapshot.empty) {
                return res.send(404).status({
                    message: "No seats"
                })
            }

            const seats = []
            snapshot.forEach(doc => {
                seats.push(doc.data())
            })

            return res.status(200).json({
                seats: seats
            })
        } catch (error) {
            return res.status(500).json({
                message: "Error retrieving seats"
            })
        }
    },
    getSeatsByMovieId: async (req, res) => {
        const { id } = req.params
        const seatRef = db.collection('seats').doc(id)

        try {
            const doc = await seatRef.get()

            if (!doc.exists) {
                return res.status(404).json({
                    message: "Seats with that ID does not exists"
                })
            }

            const seat = doc.data()

            return res.status(200).json({
                seat
            })
        } catch (error) {
            return res.status(500).json({
                message: "Error retrieving seats"
            })
        }
    }
}