import { Box, Button, Dialog, FormLabel, IconButton, TextField, Typography } from '@mui/material'
import React, { useEffect, useState } from 'react'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { useNavigate } from 'react-router-dom'
import { getAllUsers } from '../../api-helpers/api-helpers';

const LoginForm = ({ onSubmit }) => {
    const history = useNavigate()
    const [inputs, setInputs] = useState({
        name: "",
        username: "",
        age: 18,
        password: ""
    })
    const [isUsernameWarning, setIsUsernameWarning] = useState(false)
    const [isPasswordWarning, setIsPasswordWarning] = useState(false)
    const [isAgeWarning, setIsAgeWarning] = useState(false)
    const [isSignUp, setIsSignUp] = useState(false)
    const [users, setUsers] = useState([])
    useEffect(() => {
        getAllUsers().then((data) => setUsers(data.users)).catch((err) => console.log(err))
    }, [])
    const handleChange = (e) => {
        const { value, name } = e.target
        if (name === 'password') {
            setIsPasswordWarning(value.length < 6);
        }

        if (isSignUp && name === 'username') {
            const duplicateUsername = users.some((user) => user.username === value.trim());
            setIsUsernameWarning(duplicateUsername);
        }

        setInputs((prevState) => ({
            ...prevState,
            [name]: value
        }));
    }
    const handleSubmit = (e) => {
        e.preventDefault()
        onSubmit({ inputs, signup: isSignUp })

        if (!isSignUp) {
            history(-1)
        } else {
            setIsSignUp((prevState) => !prevState);
        }
    }

    const isValidSignUp = !isAgeWarning && !isUsernameWarning && !isPasswordWarning && inputs.username && inputs.username.trim() !== "" && inputs.password && inputs.password !== ""
    const isValidLogin = !isPasswordWarning && inputs.username && inputs.username.trim() !== "" && inputs.password && inputs.password !== ""

    return (
        <Dialog PaperProps={{ style: { borderRadius: 20 } }} open={true}>
            <Box sx={{ ml: 'auto', padding: 1 }}>
                <IconButton onClick={() => history(-1)}>
                    <CloseRoundedIcon />
                </IconButton>
            </Box>
            <Typography variant='h4' textAlign={'center'} paddingTop={2}>
                {isSignUp ? "Sign Up" : "Login"}
            </Typography>
            <form onSubmit={handleSubmit}>
                <Box padding={6} display={'flex'} justifyContent={'center'} flexDirection={'column'} width={400} margin={'auto'} alignContent={'center'}>
                    {isSignUp && <><FormLabel sx={{ mt: 1, mb: 1 }}>Name</FormLabel>
                        <TextField value={inputs.name} onChange={handleChange} margin="normal" variant={'standard'} type='text' name='name' /></>}
                    <FormLabel sx={{ mt: 1, mb: 1 }}>Username</FormLabel>
                    <TextField error={isUsernameWarning} helperText={isUsernameWarning ? 'Username is already taken' : ''} value={inputs.username} onChange={handleChange} margin="normal" variant={'standard'} type='text' name='username' />
                    {isSignUp && <><FormLabel sx={{ mt: 1, mb: 1 }}>Age</FormLabel>
                        <TextField error={isAgeWarning} helperText={isAgeWarning ? 'Invalid age' : ''} value={inputs.age} onChange={handleChange} margin="normal" variant={'standard'} type='number' InputProps={{inputProps: {min: 0}}} name='age' /></>}
                    <FormLabel sx={{ mt: 1, mb: 1 }}>Password</FormLabel>
                    <TextField error={isPasswordWarning} helperText={isPasswordWarning ? 'Minimum password length is six' : ''} value={inputs.password} onChange={handleChange} margin="normal" variant={'standard'} type='password' name='password' />
                    <Button disabled={isSignUp ? !isValidSignUp : !isValidLogin} sx={{ mt: 2, borderRadius: 10, bgcolor: "#2b2d42" }} type='submit' fullWidth variant='contained'>{isSignUp ? "Sign Up" : "Login"}</Button>
                    <Button onClick={() => setIsSignUp(!isSignUp)} sx={{ mt: 2, borderRadius: 10 }} fullWidth>{isSignUp ? "Login" : "Sign Up"}</Button>
                </Box>
            </form>
        </Dialog>
    )
}

export default LoginForm