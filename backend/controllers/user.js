const { db } = require('../firebase.js')
const bcrypt = require("bcryptjs")
const { FieldValue, FieldPath } = require('firebase-admin/firestore')
const jwt = require('jsonwebtoken')

module.exports = {
    getAllUsers: async (req, res) => {
        const usersRef = db.collection('users')

        try {
            const snapshot = await usersRef.get()

            if (snapshot.empty) {
                return res.send(404).status({
                    message: "No users"
                })
            }

            const users = []
            snapshot.forEach(doc => {
                users.push(doc.data())
            })

            return res.status(200).json({
                users: users
            })
        } catch (error) {
            return res.status(500).json({
                message: "Error retrieving users"
            })
        }
    },
    signupUser: async (req, res) => {
        const {
            age,
            name,
            password,
            username
        } = req.body
        const usersRef = db.collection('users')
        const adminsRef = db.collection('admins')

        if (
            !name ||
            name.trim() === "" ||
            !password ||
            password.length < 6 ||
            !username ||
            username.trim() === "" ||
            !age ||
            typeof age !== "number" ||
            age < 0
        ) {
            return res.status(422).json({
                message: "Invalid inputs"
            })
        }

        try {
            const snapshot = await usersRef
                .where('username', '==', username)
                .get()
            const adminSnapshot = await adminsRef.where('username', '==', username).get()

            if (!snapshot.empty || !adminSnapshot.empty) {
                return res.status(409).json({ message: 'User with the same username already exists' })
            }

            const userRef = usersRef.doc()
            const userId = userRef.id
            const hashedPassword = bcrypt.hashSync(password)

            await userRef.set({
                id: userId,
                age: age,
                username: username,
                name: name,
                password: hashedPassword,
                balance: 500000,
                bookings: []
            })

            const createdUserRef = db.collection('users').doc(userId)
            const createdUserDoc = await createdUserRef.get()
            const createdUser = createdUserDoc.data()

            return res.status(201).json({
                message: "New user registered successfully",
                id: userId
            })
        } catch (error) {
            return res.status(500).json({
                message: "Error registering new user"
            })
        }
    },
    updateUser: async (req, res) => {
        const { id } = req.params
        let { age, name, password, username } = req.body
        const userRef = db.collection('users').doc(id)
        const adminRef = db.collection('admins').doc(id)

        try {
            let userType
            let userDoc

            if ((await userRef.get()).exists) {
                userType = 'user'
                userDoc = userRef
            } else if ((await adminRef.get()).exists) {
                userType = 'admin'
                userDoc = adminRef
            } else {
                return res.status(404).json({
                    message: "User with that ID does not exists"
                })
            }

            if (
                !name ||
                name.trim() === "" ||
                !password ||
                password.length < 6 ||
                !username ||
                username.trim() === "" ||
                !age ||
                typeof age !== "number" ||
                age < 0
            ) {
                return res.status(422).json({
                    message: "Invalid inputs"
                })
            }

            password = bcrypt.hashSync(password)
            const updateFields = {
                ...(name && { name }),
                ...(password && { password }),
                ...(username && { username }),
                ...(age !== undefined && { age })
            }

            await userDoc.update(updateFields)

            if (userType === 'admin') {
                return res.status(200).json({
                    message: "Admin updated successfully"
                })
            } else {
                return res.status(200).json({
                    message: "User updated successfully"
                })
            }
        } catch (error) {
            return res.status(500).json({
                message: "Error updating user"
            })
        }
    },
    deleteUser: async (req, res) => {
        const { id } = req.params
        const userRef = db.collection('users').doc(id)

        try {
            const userDoc = await userRef.get()

            if (!userDoc.exists) {
                return res.status(404).json({
                    message: "User with that ID does not exists"
                })
            }

            const bookingSnapshot = await db.collection('bookings').where('userId', '==', id).get()
            const deleteBookingsPromises = []
            bookingSnapshot.forEach(async (doc) => {
                const booking = doc.data();
                const { id: bookingId, movieId, seat_number } = booking;

                const movieRef = db.collection('movies').doc(movieId);
                await movieRef.update({
                    bookings: FieldValue.arrayRemove(bookingId)
                });

                const seatRef = db.collection('seats').doc(movieId);
                const seatDoc = await seatRef.get();
                if (seatDoc.exists) {
                    const seatData = seatDoc.data();
                    seatData.seats[seat_number - 1] = false;
                    deleteBookingsPromises.push(seatRef.update({
                        seats: seatData.seats
                    }));
                }

                deleteBookingsPromises.push(doc.ref.delete());
            });

            await Promise.all(deleteBookingsPromises)
            await userRef.delete()

            return res.status(200).json({
                message: "User deleted successfully"
            })
        } catch (error) {
            return res.status(500).json({
                message: "Error deleting user"
            })
        }
    },
    loginUser: async (req, res) => {
        const { username, password } = req.body
        const usersRef = db.collection('users')
        const adminsRef = db.collection('admins')

        if (
            !password ||
            password.length < 6 ||
            !username ||
            username.trim() === ""
        ) {
            return res.status(422).json({
                message: "Invalid inputs"
            })
        }

        try {
            const userSnapshot = await usersRef.where('username', '==', username).get()
            const adminSnapshot = await adminsRef.where('username', '==', username).get()

            if (userSnapshot.empty && adminSnapshot.empty) {
                return res.status(400).json({
                    message: "Invalid username or password"
                })
            }

            let userType
            let userData

            if (!userSnapshot.empty) {
                userType = 'user'
                const userDoc = userSnapshot.docs[0]
                userData = userDoc.data()
            } else {
                userType = 'admin'
                const adminDoc = adminSnapshot.docs[0]
                userData = adminDoc.data()
            }

            const isPasswordSame = bcrypt.compareSync(password, userData.password)

            if (!isPasswordSame) {
                return res.status(400).json({
                    message: "Invalid username or password"
                })
            }

            if (userType === 'admin') {
                const token = jwt.sign({ id: userData.id }, process.env.EXPRESS_APP_SECRET_KEY, {
                    expiresIn: "7d"
                })
                return res.status(200).json({
                    message: "Admin logged in succesfully",
                    userType: 'admin',
                    token,
                    id: userData.id
                })
            } else {
                return res.status(200).json({
                    message: "User logged in successfully",
                    userType: 'user',
                    id: userData.id
                })
            }
        } catch (error) {
            console.log(error)
            return res.status(500).json({
                message: "Error logging in user"
            })
        }
    },
    getBookingsOfUser: async (req, res) => {
        const { id } = req.params
        try {
            const snapshot = await db.collection('bookings').where('userId', '==', id).get();

            const bookings = [];
            snapshot.forEach((doc) => {
                const booking = doc.data();
                bookings.push(booking);
            });

            res.status(200).json({ bookings });
        } catch (error) {
            res.status(500).json({
                message: "Failed to fetch bookings for this user ID"
            })
        }
    },
    getUserBalance: async (req, res) => {
        const { id } = req.params
        const userRef = db.collection('users').doc(id)

        try {
            const doc = await userRef.get()

            if (!doc.exists) {
                return res.status(404).json({
                    message: "User with that ID does not exists"
                })
            }

            const user = doc.data()
            const userBalance = user.balance

            return res.status(200).json({
                balance: userBalance
            })
        } catch (error) {
            return res.status(500).json({
                message: "Error retrieving user balance"
            })
        }
    },
    topUpUserBalance: async (req, res) => {
        const { id } = req.params;
        let { topup } = req.body;
        const userRef = db.collection('users').doc(id);

        try {
            if ((await userRef.get()).exists) {
                const userDoc = userRef;
                const userSnapshot = await userDoc.get();
                const user = userSnapshot.data();
                const newBalance = user.balance + topup;

                if (!topup || typeof topup !== "number" || topup < 0) {
                    return res.status(422).json({
                        message: "Invalid inputs"
                    });
                }

                await userDoc.update({ balance: newBalance });

                return res.status(200).json({
                    message: "User balance updated successfully",
                    newBalance: newBalance
                });
            } else {
                return res.status(404).json({
                    message: "User with that ID does not exist"
                });
            }
        } catch (error) {
            return res.status(500).json({
                message: "Error updating balance of user"
            });
        }
    },
    getUserDataById: async (req, res) => {
        const { id } = req.params
        const userRef = db.collection('users').doc(id)

        try {
            const doc = await userRef.get()

            if (!doc.exists) {
                return res.status(404).json({
                    message: "User with that ID does not exists"
                })
            }

            const user = doc.data()

            return res.status(200).json({
                user
            })
        } catch (error) {
            return res.status(500).json({
                message: "Error retrieving user"
            })
        }
    }
}