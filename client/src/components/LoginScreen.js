import { useContext, useState } from 'react';
import AuthContext from '../auth';
import { Link, useHistory } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import IconButton from '@mui/material/IconButton';
import HomeIcon from '@mui/icons-material/Home';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LockOpenIcon from '@mui/icons-material/LockOpen';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';

export default function LoginScreen() {
    const { auth } = useContext(AuthContext);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [menuAnchorEl, setMenuAnchorEl] = useState(null);
    const history = useHistory();

    const handleSubmit = (event) => {
        event.preventDefault();
        auth.loginUser(email, password);
    };

    const handleMenuOpen = (event) => {
        setMenuAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setMenuAnchorEl(null);
    };

    const handleMenuNav = (path) => {
        history.push(path);
        handleMenuClose();
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
                    minHeight: '800px',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column'
                }}
            >
                {/* Internal banner */}
                <Box 
                    sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between',
                        bgcolor: '#205697',
                        color: 'white',
                        px: 2,
                        py: 1.5,
                        borderBottom: '2px solid #b5c7e0'
                    }}
                >
                    <IconButton 
                        onClick={() => history.push('/')}
                        sx={{ 
                            color: '#205697',
                            bgcolor: 'white',
                            width: 40,
                            height: 40,
                            '&:hover': { bgcolor: '#e3f2fd' }
                        }}
                        aria-label="Home"
                    >
                        <HomeIcon />
                    </IconButton>
                    
                    <Typography variant="h5" sx={{ fontWeight: 700 }}>
                        Sign In
                    </Typography>

                    <IconButton 
                        onClick={handleMenuOpen}
                        sx={{ 
                            color: '#205697',
                            bgcolor: 'white',
                            width: 40,
                            height: 40,
                            '&:hover': { bgcolor: '#e3f2fd' }
                        }}
                        aria-label="Account"
                    >
                        <AccountCircleIcon />
                    </IconButton>
                </Box>

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
                    <LockOpenIcon sx={{ fontSize: 56, color: '#333' }} />
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

                <Menu
                    anchorEl={menuAnchorEl}
                    open={Boolean(menuAnchorEl)}
                    onClose={handleMenuClose}
                >
                    <MenuItem onClick={() => handleMenuNav('/login')}>Login</MenuItem>
                    <MenuItem onClick={() => handleMenuNav('/register')}>Create Account</MenuItem>
                </Menu>
            </Box>
        </Box>
    );
}
