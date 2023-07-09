import { Box, Button, IconButton, Typography } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { getAllMovies } from '../../api-helpers/api-helpers'
import MovieItem from './MovieItem'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import AddCircleOutlineRoundedIcon from '@mui/icons-material/AddCircleOutlineRounded';

const Movies = () => {
  const dispatch = useDispatch()
  const isAdminLoggedIn = useSelector((state) => state.admin.isLoggedIn)
  const isUserLoggedIn = useSelector((state) => state.user.isLoggedIn)
  const [movies, setMovies] = useState([])
  useEffect(() => {
    getAllMovies().then((data) => setMovies(data.movies)).catch((err) => console.log(err))
  }, [])

  return (
    <Box margin={'auto'} marginTop={4}>
      <Typography margin={'auto'} variant='h4' padding={2} width={'40%'} bgcolor={'#900C3F'} color={'white'} textAlign={'center'}>
        All Movies
      </Typography>
      {isAdminLoggedIn && (
        <Box display={'flex'} paddingTop={6} margin={'auto'}>
          <Button LinkComponent={Link} to="/add" variant='outlined' sx={{ margin: "auto", color: "#2b2d42" }}>
            ADD MOVIE
          </Button>
        </Box>
      )}
      <Box width={'100%'} margin={'auto'} marginTop={5} display={'flex'} justifyContent={'center'} flexWrap={'wrap'}>
        {movies && movies.sort((a, b) => new Date(b.release_date) - new Date(a.release_date)).map((movie, index) => <MovieItem key={index} id={movie.id} title={movie.title} poster_url={movie.poster_url} release_date={movie.release_date} />)}
        {isAdminLoggedIn && (
          <IconButton sx={{ margin: 2, width: 250, height: 400, borderRadius: 5 }} color="primary" LinkComponent={Link} to="/add" >
            <AddCircleOutlineRoundedIcon fontSize="large" />
            <Typography paddingLeft={1} textAlign={"center"}>
              ADD MOVIE
            </Typography>
          </IconButton>
        )}
      </Box>
    </Box>
  )
}

export default Movies