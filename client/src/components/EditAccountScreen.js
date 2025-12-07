import { useContext, useState, useEffect } from 'react';
import AuthContext from '../auth';
import { useHistory } from 'react-router-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';

export default function EditAccountScreen() {
    const { auth } = useContext(AuthContext);
    const history = useHistory();
    const [username, setUsername] = useState('');
    const [avatar, setAvatar] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

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

        try {
            const response = await fetch('http://localhost:4000/auth/update', {
                method: 'PUT',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username,
                    avatar
                })
            });

            const data = await response.json();

            if (response.ok) {
                setSuccessMessage('Account updated successfully!');
                await auth.getLoggedIn();
                setTimeout(() => {
                    history.push('/home');
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
        <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '80vh',
            padding: 3
        }}>
            <Box sx={{
                bgcolor: 'white',
                borderRadius: 2,
                padding: 4,
                minWidth: '400px',
            }}>
                <Typography variant="h4" sx={{ mb: 3, textAlign: 'center' }}>
                    Edit Account
                </Typography>

                {errorMessage && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {errorMessage}
                    </Alert>
                )}

                {successMessage && (
                    <Alert severity="success" sx={{ mb: 2 }}>
                        {successMessage}
                    </Alert>
                )}

                <form onSubmit={handleSubmit}>
                    <TextField
                        fullWidth
                        label="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        margin="normal"
                        required
                    />

                    <Box sx={{ mt: 2, mb: 2 }}>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                            Avatar:
                        </Typography>
                        {avatar && (
                            <Box sx={{ mb: 2, textAlign: 'center' }}>
                                <img 
                                    src={avatar} 
                                    alt="Current avatar" 
                                    style={{ 
                                        width: '100px', 
                                        height: '100px', 
                                        borderRadius: '50%',
                                        objectFit: 'cover'
                                    }} 
                                />
                            </Box>
                        )}
                        <Button
                            variant="outlined"
                            component="label"
                            fullWidth
                        >
                            Change Avatar
                            <input
                                type="file"
                                hidden
                                accept="image/*"
                                onChange={handleAvatarChange}
                            />
                        </Button>
                    </Box>

                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 2, mb: 2 }}
                    >
                        Save Changes
                    </Button>

                    <Button
                        fullWidth
                        variant="outlined"
                        onClick={() => history.push('/home')}
                    >
                        Cancel
                    </Button>
                </form>
            </Box>
        </Box>
    );
}