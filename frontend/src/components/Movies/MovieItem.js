import { Button, Card, CardActions, CardContent, CardMedia, CircularProgress, Typography } from '@mui/material'
import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useDispatch, useSelector } from 'react-redux';
import { deleteMovie } from '../../api-helpers/api-helpers';

const MovieItem = ({ title, release_date, poster_url, id, description }) => {
    const dispatch = useDispatch()
    const history = useNavigate()
    const isAdminLoggedIn = useSelector((state) => state.admin.isLoggedIn)
    const isUserLoggedIn = useSelector((state) => state.user.isLoggedIn)
    const [deleteLoading, setDeleteLoading] = useState(false)
    const handleDelete = async (e) => {
        e.preventDefault()
        setDeleteLoading(true)
        try {
            await deleteMovie(id)
            history('/')
        } catch (error) {
            console.log(error);
            setDeleteLoading(false)
        }
        setDeleteLoading(false)
    }
    const renderActionButtons = () => {
        if (isAdminLoggedIn) {
            return (
                <>
                    <Button color="primary" LinkComponent={Link} to={`/edit/${id}`} sx={{ margin: 'auto' }} size="small" startIcon={<EditIcon />}>
                        Edit
                    </Button>
                    <Button onClick={handleDelete} sx={{ margin: 'auto', color: "red" }} size="small" startIcon={<DeleteIcon />}>
                        Delete
                    </Button>
                </>
            );
        } else {
            if (isUserLoggedIn) {
                return (
                    <Button LinkComponent={Link} to={`/booking/${id}`} sx={{ margin: 'auto' }} size="small">
                        Book
                    </Button>
                );
            }
        }
    };

    return (
        <>
            {deleteLoading && (
                <div
                    style={{
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
                    }}
                >
                    <CircularProgress />
                </div>
            )}
            <Card
                sx={{
                    margin: 2,
                    width: 250,
                    height: 400,
                    borderRadius: 5,
                    ":hover": {
                        boxShadow: "10px 10px 20px #ccc"
                    },
                }}
            >
                <img height={'50%'} width='100%' src={poster_url} alt={title} />
                <CardContent>
                    <Typography
                        gutterBottom
                        variant="h5"
                        component="div"
                        sx={{
                            height: '3rem',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                        }}
                    >
                        {title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        {new Date(release_date).toDateString()}
                    </Typography>
                </CardContent>
                <CardActions>
                    {renderActionButtons()}
                </CardActions>
            </Card>
        </>
    )
}

export default MovieItem