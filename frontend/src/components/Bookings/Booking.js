import React, { Fragment, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { getMovieDetails, getMovieSeatDetails, getUserBalance, getUserDataById, newBooking } from '../../api-helpers/api-helpers'
import { Box, FormLabel, TextField, Typography, Alert, Snackbar, Button, CircularProgress, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, IconButton } from '@mui/material'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';

const Booking = () => {
    const history = useNavigate()
    const [movie, setMovie] = useState()
    const [userBalance, setUserBalance] = useState()
    const [seat, setSeat] = useState()
    const [selectedSeats, setSelectedSeats] = useState([])
    const [bookingLoading, setBookingLoading] = useState(false)
    const [inputs, setInputs] = useState({ seat_number: [], date: "" })
    const [totalAmount, setTotalAmount] = useState(0)
    const [bookingSummaryOpen, setBookingSummaryOpen] = useState(false);
    const [bookingSummary, setBookingSummary] = useState('');
    const [userAge, setUserAge] = useState()
    const calculateTotalAmount = () => {
        if (!movie) {
            return 0;
        }

        const ticketPrice = movie.ticket_price;
        const numSeats = selectedSeats.length;
        const amount = ticketPrice * numSeats;
        return amount;
    };
    const formattedDate = new Date().toLocaleDateString("en-CA", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    });
    const [notification, setNotification] = useState({
        open: false,
        message: "",
        severity: "success",
    })
    const id = useParams().id
    useEffect(() => {
        getMovieDetails(id).then((res) => setMovie(res.movie)).catch((err) => console.log(err))
        getMovieSeatDetails(id).then((res) => setSeat(res.seat)).catch((err) => console.log(err))
    }, [id])
    useEffect(() => {
        getUserBalance(localStorage.getItem("userId")).then((res) => setUserBalance(res.balance)).catch((err) => console.log(err))
        getUserDataById().then((res) => setUserAge(res.user.age)).catch((err) => console.log(err))
    }, [localStorage.getItem("userId")])
    const handleSeatSelection = (index) => {
        const isSelected = selectedSeats.includes(index);
        const selectedSeat = seat.seats[index];

        if (selectedSeat === true) {
            return
        }

        if (isSelected) {
            setSelectedSeats(selectedSeats.filter((seatIndex) => seatIndex !== index));
        } else {
            if (selectedSeats.length >= 6) {
                setNotification({
                    open: true,
                    message: 'You can only book 6 seats.',
                    severity: 'warning',
                });
                return;
            }
            setSelectedSeats([...selectedSeats, index]);
        }
        const amount = calculateTotalAmount();
        setTotalAmount(amount);
    }
    const handleSubmit = async (e) => {
        e.preventDefault()
        // console.log(inputs)
        setBookingLoading(true)
        try {
            const seatNumbers = inputs.seat_number;

            for (const seatNumber of seatNumbers) {
                const data = {
                    movieId: id,
                    seat_number: seatNumber,
                    date: formattedDate,
                };

                await newBooking(data);
            }

            setNotification({
                open: true,
                message: 'Booking successful.',
                severity: 'success',
            });

            const summary = `Movie: ${movie.title}\nSeat(s): ${inputs.seat_number.join(', ')}\nDate: ${formattedDate}\nTotal Amount: Rp${totalAmount}`;
            const formattedSummary = summary.replace(/\n/g, '<br>');
            setBookingSummary(formattedSummary);
            setBookingSummaryOpen(true);
        } catch (error) {
            setNotification({
                open: true,
                message: 'An error occurred during booking.',
                severity: 'error',
            });
            console.log(error);
            setBookingLoading(false)
        }
        setBookingLoading(false)
    }
    const renderSeats = () => {
        const rows = [];
        const numSeatsPerRow = 8;
        const seats = seat.seats;

        for (let i = 0; i < seats.length; i += numSeatsPerRow) {
            const rowSeats = seats.slice(i, i + numSeatsPerRow);

            const row = (
                <Box display="flex" justifyContent="center" key={i}>
                    {rowSeats.map((seat, index) => {
                        const seatIndex = i + index;
                        const isSelected = selectedSeats.includes(seatIndex);

                        return (
                            <Box
                                key={i + index}
                                width={'30px'}
                                height={'30px'}
                                margin={1}
                                padding={2}
                                border={isSelected ? '2px solid blue' : '1px solid gray'}
                                borderRadius={4}
                                onClick={() => handleSeatSelection(seatIndex)}
                                style={{ cursor: 'pointer', backgroundColor: !seat ? "white" : "red" }}
                            >
                                <Typography variant="h6" textAlign="center">
                                    {seatIndex + 1}
                                </Typography>
                            </Box>
                        );
                    })}
                </Box>
            );

            rows.push(row);
        }

        return rows;
    };
    useEffect(() => {
        const seatNumbers = selectedSeats.map((seatIndex) => seatIndex + 1)
        setInputs((prevState) => ({
            ...prevState,
            seat_number: seatNumbers,
        }))

        const amount = calculateTotalAmount();
        setTotalAmount(amount);
    }, [selectedSeats])
    const balanceNotShort = userBalance >= totalAmount
    const isFormValid = selectedSeats.length > 0 && balanceNotShort && userAge >= movie.age_rating
    const handleBookingSummaryClose = () => {
        setBookingSummaryOpen(false);
        history(-1)
    };

    if (!movie || !seat || userBalance === undefined) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
                <CircularProgress />
            </Box>
        )
    }

    return (
        <div>
            {movie &&
                <Fragment>
                    <Typography padding={3} variant='h4' textAlign={'center'}>
                        Book Tickets for {movie.title}
                    </Typography>
                    <Box display={'flex'} justifyContent={'center'}>
                        <Box display={'flex'} justifyContent={'column'} flexDirection={'column'} paddingTop={3} width={'50%'} marginRight={'auto'}>
                            <Box marginLeft={2}>
                                <img width={'80%'} height={'500px'} src={movie.poster_url} alt={movie.title} />
                            </Box>
                            <Box width={'80%'} marginTop={3} padding={2}>
                                <Typography paddingTop={2}>{movie.description}</Typography>
                                <Typography fontWeight={'bold'} marginTop={1}>Age rating: {movie.age_rating}</Typography>
                                <Typography fontWeight={'bold'} marginTop={1}>Release date: {new Date(movie.release_date).toDateString()}</Typography>
                                <Typography fontWeight={'bold'} marginTop={1}>Price per ticket: Rp{movie.ticket_price}</Typography>
                            </Box>
                        </Box>
                        <Box width={'50%'} paddingTop={3}>
                            <Box margin={'auto'} display="flex" justifyContent="center" flexWrap="wrap">
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginRight: '1rem' }}>
                                    <Box
                                        width={'15px'}
                                        height={'15px'}
                                        margin={1}
                                        padding={2}
                                        border={'1px solid gray'}
                                        borderRadius={4}
                                        style={{ cursor: 'pointer', backgroundColor: "red" }}
                                    >
                                    </Box>
                                    <Typography variant="body2" textAlign="center" marginTop={1}>
                                        Booked
                                    </Typography>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginRight: '1rem' }}>
                                    <Box
                                        width={'15px'}
                                        height={'15px'}
                                        margin={1}
                                        padding={2}
                                        border={'1px solid gray'}
                                        borderRadius={4}
                                        style={{ cursor: 'pointer', backgroundColor: "white" }}
                                    >
                                    </Box>
                                    <Typography variant="body2" textAlign="center" marginTop={1}>
                                        Empty
                                    </Typography>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                    <Box
                                        width={'15px'}
                                        height={'15px'}
                                        margin={1}
                                        padding={2}
                                        border={'2px solid blue'}
                                        borderRadius={4}
                                        style={{ cursor: 'pointer', backgroundColor: "white" }}
                                    >
                                    </Box>
                                    <Typography variant="body2" textAlign="center" marginTop={1}>
                                        Selected
                                    </Typography>
                                </div>
                            </Box>
                            <Box paddingTop={2} margin={'auto'} display="flex" justifyContent="center" flexWrap="wrap">
                                {renderSeats()}
                            </Box>
                            {notification.open && (
                                <Snackbar
                                    open={notification.open}
                                    autoHideDuration={3000}
                                    onClose={() => setNotification({ ...notification, open: false })}
                                    anchorOrigin={{ vertical: "top", horizontal: "center" }}
                                >
                                    <Alert
                                        onClose={() => setNotification({ ...notification, open: false })}
                                        severity={notification.severity}
                                        sx={{ width: '100%' }}
                                    >
                                        {notification.message}
                                    </Alert>
                                </Snackbar>
                            )}
                            <form onSubmit={handleSubmit}>
                                <Box width={'80%'} padding={5} margin={'auto'} display={'flex'} flexDirection={'column'}>
                                    <FormLabel>Selected Seat(s)</FormLabel>
                                    <TextField
                                        value={inputs.seat_number.join(', ')}
                                        variant="standard"
                                        margin="normal"
                                        disabled
                                    />
                                    <FormLabel>Booking Date</FormLabel>
                                    <TextField value={formattedDate} disabled name='date' type='date' margin='normal' variant={'standard'} />
                                    <Typography variant="h6" paddingTop={2} fontWeight={'bold'}>Total Amount: Rp{totalAmount}</Typography>
                                    {!balanceNotShort && (
                                        <Typography variant="body2" color="red">
                                            *Insufficient balance. Current balance is Rp{userBalance}. Short by Rp{totalAmount - userBalance}.
                                        </Typography>
                                    )}
                                    <Button LinkComponent={Link} to={'/topup'} sx={{ mt: 3, borderRadius: 10, bgcolor: "#2b2d42", width: '30%' }} variant='contained'>Topup</Button>
                                    <Button type='submit' disabled={!isFormValid} sx={{ mt: 3 }}>Book Now</Button>
                                    {userAge < movie.age_rating && (
                                        <Typography variant="body2" color="red" align='center'>
                                            *Cannot watch movie due to age.
                                        </Typography>
                                    )}
                                    <Button onClick={() => history(-1)} sx={{ mt: 3, color: 'red' }}>Cancel</Button>
                                </Box>
                            </form>
                            <div style={{ position: 'relative' }}>
                                {movie && (
                                    <Fragment>
                                        {/* ... */}
                                        <Box width={'50%'} paddingTop={3} position="relative">
                                            {/* ... */}
                                            {bookingLoading && (
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
                                <Dialog open={bookingSummaryOpen} onClose={handleBookingSummaryClose} PaperProps={{ style: { borderRadius: 20 } }}>
                                    <Box sx={{ ml: 'auto', padding: 1 }}>
                                        <IconButton onClick={() => history(-1)}>
                                            <CloseRoundedIcon />
                                        </IconButton>
                                    </Box>
                                    <Typography variant='h4' textAlign={'center'} paddingTop={2}>
                                        Summary
                                    </Typography>
                                    <form>
                                        <Box padding={6} display={'flex'} justifyContent={'center'} flexDirection={'column'} width={400} margin={'auto'} alignContent={'center'}>
                                            <FormLabel sx={{ mt: 1, mb: 1 }}>Movie</FormLabel>
                                            <TextField value={movie.title} disabled margin="normal" variant={'standard'} type='text' name='movie-title' />
                                            <FormLabel sx={{ mt: 1, mb: 1 }}>Seat(s)</FormLabel>
                                            <TextField value={inputs.seat_number.join(', ')} disabled margin="normal" variant={'standard'} type='text' name='seats-selected' />
                                            <FormLabel sx={{ mt: 1, mb: 1 }}>Date</FormLabel>
                                            <TextField value={formattedDate} disabled margin="normal" variant={'standard'} type='date' name='date-selected' />
                                            <FormLabel sx={{ mt: 1, mb: 1 }}>Total price</FormLabel>
                                            <TextField value={`Rp${totalAmount}`} disabled margin="normal" variant={'standard'} type='text' name='total-price' />
                                            <Button sx={{ mt: 2, borderRadius: 10, bgcolor: "#2b2d42" }} onClick={handleBookingSummaryClose} fullWidth variant='contained'>Close</Button>
                                        </Box>
                                    </form>
                                </Dialog>
                            </div>
                        </Box>
                    </Box>
                </Fragment>}
        </div>
    )
}

export default Booking