import {useContext} from 'react';
import AuthContext from '../auth';
import {useHistory} from 'react-router-dom';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

export default function SplashScreen(){
    const history = useHistory ();

    const handleGuestContinue = () =>{
        // Guest mode goes straight to playlist browsing
        history.push('/home');
    }

    const handleLogin = () => {
        history.push('/login');
    }

    const handleRegister = () =>{
        history.push('/register');
    }
    return(
        <div id = "splash-screen">
            <Box sx = {{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '80vh',
                textAlign: 'center'
            }}>
                <Typography variant = "h1" sx = {{
                    fontSize: '4rem',
                    fontWeight: 'bold',
                    color: 'white',
                    mb: 2
                }}>
                   🎵 The Playlister
                </Typography>
                <Box sx = {{
                    display: 'flex',
                    gap: 2,
                    flexDirection: 'column',
                    width: '300px'
                }}>
                    <Button 
                        variant = "contained"
                        size= "large"
                        onClick = {handleLogin}
                        sx = {{
                            bgcolor: "#1976d2",
                            '&:hover': {bgcolor: '#1565c0'}
                        }}>
                            Login
                        </Button>
                    <Button
                        variant = "contained"
                        size = "large"
                        onClick = {handleRegister}
                        sx = {{
                            bgcolor: '#2e7d32',
                            '&:hover': {bgcolor: '#1b5e20'}
                        }}>
                            Create Account
                        </Button>
                        <Button
                            variant = "outlined"
                            size = "large"
                            onClick = {handleGuestContinue}
                            sx = {{
                                color: 'white',
                                borderColor: 'white',
                                '&:hover':{
                                    borderColor: 'white',
                                    bgcolor: 'rgba(255,255,255,0.1)'
                                }
                            }}>
                                Continue as Guest
                            </Button>
                </Box>
            </Box>
        </div>
    )
}
