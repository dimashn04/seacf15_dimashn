import React, { useEffect, useState } from 'react'
import { AppBar, Autocomplete, Box, IconButton, Tab, Tabs, TextField, Toolbar } from '@mui/material'
import MovieIcon from '@mui/icons-material/Movie';
import { getAllMovies } from '../api-helpers/api-helpers';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { adminActions, userActions } from '../store';

const Header = () => {
    const history = useNavigate()
    const dispatch = useDispatch()
    const isAdminLoggedIn = useSelector((state) => state.admin.isLoggedIn)
    const isUserLoggedIn = useSelector((state) => state.user.isLoggedIn)
    const [value, setValue] = useState(0)
    const [movies, setMovies] = useState([])
    const [setSelectedMovie, setSetSelectedMovie] = useState()
    useEffect(() => {
        getAllMovies().then((data) => setMovies(data.movies)).catch((err) => console.log(err))

    }, [])
    const logout = (isAdmin) => {
        dispatch(isAdmin ? adminActions.logout() : userActions.logout())
    }
    const handleAutocomplete = (e, val) => {
        const movie = movies.find((m) => m.title === val)
        if(isUserLoggedIn) {
            history(`/booking/${movie.id}`)
        } else if(isAdminLoggedIn) {
            history(`/edit/${movie.id}`)
        }
    }
    return (
        <AppBar position="sticky" sx={{
            bgcolor: "#2b2d42"
        }}>
            <Toolbar>
                <Box width={'10%'}>
                    <IconButton LinkComponent={Link} to="/" sx={{color: "white"}}>
                        <MovieIcon />
                    </IconButton>
                </Box>
                <Box width={'50%'} margin={'auto'}>
                    <Autocomplete
                        onChange={handleAutocomplete}
                        id="free-solo-demo"
                        freeSolo
                        options={movies && movies.map((option) => option.title)}
                        renderInput={(params) => (
                            <TextField sx={{
                                input: { color: "white" }
                            }}
                                variant='standard'
                                {...params}
                                placeholder="Search For Movies" />
                        )}
                    />
                </Box>
                <Box display={'flex'}>
                    <Tabs textColor='inherit' indicatorColor='secondary'>
                        {console.log(value)}
                        <Tab LinkComponent={Link} to="/movies" label="Movies" />
                        {!isAdminLoggedIn && !isUserLoggedIn && (<><Tab LinkComponent={Link} to="/login" label="Login" /></>)}
                        {isUserLoggedIn && (
                            <>
                                <Tab LinkComponent={Link} to="/user" label="Profile" />
                                <Tab onClick={() => logout(false)} LinkComponent={Link} to="/" label="Logout" />
                            </>)}
                        {isUserLoggedIn || isAdminLoggedIn && (
                            <>
                                <Tab onClick={() => logout(true)} LinkComponent={Link} to="/" label="Logout" />
                            </>
                        )}
                    </Tabs>
                </Box>
            </Toolbar>
        </AppBar>
    )
}

export default Header