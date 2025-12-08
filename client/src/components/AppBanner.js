import { useContext, useState } from 'react';
import { Link, useHistory, useLocation } from 'react-router-dom'
import AuthContext from '../auth';
import GlobalStoreContext from '../store';

import AccountCircle from '@mui/icons-material/AccountCircle';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import HomeIcon from '@mui/icons-material/Home';
import Button from '@mui/material/Button';

export default function AppBanner() {
    const { auth } = useContext(AuthContext);
    const { store } = useContext(GlobalStoreContext);
    const history = useHistory();
    const location = useLocation();
    const [anchorEl, setAnchorEl] = useState(null);
    const isMenuOpen = Boolean(anchorEl);
    const isSplash = location.pathname === '/';

    const handleProfileMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        handleMenuClose();
        auth.logoutUser();
    }


    const handleEditAccount = () => {
        handleMenuClose();
        history.push('/edit-account');
    }

    const handleHome = () => {
        if (store.currentPlaylist) {
            store.closeCurrentPlaylist();
        }
        history.push('/playlists');
    }

    const menuId = 'primary-search-account-menu';
    
    const loggedOutMenu = (
        <Menu
            anchorEl={anchorEl}
            anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
            }}
            id={menuId}
            keepMounted
            transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
            }}
            open={isMenuOpen}
            onClose={handleMenuClose}
        >
            <MenuItem onClick={handleMenuClose}>
                <Link to='/login' style={{ textDecoration: 'none', color: 'inherit' }}>
                    Login
                </Link>
            </MenuItem>
            <MenuItem onClick={handleMenuClose}>
                <Link to='/register' style={{ textDecoration: 'none', color: 'inherit' }}>
                    Create Account
                </Link>
            </MenuItem>
        </Menu>
    );

    const loggedInMenu = 
        <Menu
            anchorEl={anchorEl}
            anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
            }}
            id={menuId}
            keepMounted
            transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
            }}
            open={isMenuOpen}
            onClose={handleMenuClose}
        >
            <MenuItem onClick={handleEditAccount}>Edit Account</MenuItem>
            <MenuItem onClick={handleLogout}>Logout</MenuItem>
        </Menu>        

    let menu = loggedOutMenu;
    if (auth.loggedIn) {
        menu = loggedInMenu;
    }
    
    function getAccountMenu(loggedIn) {
        if (loggedIn) {
            let userInitials = auth.getUserInitials();
            return (
                <Box sx={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    bgcolor: 'secondary.main',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1rem',
                    fontWeight: 'bold'
                }}>
                    {userInitials}
                </Box>
            );
        } else {
            return <AccountCircle />;
        }
    }

    if (isSplash) {
        return null;
    }

    return (
        <Box sx={{ flexGrow: 1 }}>
            <AppBar 
                position="fixed" 
                sx={{ 
                    bgcolor: isSplash ? '#1e88e5' : '#e600b6',
                    boxShadow: isSplash ? undefined : '0 4px 10px rgba(0,0,0,0.25)'
                }}
            >
                <Toolbar sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    {!isSplash && (
                        <IconButton
                            size="large"
                            edge="start"
                            color="inherit"
                            aria-label="home"
                            onClick={handleHome}
                            sx={{ 
                                bgcolor: 'white', 
                                color: '#e600b6',
                                '&:hover': { bgcolor: '#f5f5f5' }
                            }}
                        >
                            <HomeIcon />
                        </IconButton>
                    )}

                    {!isSplash && (
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button
                                variant="contained"
                                sx={{ 
                                    bgcolor: '#1b1b1b',
                                    color: 'white',
                                    textTransform: 'none',
                                    '&:hover': { bgcolor: '#000' }
                                }}
                                onClick={() => history.push('/playlists')}
                            >
                                Playlists
                            </Button>
                            <Button
                                variant="contained"
                                sx={{ 
                                    bgcolor: '#4a6cff',
                                    color: 'white',
                                    textTransform: 'none',
                                    '&:hover': { bgcolor: '#3856d6' }
                                }}
                                onClick={() => history.push('/songs')}
                            >
                                Song Catalog
                            </Button>
                        </Box>
                    )}

                    <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center' }}>
                        {!isSplash && (
                            <Typography                        
                                variant="h4"
                                noWrap
                                component="div"
                                sx={{ cursor: 'pointer' }}
                                onClick={handleHome}
                            >
                                The Playlister
                            </Typography>
                        )}
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <IconButton
                            size="large"
                            edge="end"
                            aria-label="account of current user"
                            aria-controls={menuId}
                            aria-haspopup="true"
                            onClick={handleProfileMenuOpen}
                            color="inherit"
                            sx={{ bgcolor: isSplash ? 'transparent' : 'transparent' }}
                        >
                            {getAccountMenu(auth.loggedIn)}
                        </IconButton>
                    </Box>
                </Toolbar>
            </AppBar>
            <Toolbar />
            {menu}
        </Box>
    );
}
