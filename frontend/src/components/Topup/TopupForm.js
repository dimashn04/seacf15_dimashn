import { Box, Button, Dialog, FormLabel, IconButton, TextField, Typography, CircularProgress, Snackbar, Alert } from '@mui/material'
import React, { useState, useEffect } from 'react'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded';
import { useNavigate } from 'react-router-dom'
import { getUserBalance, topUpUserBalance } from '../../api-helpers/api-helpers';

const TopupForm = () => {
    const history = useNavigate();
    const [inputs, setInputs] = useState({
        topup: 0
    });
    const [userBalance, setUserBalance] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isSnackbarOpen, setIsSnackbarOpen] = useState(false);
    const [snackbarMessage, setSnackbarMessage] = useState('');
    const [snackbarSeverity, setSnackbarSeverity] = useState('success');
    const [isWarning, setIsWarning] = useState(false)

    useEffect(() => {
        const fetchUserBalance = async () => {
            try {
                getUserBalance(localStorage.getItem("userId")).then((res) => setUserBalance(res.balance))
                setIsLoading(false);
            } catch (err) {
                console.log(err);
                setIsLoading(false);
            }
        };

        fetchUserBalance();
    }, [localStorage.getItem("userId")]);

    const handleChange = (e) => {
        const { value, name } = e.target
        if (name === 'topup') {
            const inputValue = Number(value);
            setIsWarning(inputValue <= 0);
        }

        setInputs((prevState) => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const data = { topup: Number(inputs.topup) };
            await topUpUserBalance(data)
            setSnackbarMessage('Top-up successful');
            setSnackbarSeverity('success');
            setIsSnackbarOpen(true);
            setInputs({ topup: 0 })
        } catch (err) {
            setSnackbarMessage('Error occurred during top-up');
            setSnackbarSeverity('error');
            setIsSnackbarOpen(true);
        }
    };

    const handleSnackbarClose = () => {
        setIsSnackbarOpen(false);
    };

    if (isLoading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
                <CircularProgress />
            </Box>
        );
    }

    const isValidTopup = inputs.topup > 0

    return (
        <Dialog PaperProps={{ style: { borderRadius: 20 } }} open={true}>
            <Box sx={{ ml: 'auto', padding: 1 }}>
                <IconButton onClick={() => history(-1)}>
                    <CloseRoundedIcon />
                </IconButton>
            </Box>
            <Typography variant='h4' textAlign={'center'} paddingTop={2}>
                Topup
            </Typography>
            <form onSubmit={handleSubmit}>
                <Box padding={6} display={'flex'} justifyContent={'center'} flexDirection={'column'} width={400} margin={'auto'} alignContent={'center'}>
                    <FormLabel sx={{ mt: 1, mb: 1 }}>Current Balance</FormLabel>
                    <TextField value={`Rp${userBalance}`} disabled margin="normal" variant={'standard'} type='text' name='balance' />
                    <FormLabel sx={{ mt: 1, mb: 1 }}>Topup Amount</FormLabel>
                    <TextField error={isWarning} helperText={isWarning ? 'Invalid amount' : ''} value={inputs.topup} onChange={handleChange} margin="normal" variant={'standard'} type='number' InputProps={{inputProps: {min: 0}}} name='topup' />
                    <FormLabel sx={{ mt: 1, mb: 1 }}>Balance After Topup</FormLabel>
                    <TextField value={`Rp${Number(userBalance) + Number(inputs.topup)}`} disabled margin="normal" variant={'standard'} type='text' name='after' />
                    <Button disabled={!isValidTopup} sx={{ mt: 2, borderRadius: 10, bgcolor: "#2b2d42" }} type='submit' fullWidth variant='contained'>Topup Now</Button>
                </Box>
            </form>
            <Snackbar
                open={isSnackbarOpen}
                autoHideDuration={3000}
                onClose={handleSnackbarClose}
                message={snackbarMessage}
                severity={snackbarSeverity}
                anchorOrigin={{ vertical: "top", horizontal: "center" }}
            >
                <Alert
                    onClose={handleSnackbarClose}
                    severity={snackbarSeverity}
                    sx={{ width: '100%' }}
                >
                    {snackbarMessage}
                </Alert>
            </Snackbar>
        </Dialog>
    );
};

export default TopupForm
