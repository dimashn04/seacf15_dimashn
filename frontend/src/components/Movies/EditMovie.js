import { Alert, Box, Button, CircularProgress, Dialog, FormLabel, IconButton, Snackbar, TextField, Typography } from '@mui/material'
import React, { useEffect, useState, Fragment } from 'react'
import { addNewMovie, deleteMovie, getAllMovies, getMovieDetails, updateMovie } from '../../api-helpers/api-helpers'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { useNavigate, useParams } from 'react-router-dom';
import DeleteIcon from '@mui/icons-material/Delete';

const EditMovie = () => {
    const id = useParams().id
    const history = useNavigate()
    const labelProps = {
        mt: 1,
        mb: 1,
        paddingTop: 3
    }
    const formattedDate = new Date().toLocaleDateString("en-CA", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    })
    const [inputs, setInputs] = useState({
        title: "",
        description: "",
        release_date: formattedDate,
        poster_url: "",
        age_rating: 0,
        ticket_price: 0
    })
    const [isTitleWarning, setIsTitleWarning] = useState(false)
    const [isDescWarning, setIsDescWarning] = useState(false)
    const [isPosterUrlWarning, setIsPosterUrlWarning] = useState(false)
    const [isDateWarning, setIsDateWarning] = useState(false)
    const [movie, setMovie] = useState(false)
    const [movies, setMovies] = useState([])
    useEffect(() => {
        getAllMovies().then((data) => setMovies(data.movies)).catch((err) => console.log(err))
        getMovieDetails(id).then((res) => setMovie(res.movie)).catch((err) => console.log(err))
    }, [])
    const handleChange = (e) => {
        const { value, name } = e.target
        if (name === 'description') {
            setIsDescWarning(!value || value.trim() === "");
        }

        if (name === 'title') {
            const duplicateMovieTitle = movies.some((movie) => movie.title === value.trim());
            setIsTitleWarning(duplicateMovieTitle);
        }

        if (name === 'poster_url') {
            setIsPosterUrlWarning(!value || value.trim() === "");
        }

        if (name === 'release_date') {
            setIsDateWarning(!value || value.trim() === "");
        }

        setInputs((prevState) => ({
            ...prevState,
            [name]: value
        }));
    }
    const [notification, setNotification] = useState({
        open: false,
        message: "",
        severity: "success",
    })
    const [addingLoading, setAddingLoading] = useState(false)
    const [addingSummaryOpen, setAddingSummaryOpen] = useState(false)
    const handleAddingSummaryClose = () => {
        setAddingSummaryOpen(false);
        history(-1)
    }
    console.log(id)
    const handleSubmit = async (e) => {
        e.preventDefault()
        setAddingLoading(true)
        try {
            await updateMovie(id, {
                title: inputs.title.trim(),
                description: inputs.description.trim(),
                release_date: new Date(inputs.release_date).toLocaleDateString("en-CA", {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                }),
                poster_url: inputs.poster_url.trim(),
                age_rating: Number(inputs.age_rating),
                ticket_price: Number(inputs.ticket_price)
            })

            setNotification({
                open: true,
                message: 'Movie editing successful.',
                severity: 'success',
            })
            setAddingSummaryOpen(true)
        } catch (error) {
            console.log(error);
            setNotification({
                open: true,
                message: 'An error occurred during editing.',
                severity: 'error',
            })
            setAddingLoading(false)
        }
        setAddingLoading(false)
    }
    const handleDelete = async (e) => {
        e.preventDefault()
        setAddingLoading(true)
        try {
            await deleteMovie(id)
            history(-1)
        } catch (error) {
            console.log(error);
            setAddingLoading(true)
        }
        setAddingLoading(true)
    }

    console.log(new Date(inputs.release_date).toLocaleDateString("en-CA", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }))

    const isValid = !isDescWarning && !isTitleWarning && !isPosterUrlWarning && inputs.description && inputs.description.trim() !== "" && inputs.title && inputs.title.trim() !== "" && inputs.poster_url && inputs.poster_url.trim() !== ""

    if (!movie || !movies) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
                <CircularProgress />
            </Box>
        )
    }

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <Box width={'50%'} padding={10} margin={'auto'} display={'flex'} flexDirection={'column'} boxShadow={'10px 10px 20px #ccc'}>
                    <Typography textAlign={'center'} variant='h5'>
                        Edit Movie
                    </Typography>
                    <FormLabel sx={labelProps}>
                        Title
                    </FormLabel>
                    <TextField placeholder={movie.title} error={isTitleWarning} helperText={isTitleWarning ? 'Movie title is already taken' : ''} value={inputs.title} onChange={handleChange} name='title' variant='standard' margin='normal' type='text' />
                    <FormLabel sx={labelProps}>
                        Description
                    </FormLabel>
                    <TextField placeholder={movie.description} error={isDescWarning} helperText={isDescWarning ? 'Invalid description' : ''} value={inputs.description} onChange={handleChange} name='description' variant='standard' margin='normal' type='text' />
                    <FormLabel sx={labelProps}>
                        Release date
                    </FormLabel>
                    <TextField placeholder={movie.release_date} error={isDateWarning} helperText={isDateWarning ? 'Invalid date' : ''} value={inputs.release_date} onChange={handleChange} name='release_date' variant='standard' margin='normal' type='date' />
                    <FormLabel sx={labelProps}>
                        Age Rating
                    </FormLabel>
                    <TextField placeholder={movie.age_rating} value={inputs.age_rating} onChange={handleChange} name='age_rating' variant='standard' margin='normal' type='number' InputProps={{ inputProps: { min: 0 } }} />
                    <FormLabel sx={labelProps}>
                        Ticket Price
                    </FormLabel>
                    <TextField placeholder={movie.ticket_price} value={inputs.ticket_price} onChange={handleChange} name='ticket_price' variant='standard' margin='normal' type='number' InputProps={{ inputProps: { min: 0 } }} />
                    <FormLabel sx={labelProps}>
                        Poster URL
                    </FormLabel>
                    <TextField placeholder={movie.poster_url} error={isPosterUrlWarning} helperText={isPosterUrlWarning ? 'Invalid poster URL' : ''} value={inputs.poster_url} onChange={handleChange} name='poster_url' variant='standard' margin='normal' type='text' />
                    <Box paddingTop={8}>
                        <Button disabled={!isValid} type='submit' contained sx={{
                            color: "white", width: '30%', backgroundColor: "#2b2d42", ":hover": {
                                bgcolor: "#1565C0"
                            }
                        }}>Edit Movie</Button>
                    </Box>
                    <Box paddingTop={4}>
                        <Button onClick={handleDelete} sx={{ width: '30%', color: "red" }} startIcon={<DeleteIcon />}>
                            Delete
                        </Button>
                    </Box>
                    <Box paddingTop={3}>
                        <Button onClick={() => history(-1)} sx={{ width: '30%', color: 'red' }}>Cancel</Button>
                    </Box>
                </Box>
            </form>
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
            <div style={{ position: 'relative' }}>
                {inputs && (
                    <Fragment>
                        {/* ... */}
                        <Box width={'50%'} paddingTop={3} position="relative">
                            {/* ... */}
                            {addingLoading && (
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
                <Dialog open={addingSummaryOpen} onClose={handleAddingSummaryClose} PaperProps={{ style: { borderRadius: 20 } }}>
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
                            <FormLabel sx={{ mt: 1, mb: 1 }}>Title</FormLabel>
                            <TextField value={inputs.title} disabled margin="normal" variant={'standard'} type='text' name='movie-title' />
                            <FormLabel sx={{ mt: 1, mb: 1 }}>Description</FormLabel>
                            <TextField value={inputs.description} disabled margin="normal" variant={'standard'} type='text' name='description' />
                            <FormLabel sx={{ mt: 1, mb: 1 }}>Release Date</FormLabel>
                            <TextField value={new Date(inputs.release_date).toLocaleDateString("en-CA", {
                                year: "numeric",
                                month: "2-digit",
                                day: "2-digit",
                            })} disabled margin="normal" variant={'standard'} type='date' name='date-selected' />
                            <FormLabel sx={{ mt: 1, mb: 1 }}>Age rating</FormLabel>
                            <TextField value={`${Number(inputs.age_rating)}`} disabled margin="normal" variant={'standard'} type='text' name='age-rating' />
                            <FormLabel sx={{ mt: 1, mb: 1 }}>Ticket price</FormLabel>
                            <TextField value={`Rp${Number(inputs.ticket_price)}`} disabled margin="normal" variant={'standard'} type='text' name='ticket-price' />
                            <Button sx={{ mt: 2, borderRadius: 10, bgcolor: "#2b2d42" }} onClick={handleAddingSummaryClose} fullWidth variant='contained'>Close</Button>
                        </Box>
                    </form>
                </Dialog>
            </div>
        </div>
    )
}

export default EditMovie