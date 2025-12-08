import { useContext, useState } from 'react';
import AuthContext from '../auth';
import { Link, useHistory } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import LockIcon from '@mui/icons-material/Lock';
import AppBanner from './AppBanner';

export default function LoginScreen() {
    const { auth } = useContext(AuthContext);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const history = useHistory();

    const handleSubmit = (event) => {
        event.preventDefault();
        auth.loginUser(email, password);
    };

    return (
        <Box 
            sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '100vh',
                bgcolor: '#d7e9ff',
                padding: 3
            }}
        >
            <Box
                sx={{
                    bgcolor: '#f8fbff',
                    border: '2px solid #b5c7e0',
                    borderRadius: 1,
                    boxShadow: '0 6px 12px rgba(0,0,0,0.2)',
                    width: '100%',
                    width: 'calc(100% - 48px)',
                    maxWidth: '1200px',
                    minHeight: '700px',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column'
                }}
            >
                <AppBanner 
                    title="Sign In" 
                    onHome={() => history.push('/')} 
                    menuVariant="guest"
                />

                {/* Form content */}
                <Box 
                    sx={{
                        flexGrow: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 3,
                        px: 4
                    }}
                >
                    <LockIcon sx={{ fontSize: 56, color: '#333' }} />
                    <Typography variant="h4" sx={{ color: '#2f3b45', fontWeight: 600 }}>
                        Sign In
                    </Typography>

                    {auth.errorMessage && (
                        <Alert severity="error" sx={{ width: '100%', maxWidth: 420 }}>
                            {auth.errorMessage}
                        </Alert>
                    )}

                    <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%', maxWidth: 420 }}>
                        <TextField
                            fullWidth
                            placeholder="Email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            margin="normal"
                            required
                            sx={{ bgcolor: '#e8f0fb' }}
                        />
                        <TextField
                            fullWidth
                            placeholder="Password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            margin="normal"
                            required
                            sx={{ bgcolor: '#e8f0fb' }}
                        />
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ mt: 3, mb: 2, bgcolor: '#205697', '&:hover': { bgcolor: '#1565c0' } }}
                        >
                            SIGN IN
                        </Button>
                    </Box>

                    <Typography variant="body2" sx={{ color: '#d32f2f', fontWeight: 600 }}>
                        Don’t have an account?{' '}
                        <Link to="/register" style={{ color: '#d32f2f' }}>
                            Sign Up
                        </Link>
                    </Typography>

                    <Typography variant="caption" sx={{ color: '#777', mt: 4 }}>
                        Copyright © Playlister 2025
                    </Typography>
                </Box>
            </Box>
        </Box>
    );
}
