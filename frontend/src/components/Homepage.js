import { Box, Button, IconButton, Typography } from '@mui/material'
import React, { useEffect, useState } from 'react'
import MovieItem from './Movies/MovieItem'
import { Link } from 'react-router-dom'
import { getAllMovies } from '../api-helpers/api-helpers'
import Carousel from 'react-material-ui-carousel'
import AddCircleOutlineRoundedIcon from '@mui/icons-material/AddCircleOutlineRounded';
import { useDispatch, useSelector } from 'react-redux'
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const Homepage = () => {
    const dispatch = useDispatch()
    const isAdminLoggedIn = useSelector((state) => state.admin.isLoggedIn)
    const isUserLoggedIn = useSelector((state) => state.user.isLoggedIn)
    const [movies, setMovies] = useState([])
    useEffect(() => {
        getAllMovies().then((data) => setMovies(data.movies)).catch((err) => console.log(err))
    }, [])
    const movieSlider = [
        'https://images.hdqwalls.com/wallpapers/john-wick-chapter-4-imax-32.jpg',
        'https://images.thedirect.com/media/article_full/guardians-3-vol.jpg',
        'https://media.socastsrm.com/wordpress/wp-content/blogs.dir/679/files/2023/04/maxresdefault.jpg',
        'https://pbs.twimg.com/media/FwjJpk1XwAE-6WR.jpg:large'
    ]

    return (
        <Box width={'100%'} height="100%" margin="auto" marginTop={2}>
            <Box margin={'auto'} width={"80%"} height={'50vh'} padding={2} paddingBottom={5}>
                <Carousel margin={'auto'} width={"80%"} height={'50vh'} padding={2}>
                    {movieSlider.map((item, index) => (
                        <img src={item}
                            alt='movie'
                            width={'100%'}
                            height={'100%'}
                            key={index} />
                    ))}
                </Carousel>
            </Box>
            <Box padding={5} margin="auto">
                <Typography variant='h4' textAlign={"center"}>
                    Latest Releases
                </Typography>
            </Box>
            <Box margin={'auto'} display={'flex'} width={'80%'} justifyContent={'center'} alignItems={'center'} flexWrap={'wrap'}>
                {movies && movies.sort((a, b) => new Date(b.release_date) - new Date(a.release_date)).slice(0, isAdminLoggedIn ? 3 : 4).map((movie, index) => (
                    <MovieItem id={movie.id} title={movie.title} poster_url={movie.poster_url} release_date={movie.release_date} key={index} />
                ))}
                {isAdminLoggedIn && (
                    <IconButton sx={{ margin: 2, width: 250, height: 400, borderRadius: 5 }} color="primary" LinkComponent={Link} to="/add" >
                        <AddCircleOutlineRoundedIcon fontSize="large" />
                        <Typography paddingLeft={1} textAlign={"center"} LinkComponent={Link} to="/add">
                            ADD MOVIE
                        </Typography>
                    </IconButton>
                )}
            </Box>
            <Box display={'flex'} padding={5} margin={'auto'}>
                <Button LinkComponent={Link} to="/movies" variant='outlined' sx={{ margin: "auto", color: "#2b2d42" }}>
                    View All Movies
                </Button>
            </Box>
        </Box>
    )
}

export default Homepage