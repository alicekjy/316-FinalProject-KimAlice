import { useContext, useState, useEffect } from 'react';
import AuthContext from '../auth';
import { useHistory } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import IconButton from '@mui/material/IconButton';
import Avatar from '@mui/material/Avatar';
import LockIcon from '@mui/icons-material/Lock';
import PhotoCamera from '@mui/icons-material/PhotoCamera';
import CloseIcon from '@mui/icons-material/Close';
import AppBanner from './AppBanner';

export default function EditAccountScreen() {
    const { auth } = useContext(AuthContext);
    const history = useHistory();
    const [username, setUsername] = useState('');
    const [avatar, setAvatar] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');

    useEffect(() => {
        if ( !auth.loggedIn) {
            history.push('/login');
        } else if (auth.user) {
            setUsername(auth.user.username || '');
            setAvatar(auth.user.avatar || '');
        }
        
    }, [auth, history]);

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

    const handleSubmit = async (event) => {
        event.preventDefault();
        setErrorMessage('');
        setSuccessMessage('');

        if (!username.trim()) {
            setErrorMessage('Username is required');
            return;
        }

        if (password || passwordConfirm) {
            if (password !== passwordConfirm) {
                setErrorMessage("Passwords don't match");
                return;
            }
        }

        try {
            const response = await fetch('http://localhost:4000/auth/update', {
                method: 'PUT',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username,
                    avatar,
                    password
                })
            });

            const data = await response.json();

            if (response.ok) {
                setSuccessMessage('Account updated successfully!');
                await auth.getLoggedIn();
                setPassword('');
                setPasswordConfirm('');
                setTimeout(() => {
                    history.push('/playlists');
                }, 1500);
            } else {
                setErrorMessage(data.errorMessage || 'Failed to update account');
            }
        } catch (error) {
            setErrorMessage('Error updating account. Please try again.');
            console.error('Update account error:', error);
        }
    };
    if (!auth.loggedIn) {
        return null;
    }

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
                <AppBanner 
                    title="Edit Account" 
                    onHome={() => history.push('/playlists')} 
                    menuVariant="auth"
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
                        Edit Account
                    </Typography>

                    {errorMessage && (
                        <Alert severity="error" sx={{ width: '100%', maxWidth: 540 }}>
                            {errorMessage}
                        </Alert>
                    )}

                    {successMessage && (
                        <Alert severity="success" sx={{ width: '100%', maxWidth: 540 }}>
                            {successMessage}
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
                                    value={auth.user?.email || ''}
                                    disabled
                                    sx={{ bgcolor: '#e8f0fb' }}
                                    InputProps={{
                                        endAdornment: (
                                            <IconButton size="small" disabled>
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
                                    value={passwordConfirm}
                                    onChange={(e) => setPasswordConfirm(e.target.value)}
                                    sx={{ bgcolor: '#e8f0fb' }}
                                    InputProps={{
                                        endAdornment: (
                                            <IconButton size="small" onClick={() => setPasswordConfirm('')}>
                                                <CloseIcon fontSize="small" />
                                            </IconButton>
                                        )
                                    }}
                                />
                            </Box>
                        </Box>

                        <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                sx={{ bgcolor: '#1e88e5', '&:hover': { bgcolor: '#1565c0' } }}
                            >
                                Complete
                            </Button>

                            <Button
                                fullWidth
                                variant="outlined"
                                onClick={() => history.push('/playlists')}
                            >
                                Cancel
                            </Button>
                        </Box>
                    </Box>

                    <Typography variant="caption" sx={{ color: '#777', mt: 4 }}>
                        Copyright © Playlister 2025
                    </Typography>
                </Box>
            </Box>
        </Box>
    );
}
