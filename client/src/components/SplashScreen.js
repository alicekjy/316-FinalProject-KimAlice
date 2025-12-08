import { useHistory } from 'react-router-dom';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import AppBanner from './AppBanner';

export default function SplashScreen() {
    const history = useHistory();

    const handleGuestContinue = () => {
        history.push('/playlists');
    }

    const handleLogin = () => {
        history.push('/login');
    }

    const handleRegister = () => {
        history.push('/register');
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
            {/* Main Container Box */}
            <Box
                sx={{
                    bgcolor: '#f8fbff',
                    border: '2px solid #b5c7e0',
                    borderRadius: 1,
                    boxShadow: '0 6px 12px rgba(0,0,0,0.2)',
                    width: '100%',
                    maxWidth: '1200px',
                    minHeight: '800px',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column'
                }}
            >
                <AppBanner title="The Playlister" onHome={() => history.push('/')} menuVariant="guest" />

                {/* Content Area - Title and Icon */}
                <Box 
                    sx={{ 
                        padding: { xs: 4, sm: 8 }, 
                        textAlign: 'center',
                        flexGrow: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center'
                    }}
                >
                    <Typography variant="h3" sx={{ mb: 6, color: '#2f3b45', fontWeight: '600' }}>
                        The Playlister
                    </Typography>
                    
                    <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                        <Typography 
                            variant="h1" 
                            component="div" 
                            sx={{ fontSize: '10rem', color: '#333', lineHeight: 1 }}
                        >
                            🎵
                        </Typography>
                    </Box>
                </Box>

                {/* Buttons Area - At Bottom */}
                <Box 
                    sx={{ 
                        padding: { xs: 3, sm: 4 }, 
                        paddingBottom: { xs: 4, sm: 6 },
                        textAlign: 'center'
                    }}
                >
                    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap' }}>
                        <Button 
                            variant="contained"
                            size="large"
                            onClick={handleGuestContinue}
                            sx={{ 
                                bgcolor: '#205697', 
                                '&:hover': { bgcolor: '#1565c0' },
                                px: 4,
                                py: 1.5,
                                fontSize: '1rem'
                            }}
                        >
                            Continue as Guest
                        </Button>
                        <Button 
                            variant="contained"
                            size="large"
                            onClick={handleLogin}
                            sx={{ 
                                bgcolor: '#205697', 
                                '&:hover': { bgcolor: '#1565c0' },
                                px: 4,
                                py: 1.5,
                                fontSize: '1rem'
                            }}
                        >
                            Login
                        </Button>
                        <Button
                            variant="contained"
                            size="large"
                            onClick={handleRegister}
                            sx={{ 
                                bgcolor: '#205697', 
                                '&:hover': { bgcolor: '#1565c0' },
                                px: 4,
                                py: 1.5,
                                fontSize: '1rem'
                            }}
                        >
                            Create Account
                        </Button>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}
