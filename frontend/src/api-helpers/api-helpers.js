import axios from 'axios'

export const getAllMovies = async () => {
    const res = await axios.get("/movie").catch(err => console.log(err))

    if (res.status === 404) {
        return console.log("No movies")
    } else if (res.status === 500) {
        return console.log("Error retrieving movies")
    }

    const data = await res.data
    return data
}

export const sendUsersAuthRequest = async (data, signup) => {
    const res = await axios.post(`/user/${signup ? "signup" : "login"}`, {
        name: signup ? data.name : "",
        username: data.username,
        password: data.password,
        age: signup ? data.age : 18
    }).catch(err => console.log(err))

    if (res.status === 400) {
        return console.log("Invalid username or password")
    } else if (res.status === 422) {
        return console.log("Invalid inputs")
    } else if (res.status === 404) {
        return console.log("User with that ID does not exists")
    } else if (res.status === 500) {
        return console.log("Error occurred")
    } else if (res.status === 409) {
        return console.log("User with the same username already exists")
    }

    const resData = await res.data
    return resData
}

export const getMovieDetails = async (id) => {
    const res = await axios.get(`/movie/${id}`).catch((err) => console.log(err))

    if (res.status === 404) {
        return console.log("Movie with that ID does not exists")
    } else if (res.status === 500) {
        return console.log("Error retrieving movie")
    }

    const resData = await res.data
    return resData
}

export const getMovieSeatDetails = async (id) => {
    const res = await axios.get(`/seat/${id}`).catch((err) => console.log(err))

    if (res.status === 404) {
        return console.log("Seats with that ID does not exists")
    } else if (res.status === 500) {
        return console.log("Error retrieving seats")
    }

    const resData = await res.data
    return resData
}

export const getBookingById = async (id) => {
    const res = await axios.get(`/booking/${id}`).catch((err) => console.log(err))

    if (res.status === 404) {
        return console.log("Seats with that ID does not exists")
    } else if (res.status === 500) {
        return console.log("Error retrieving seats")
    }

    const resData = await res.data
    return resData
}

export const newBooking = async (data) => {
    const res = await axios.post("/booking", {
        movieId: data.movieId,
        seat_number: data.seat_number,
        date: data.date,
        userId: localStorage.getItem("userId")
    }).catch((err) => console.log(err))

    if (res.status !== 201) {
        return console.log("Error occurred")
    }

    const resData = await res.data
    return resData
}

export const getUserBalance = async (id) => {
    const res = await axios.get(`/user/balance/${id}`).catch((err) => console.log(err))

    if (res.status === 404) {
        return console.log("User with that ID does not exists")
    } else if (res.status === 500) {
        return console.log("Error retrieving user balance")
    }

    const resData = await res.data
    return resData
}

export const topUpUserBalance = async (data) => {
    const res = await axios.post(`/user/topup/${localStorage.getItem("userId")}`, {
        topup: data.topup
    }).catch((err) => console.log(err))

    if (res.status === 422) {
        return console.log("Invalid inputs")
    } else if (res.status === 500) {
        return console.log("Error updating balance of user")
    } else if (res.status === 404) {
        return console.log("User with that ID does not exist")
    }

    const resData = await res.data
    return resData
}

export const getUserDataById = async () => {
    const res = await axios.get(`/user/${localStorage.getItem("userId")}`).catch((err) => console.log(err))

    if (res.status === 404) {
        return console.log("User with that ID does not exists")
    } else if (res.status === 500) {
        return console.log("Error retrieving user")
    }

    const resData = await res.data
    return resData
}

export const getAllUsers = async () => {
    const res = await axios.get("/user").catch(err => console.log(err))

    if (res.status === 404) {
        return console.log("No users")
    } else if (res.status === 500) {
        return console.log("Error retrieving movies")
    }

    const data = await res.data
    return data
}

export const getUserBookings = async () => {
    const res = await axios.get(`/user/bookings/${localStorage.getItem("userId")}`).catch((err) => console.log(err))

    if (res.status !== 200) {
        return console.log("Error occurred")
    }

    const data = await res.data
    return data
}

export const updateUserData = async (data) => {
    const res = await axios.put(`/user/${localStorage.getItem("userId")}`, {
        age: data.age,
        name: data.name,
        username: data.username,
        password: data.password
    }).catch((err) => console.log(err))

    if (res.status === 422) {
        return console.log("Invalid inputs")
    } else if (res.status === 500) {
        return console.log("Error updating user")
    } else if (res.status === 404) {
        return console.log("User with that ID does not exist")
    }

    const resData = await res.data
    return resData
}

export const deleteBooking = async (id) => {
    const res = await axios.delete(`/booking/${id}`).catch((err) => console.log(err))

    if (res.status !== 200) {
        return console.log("Unexpected error")
    }

    const resData = await res.data
    return resData
}

export const addNewMovie = async (data) => {
    const res = await axios.post("/movie", {
        title: data.title,
        description: data.description,
        release_date: data.release_date,
        poster_url: data.poster_url,
        age_rating: data.age_rating,
        ticket_price: data.ticket_price
    }, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
        }
    }).catch((err) => console.log(err))

    if(res.status !== 201) {
        return console.log("Error occured")
    }

    const resData = await res.data
    return resData
}

export const deleteMovie = async (id) => {
    const res = await axios.delete(`/movie/${id}`, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
        }
    }).catch((err) => console.log(err))

    if(res.status !== 200) {
        return console.log("Error occured")
    }

    const resData = await res.data
    return resData
}

export const updateMovie = async (id, data) => {
    const res = await axios.put(`/movie/${id}`, {
        title: data.title,
        description: data.description,
        release_date: data.release_date,
        poster_url: data.poster_url,
        age_rating: data.age_rating,
        ticket_price: data.ticket_price
    }, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
        }
    }).catch((err) => console.log(err))

    if(res.status !== 201) {
        return console.log("Error occured")
    }

    const resData = await res.data
    return resData
}