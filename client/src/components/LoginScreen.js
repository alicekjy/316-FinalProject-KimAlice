import {useContext, useState} from 'react';
import AuthContext from '../auth';
import { Link } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';

export default function LoginScreen (){
    const {auth} = useContext(AuthContext);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (event) =>{
        event.preventDefault();
        auth.loginUser(email, password);
    };
    return(
        <Box sx = {{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '80vh',
            padding: 3
        }}>
            <Box sx ={{
                bgcolor: 'white', 
                borderRadius: 2,
                padding: 4,
                minWidth: '400px',
                boxShadow: 3
            }}>
                <Typography variant ="h4" sx={{ mb:3, textAlign: 'center' }}>
                    Login to Playlister
                </Typography>
                {auth.errorMessage && (
                    <Alert severity = "error" sx = {{mb:2}}>
                        {auth.errorMessage}
                    </Alert>
                )}
                <form onSubmit = {handleSubmit}>
                    <TextField
                        fullWidth
                        label = "Email"
                        type = "email"
                        value = {email}
                        onChange = {(e) => setEmail(e.target.value)}
                        margin = "normal"
                        required
                        />
                    <TextField
                        fullWidth
                        label = "Password"
                        type = "password"
                        value = {password}
                        onChange = {(e) => setPassword (e.target.value)}
                        margin = "normal"
                        required
                        />
                    <Button
                        type = "submit"
                        fullWidth
                        variant = "contained"
                        sx = {{mt: 3, mb: 2}}
                        >
                            Login
                        </Button>
                    <Typography variant = "body2" sx = {{textAlgin: 'center'}}>
                        Don't have an account? {' '}
                        <Link to = "/register" style = {{color: '#1976d2'}}>
                            Register here
                        </Link>
                    </Typography>
                    <Typography variant = "body2" sx = {{textAlign: 'center', mt:1}}>
                        <Link to ="/" style = {{color: '#666'}}>
                            Back to Welcome
                        </Link>
                    </Typography>
                </form>
            </Box>
        </Box>
    )
}