import { useContext, useState } from 'react';
import AuthContext from '../auth';
import { Link, useHistory } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import IconButton from '@mui/material/IconButton';
import Avatar from '@mui/material/Avatar';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import HomeIcon from '@mui/icons-material/Home';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import LockIcon from '@mui/icons-material/Lock';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import CloseIcon from '@mui/icons-material/Close';

export default function RegisterScreen() {
    const { auth } = useContext(AuthContext);
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordVerify, setPasswordVerify] = useState('');
    const [avatar, setAvatar] = useState('');
    const [menuAnchorEl, setMenuAnchorEl] = useState(null);
    const history = useHistory();

    const handleAvatarChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatar(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        if (password !== passwordVerify) {
            alert("Passwords don't match");
            return;
        }
        auth.registerUser(username, email, password, passwordVerify, avatar);
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
                    <LockIcon sx={{ fontSize: 50, color: '#333' }} />
                    <Typography variant="h4" sx={{ color: '#2f3b45', fontWeight: 600 }}>
                        Create Account
                    </Typography>

                    {auth.errorMessage && (
                        <Alert severity="error" sx={{ width: '100%', maxWidth: 540 }}>
                            {auth.errorMessage}
                        </Alert>
                    )}

                    <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%', maxWidth: 640 }}>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 3 }}>
                            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 90 }}>
                                <Avatar 
                                    src={avatar || undefined}
                                    sx={{ width: 72, height: 72, bgcolor: '#e3f2fd', color: '#0d47a1' }}
                                >
                                    {username ? username.substring(0, 2).toUpperCase() : <PhotoCamera />}
                                </Avatar>
                                <Button
                                    variant="outlined"
                                    component="label"
                                    size="small"
                                    sx={{ mt: 1, bgcolor: '#e8f0fb', textTransform: 'none', minWidth: 90 }}
                                >
                                    Select
                                    <input
                                        type="file"
                                        hidden
                                        accept="image/*"
                                        onChange={handleAvatarChange}
                                    />
                                </Button>
                            </Box>
                            <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                                <TextField
                                    fullWidth
                                    placeholder="User Name"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                    sx={{ bgcolor: '#e8f0fb' }}
                                    InputProps={{
                                        endAdornment: (
                                            <IconButton size="small" onClick={() => setUsername('')}>
                                                <CloseIcon fontSize="small" />
                                            </IconButton>
                                        )
                                    }}
                                />
                                <TextField
                                    fullWidth
                                    placeholder="Email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    sx={{ bgcolor: '#e8f0fb' }}
                                    InputProps={{
                                        endAdornment: (
                                            <IconButton size="small" onClick={() => setEmail('')}>
                                                <CloseIcon fontSize="small" />
                                            </IconButton>
                                        )
                                    }}
                                />
                                <TextField 
                                    fullWidth
                                    placeholder="Password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    sx={{ bgcolor: '#e8f0fb' }}
                                    InputProps={{
                                        endAdornment: (
                                            <IconButton size="small" onClick={() => setPassword('')}>
                                                <CloseIcon fontSize="small" />
                                            </IconButton>
                                        )
                                    }}
                                />
                                <TextField
                                    fullWidth
                                    placeholder="Password Confirm"
                                    type="password"
                                    value={passwordVerify}
                                    onChange={(e) => setPasswordVerify(e.target.value)}
                                    required
                                    sx={{ bgcolor: '#e8f0fb' }}
                                    InputProps={{
                                        endAdornment: (
                                            <IconButton size="small" onClick={() => setPasswordVerify('')}>
                                                <CloseIcon fontSize="small" />
                                            </IconButton>
                                        )
                                    }}
                                />
                            </Box>
                        </Box>

                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ mt: 3, mb: 2, bgcolor: '#205697', '&:hover': { bgcolor: '#1565c0' } }}
                        >
                            Create Account
                        </Button>
                    </Box>

                    <Typography variant="body2" sx={{ color: '#d32f2f', fontWeight: 600 }}>
                        Already have an account?{' '}
                        <Link to="/login" style={{ color: '#d32f2f' }}>
                            Sign In
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
