import React, { Fragment, useEffect, useState } from 'react'
import { getAllUsers, getUserBalance, getUserBookings, getUserDataById, updateUserData, getMovieDetails, deleteBooking, topUpUserBalance } from '../../api-helpers/api-helpers'
import { Box, Button, CircularProgress, FormLabel, IconButton, List, ListItem, ListItemText, TextField, Typography } from '@mui/material'
import AccountCircleRoundedIcon from '@mui/icons-material/AccountCircleRounded';
import { Link } from 'react-router-dom';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';

const Profile = () => {
    const [bookings, setBookings] = useState()
    const [user, setUser] = useState()
    const [users, setUsers] = useState([])
    const [inputs, setInputs] = useState({
        name: "",
        username: "",
        age: 18,
        password: ""
    })
    const [userBalance, setUserBalance] = useState(0);
    const [isBalanceLoading, setIsBalanceLoading] = useState(true);
    const [isUsernameWarning, setIsUsernameWarning] = useState(false)
    const [isPasswordWarning, setIsPasswordWarning] = useState(false)
    const [isAgeWarning, setIsAgeWarning] = useState(false)
    const [editingLoading, setEditingLoading] = useState(false)
    const [notification, setNotification] = useState({
        open: false,
        message: "",
        severity: "success",
    })
    useEffect(() => {
        getUserBookings().then((res) => setBookings(res.bookings)).catch((err) => console.log(err))
        getUserDataById().then((res) => setUser(res.user)).catch((err) => console.log(err))
        getAllUsers().then((data) => setUsers(data.users)).catch((err) => console.log(err))
    }, [])
    useEffect(() => {
        const fetchUserBalance = async () => {
            try {
                getUserBalance(localStorage.getItem("userId")).then((res) => setUserBalance(res.balance))
                setIsBalanceLoading(false);
            } catch (err) {
                console.log(err);
                setIsBalanceLoading(false);
            }
        };

        fetchUserBalance();
    }, [localStorage.getItem("userId")]);
    const handleChange = (e) => {
        const { value, name } = e.target
        if (name === 'password') {
            setIsPasswordWarning(value.length < 6);
        }

        if (name === 'username') {
            const duplicateUsername = users.some((user) => user.username === value);
            setIsUsernameWarning(duplicateUsername && user.username !== value);
        }

        setInputs((prevState) => ({
            ...prevState,
            [name]: value
        }))
    }
    const handleSubmit = async (e) => {
        e.preventDefault();
        setEditingLoading(true)
        try {
            const updatedData = await updateUserData(inputs);
            console.log(updatedData);
            setNotification({
                open: true,
                message: 'Edit successful.',
                severity: 'success',
            })
            window.location.reload()
        } catch (error) {
            setNotification({
                open: true,
                message: 'An error occurred during editing.',
                severity: 'error',
            })
        }
        setEditingLoading(false)
    }
    const handleDelete = async (id) => {
        setEditingLoading(true);

        try {
            await deleteBooking(id);
            console.log("Booking deleted successfully.");
            window.location.reload();
        } catch (error) {
            console.log("An error occurred during delete operation.", error);
            setEditingLoading(false);
        }
    }

    if (!user || !bookings || isBalanceLoading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
                <CircularProgress />
            </Box>
        )
    }

    const isUpdateValid = !isAgeWarning && !isUsernameWarning && !isPasswordWarning && inputs.username && inputs.username.trim() !== "" && inputs.password && inputs.password !== ""

    return (
        <Box width={'100%'} display={'flex'}>
            <Fragment>
                {user && (
                    <Box
                        flexDirection={'column'}
                        justifyContent={'center'}
                        alignItems={'center'}
                        width={'30%'}
                        padding={3}>
                        <Box display="flex" justifyContent="center" alignItems="center">
                            <AccountCircleRoundedIcon sx={{ fontSize: "10rem", textAlign: 'center', ml: 3, m: 'auto' }} />
                        </Box>
                        <Typography padding={1} width={'auto'} textAlign={'center'} border={'1px solid #ccc'} borderRadius={6} sx={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                        }}>
                            Name: {user.name}
                        </Typography>
                        <Typography mt={1} padding={1} width={'auto'} textAlign={'center'} border={'1px solid #ccc'} borderRadius={6} sx={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                        }}>
                            Username: {user.username}
                        </Typography>
                        <Typography mt={1} padding={1} width={'auto'} textAlign={'center'} border={'1px solid #ccc'} borderRadius={6} sx={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                        }}>
                            Age: {user.age}
                        </Typography>
                    </Box>
                )}
                {user && (<Box width={'70%'} display={'flex'} flexDirection={'column'}>
                    <Typography variant='h5' textAlign={'center'} padding={2} paddingTop={4}>Edit User Data</Typography>
                    <form onSubmit={handleSubmit}>
                        <Box padding={3} display={'flex'} justifyContent={'center'} flexDirection={'column'} width={400} margin={'auto'} alignContent={'center'}>
                            <FormLabel sx={{ mt: 1, mb: 1 }}>Name</FormLabel>
                            <TextField placeholder={user.name} value={inputs.name} onChange={handleChange} margin="normal" variant={'standard'} type='text' name='name' />
                            <FormLabel sx={{ mt: 1, mb: 1 }}>Username</FormLabel>
                            <TextField placeholder={user.username} error={isUsernameWarning} helperText={isUsernameWarning ? 'Username is already taken' : ''} value={inputs.username} onChange={handleChange} margin="normal" variant={'standard'} type='text' name='username' />
                            <FormLabel sx={{ mt: 1, mb: 1 }}>Age</FormLabel>
                            <TextField placeholder={user.age} error={isAgeWarning} helperText={isAgeWarning ? 'Invalid age' : ''} value={inputs.age} onChange={handleChange} margin="normal" variant={'standard'} type='number' InputProps={{ inputProps: { min: 0 } }} name='age' />
                            <FormLabel sx={{ mt: 1, mb: 1 }}>Password</FormLabel>
                            <TextField error={isPasswordWarning} helperText={isPasswordWarning ? 'Minimum password length is six' : ''} value={inputs.password} onChange={handleChange} margin="normal" variant={'standard'} type='password' name='password' />
                            <Button disabled={!isUpdateValid} sx={{ mt: 2, borderRadius: 10, bgcolor: "#2b2d42" }} type='submit' fullWidth variant='contained'>Edit</Button>
                        </Box>
                    </form>
                    <div style={{ position: 'relative' }}>
                        {user && (
                            <Fragment>
                                {/* ... */}
                                <Box width={'50%'} paddingTop={3} position="relative">
                                    {/* ... */}
                                    {editingLoading && (
                                        <div style={{
                                            position: 'fixed',
                                            top: 0,
                                            left: 0,
                                            width: '100%',
                                            height: '100%',
                                            backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                            display: 'flex',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            zIndex: 9999,
                                        }}>
                                            <CircularProgress />
                                        </div>
                                    )}
                                </Box>
                            </Fragment>
                        )}
                    </div>
                    <Typography variant='h5' textAlign={'center'} padding={2} paddingTop={8}>Topup Balance</Typography>
                    <Box padding={3} display={'flex'} justifyContent={'center'} flexDirection={'column'} width={400} margin={'auto'} alignContent={'center'}>
                        <FormLabel sx={{ mt: 1, mb: 1 }}>Current Balance</FormLabel>
                        <TextField value={`Rp${userBalance}`} disabled margin="normal" variant={'standard'} type='text' name='balance' />
                        <Button sx={{ mt: 2, borderRadius: 10, bgcolor: "#2b2d42" }} LinkComponent={Link} to={'/topup'} fullWidth variant='contained'>Topup</Button>
                    </Box>
                    <Typography variant='h5' textAlign={'center'} padding={2} paddingTop={11}>Bookings</Typography>
                    <Box margin={'auto'} display={'flex'} flexDirection={'column'} width={'80%'}>
                        <List>
                            {bookings.map((booking, index) => (
                                <ListItem sx={{ bgcolor: "#00d386", color: "white", textAlign: "center", margin: 1 }}>
                                    <ListItemText sx={{ margin: 1, width: 'auto', textAlign: 'left' }}>
                                        Movie: {booking.movieTitle}
                                    </ListItemText>
                                    <ListItemText sx={{ margin: 1, width: 'auto', textAlign: 'left' }}>
                                        Seat: {booking.seat_number}
                                    </ListItemText>
                                    <ListItemText sx={{ margin: 1, width: 'auto', textAlign: 'left' }}>
                                        Date: {new Date(booking.date).toDateString()}
                                    </ListItemText>
                                    <ListItemText sx={{ margin: 1, width: 'auto', textAlign: 'left' }}>
                                        Price: {`Rp${booking.ticketPrice}`}
                                    </ListItemText>
                                    <IconButton onClick={() => handleDelete(booking.id)} color='error' >
                                        <DeleteForeverIcon />
                                    </IconButton>
                                </ListItem>
                            ))}
                        </List>
                    </Box>
                </Box>)}
            </Fragment>
        </Box>
    )
}

export default Profile