import { useContext, useState } from 'react';
import { useHistory } from 'react-router-dom';
import AuthContext from '../auth';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import HomeIcon from '@mui/icons-material/Home';
import Button from '@mui/material/Button';

/**
 * Shared application banner with configurable nav buttons and account menu.
 *  - simple (default): home + title + avatar menu
 *  - nav: home + optional nav buttons + title + avatar menu
 */
export default function AppBanner({
    title = 'The Playlister',
    onHome,
    mode = 'simple', 
    navButtons = [], 
    menuVariant = 'auto',
    titleSx = {}
}) {
    const { auth } = useContext(AuthContext);
    const history = useHistory();
    const [anchorEl, setAnchorEl] = useState(null);

    const handleHome = () => {
        if (onHome) {
            onHome();
        } else {
            history.push('/playlists');
        }
    };

    const handleMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleMenuNav = (path) => {
        history.push(path);
        handleMenuClose();
    };

    const handleLogout = () => {
        handleMenuClose();
        auth.logoutUser();
        history.push('/');
    };

    const resolvedMenuVariant = menuVariant === 'auto'
        ? (auth.loggedIn ? 'auth' : 'guest')
        : menuVariant;

    return (
        <Box 
            sx={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                bgcolor: '#205697',
                color: 'white',
                px: 2,
                py: 1.5,
                borderBottom: '2px solid #b5c7e0',
                gap: 2
            }}
        >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <IconButton 
                    onClick={handleHome}
                    sx={{ 
                        p: 0.5,
                        bgcolor: 'white',
                        '&:hover': { bgcolor: '#e3f2fd' }
                    }}
                    aria-label="Home"
                >
                    <HomeIcon sx={{ color: '#205697' }} />
                </IconButton>

                {mode === 'nav' && navButtons.map((btn) => (
                    <Button
                        key={btn.label}
                        variant="contained"
                        size="small"
                        onClick={() => {
                            if (btn.onClick) btn.onClick();
                            if (btn.to) history.push(btn.to);
                        }}
                        sx={{
                            bgcolor: btn.bgcolor || '#e3f2fd',
                            color: btn.color || '#0d47a1',
                            border: '1px solid #0d47a1',
                            '&:hover': { bgcolor: btn.hoverBg || '#d0e6ff' },
                            textTransform: 'none',
                            fontWeight: 700,
                            boxShadow: 'none'
                        }}
                    >
                        {btn.label}
                    </Button>
                ))}
            </Box>

            <Typography variant="h5" sx={{ fontWeight: 700, textAlign: 'center', flexGrow: 1, ...titleSx }}>
                {title}
            </Typography>

            <IconButton 
                onClick={handleMenuOpen}
                sx={{ p: 0.5 }}
                aria-label="Account"
            >
                {auth.user?.avatar ? (
                    <Avatar 
                        src={auth.user.avatar} 
                        sx={{ width: 32, height: 32 }}
                    />
                ) : (
                    <AccountCircleIcon sx={{ color: 'white', fontSize: 32 }} />
                )}
            </IconButton>

            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                MenuListProps={{ sx: { bgcolor: '#f5e9ff' } }}
            >
                {resolvedMenuVariant === 'auth' ? (
                    <>
                        <MenuItem onClick={() => handleMenuNav('/edit-account')}>
                            Edit Account
                        </MenuItem>
                        <MenuItem onClick={handleLogout}>Logout</MenuItem>
                    </>
                ) : (
                    <>
                        <MenuItem onClick={() => handleMenuNav('/login')}>Login</MenuItem>
                        <MenuItem onClick={() => handleMenuNav('/register')}>Create Account</MenuItem>
                    </>
                )}
            </Menu>
        </Box>
    );
}
