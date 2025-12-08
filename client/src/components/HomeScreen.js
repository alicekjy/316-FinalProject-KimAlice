import { useContext, useEffect, useState } from 'react';
import AuthContext from '../auth';
import GlobalStoreContext from '../store';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import TextField from '@mui/material/TextField';
import Avatar from '@mui/material/Avatar';
import Divider from '@mui/material/Divider';
import CircularProgress from '@mui/material/CircularProgress';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import HomeIcon from '@mui/icons-material/Home';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';

export default function HomeScreen() {
    const { auth } = useContext(AuthContext);
    const { store } = useContext(GlobalStoreContext);
    const [filters, setFilters] = useState({
        playlistName: '',
        ownerUsername: '',
        songTitle: '',
        songArtist: '',
        songYear: ''
    });
    const [sortBy, setSortBy] = useState('listens');
    const [sortOrder, setSortOrder] = useState('desc');
    const [allPlaylists, setAllPlaylists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [menuAnchorEl, setMenuAnchorEl] = useState(null);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const api = require('../store/requests').default;
                const response = await api.getPlaylists({
                    ...filters,
                    sortBy,
                    sortOrder
                });
                if (response.ok) {
                    if (auth.loggedIn) {
                        await store.loadPlaylists({
                            ...filters,
                            sortBy,
                            sortOrder
                        });
                    } else {
                        setAllPlaylists(response.data.playlists || []);
                    }
                }
            } catch (error) {
                console.error('Error loading playlists:', error);
            }
            setLoading(false);
        };
        loadData();
        // eslint-disable-next-line
    }, [auth.loggedIn, sortBy, sortOrder]);

    const handleCreatePlaylist = () => {
        store.createPlaylist();
    }

    const handleDeletePlaylist = (id, event) => {
        event.stopPropagation();
        if (window.confirm('Are you sure you want to delete this playlist?')) {
            store.deletePlaylist(id);
        }
    }

    const handleCopyPlaylist = (id, event) => {
        event.stopPropagation();
        store.copyPlaylist(id);
    }

    const handlePlayPlaylist = async (id, event) => {
        event.stopPropagation();
        try {
            const api = require('../store/requests').default;
            await api.playPlaylist(id);
            // Reload playlists to update play count
            const response = await api.getPlaylists();
            if (response.ok) {
                if (!auth.loggedIn) {
                    setAllPlaylists(response.data.playlists || []);
                }
            }
        } catch (error) {
            console.error('Failed to play playlist:', error);
        }
    }

    const handlePlaylistClick = (id) => {
        if (auth.loggedIn) {
            store.setCurrentPlaylist(id);
        } else {
            alert('Please login to view and edit playlist details');
        }
    }

    const handleFilterChange = (field, value) => {
        setFilters(prev => ({ ...prev, [field]: value }));
    };

    const handleSearch = async () => {
        setLoading(true);
        try {
            const api = require('../store/requests').default;
            const response = await api.getPlaylists({
                ...filters,
                sortBy,
                sortOrder
            });
            if (response.ok) {
                if (auth.loggedIn) {
                    await store.loadPlaylists({
                        ...filters,
                        sortBy,
                        sortOrder
                    });
                } else {
                    setAllPlaylists(response.data.playlists || []);
                }
            }
        } catch (error) {
            console.error('Error searching playlists:', error);
        }
        setLoading(false);
    };

    const handleClear = async () => {
        const cleared = {
            playlistName: '',
            ownerUsername: '',
            songTitle: '',
            songArtist: '',
            songYear: ''
        };
        setFilters(cleared);
        setSortBy('listens');
        setSortOrder('desc');
        setLoading(true);
        try {
            const api = require('../store/requests').default;
            const response = await api.getPlaylists({
                ...cleared,
                sortBy: 'listens',
                sortOrder: 'desc'
            });
            if (response.ok) {
                if (auth.loggedIn) {
                    await store.loadPlaylists({
                        ...cleared,
                        sortBy: 'listens',
                        sortOrder: 'desc'
                    });
                } else {
                    setAllPlaylists(response.data.playlists || []);
                }
            }
        } catch (error) {
            console.error('Error clearing filters:', error);
        }
        setLoading(false);
    };

    const toggleSortOrder = async () => {
        const nextOrder = sortOrder === 'asc' ? 'desc' : 'asc';
        setSortOrder(nextOrder);
    };

    const handleMenuOpen = (event) => {
        setMenuAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setMenuAnchorEl(null);
    };

    const handleLogout = () => {
        handleMenuClose();
        auth.logoutUser();
    };

    // Filter and sort playlists
    const getFilteredPlaylists = () => {
        // Get the right playlist source
        const source = auth.loggedIn ? store.playlists : allPlaylists;
        let filtered = [...source];
        
        // Apply search filter
        if (filters.playlistName) {
            filtered = filtered.filter(playlist => 
                playlist.name.toLowerCase().includes(filters.playlistName.toLowerCase())
            );
        }
        if (filters.ownerUsername) {
            filtered = filtered.filter(playlist =>
                (playlist.owner?.username || playlist.ownerEmail || '')
                    .toLowerCase()
                    .includes(filters.ownerUsername.toLowerCase())
            );
        }
        if (filters.songTitle) {
            filtered = filtered.filter(playlist =>
                playlist.songs.some(song => song.title.toLowerCase().includes(filters.songTitle.toLowerCase()))
            );
        }
        if (filters.songArtist) {
            filtered = filtered.filter(playlist =>
                playlist.songs.some(song => song.artist.toLowerCase().includes(filters.songArtist.toLowerCase()))
            );
        }
        if (filters.songYear) {
            filtered = filtered.filter(playlist =>
                playlist.songs.some(song => song.year?.toString().includes(filters.songYear))
            );
        }

        // Apply sorting
        filtered.sort((a, b) => {
            let comparison = 0;
            switch (sortBy) {
                case 'name':
                    comparison = a.name.localeCompare(b.name);
                    break;
                case 'songs':
                    comparison = a.songs.length - b.songs.length;
                    break;
                case 'listens':
                    comparison = (a.playedBy?.length || 0) - (b.playedBy?.length || 0);
                    break;
                case 'owner':
                    const ownerA = a.owner?.username || a.ownerEmail || '';
                    const ownerB = b.owner?.username || b.ownerEmail || '';
                    comparison = ownerA.localeCompare(ownerB);
                    break;
                default:
                    comparison = 0;
            }
            return sortOrder === 'asc' ? comparison : -comparison;
        });

        return filtered;
    }

    const filteredPlaylists = getFilteredPlaylists();

    const renderLoading = (
        <Box sx={{ padding: 6, display: 'flex', justifyContent: 'center' }}>
            <CircularProgress />
        </Box>
    );

    const renderList = (
        <List sx={{ bgcolor: 'transparent', p: 0 }}>
            {filteredPlaylists.map((playlist) => {
                const isOwner = auth.loggedIn && auth.user && playlist.owner?._id === auth.user._id;
                const listenerCount = playlist.playedBy?.length || 0;
                const ownerName = playlist.owner?.username || playlist.ownerEmail || 'Unknown';

                return (
                    <ListItem
                        key={playlist._id}
                        sx={{
                            bgcolor: 'white',
                            borderRadius: 2,
                            mb: 2,
                            boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                            alignItems: 'flex-start'
                        }}
                    >
                        <Box sx={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                <Avatar sx={{ bgcolor: '#e3f2fd', color: '#0d47a1' }}>
                                    {ownerName.substring(0, 2).toUpperCase()}
                                </Avatar>
                                <Box sx={{ flexGrow: 1 }}>
                                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                                        {playlist.name}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary">
                                        {ownerName}
                                    </Typography>
                                    <Typography variant="body2" sx={{ color: '#1565c0', mt: 0.5 }}>
                                        {listenerCount} Listener{listenerCount === 1 ? '' : 's'}
                                    </Typography>
                                </Box>
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    {isOwner && (
                                        <>
                                            <Button 
                                                variant="contained" 
                                                sx={{ bgcolor: '#e53935', '&:hover': { bgcolor: '#c62828' } }}
                                                size="small"
                                                onClick={(e) => handleDeletePlaylist(playlist._id, e)}
                                            >
                                                Delete
                                            </Button>
                                            <Button 
                                                variant="contained" 
                                                sx={{ bgcolor: '#205697', '&:hover': { bgcolor: '#1565c0' } }}
                                                size="small"
                                                onClick={(e) => handlePlaylistClick(playlist._id, e)}
                                            >
                                                Edit
                                            </Button>
                                            <Button 
                                                variant="contained" 
                                                sx={{ bgcolor: '#43a047', '&:hover': { bgcolor: '#2e7d32' } }}
                                                size="small"
                                                onClick={(e) => handleCopyPlaylist(playlist._id, e)}
                                            >
                                                Copy
                                            </Button>
                                        </>
                                    )}
                                    <Button 
                                        variant="contained" 
                                        sx={{ bgcolor: '#205697', '&:hover': { bgcolor: '#1565c0' } }}
                                        size="small"
                                        onClick={(e) => handlePlayPlaylist(playlist._id, e)}
                                    >
                                        Play
                                    </Button>
                                    <IconButton>
                                        <ArrowDropDownIcon />
                                    </IconButton>
                                </Box>
                            </Box>
                        </Box>
                    </ListItem>
                );
            })}
        </List>
    );

    // playlists view
    return (
        <Box sx={{ padding: 3, minHeight: '100vh', bgcolor: '#e6f0ff' }}>
            <Box
                sx={{
                    bgcolor: '#f5f9ff',
                    border: '2px solid #b5c7e0',
                    borderRadius: 1,
                    boxShadow: '0 6px 12px rgba(0,0,0,0.2)',
                    width: '100%',
                    maxWidth: '1300px',
                    minHeight: '700px',
                    margin: '0 auto',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 3,
                    mt: 2
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
                        onClick={() => store.closeCurrentPlaylist()}
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
                        The Playlister
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

                <Box
                    sx={{
                        display: 'flex',
                        gap: 4,
                        padding: 3,
                        flexGrow: 1
                    }}
                >
                {/* Left column filters */}
                <Box sx={{ flex: 1, maxWidth: 360 }}>
                    <Typography variant="h4" sx={{ color: '#1565c0', fontWeight: 800, mb: 3 }}>
                        Playlists
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField
                            fullWidth
                            placeholder="by Playlist Name"
                            value={filters.playlistName}
                            onChange={(e) => handleFilterChange('playlistName', e.target.value)}
                            size="small"
                            sx={{ bgcolor: '#e8f0fb' }}
                        />
                        <TextField
                            fullWidth
                            placeholder="by User Name"
                            value={filters.ownerUsername}
                            onChange={(e) => handleFilterChange('ownerUsername', e.target.value)}
                            size="small"
                            sx={{ bgcolor: '#e8f0fb' }}
                        />
                        <TextField
                            fullWidth
                            placeholder="by Song Title"
                            value={filters.songTitle}
                            onChange={(e) => handleFilterChange('songTitle', e.target.value)}
                            size="small"
                            sx={{ bgcolor: '#e8f0fb' }}
                        />
                        <TextField
                            fullWidth
                            placeholder="by Song Artist"
                            value={filters.songArtist}
                            onChange={(e) => handleFilterChange('songArtist', e.target.value)}
                            size="small"
                            sx={{ bgcolor: '#e8f0fb' }}
                        />
                        <TextField
                            fullWidth
                            placeholder="by Song Year"
                            value={filters.songYear}
                            onChange={(e) => handleFilterChange('songYear', e.target.value)}
                            size="small"
                            sx={{ bgcolor: '#e8f0fb' }}
                        />
                        <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                            <Button 
                                variant="contained" 
                                startIcon={<SearchIcon />}
                                sx={{ bgcolor: '#205697', '&:hover': { bgcolor: '#1565c0' }, flex: 1 }}
                                onClick={handleSearch}
                            >
                                Search
                            </Button>
                            <Button 
                                variant="contained" 
                                startIcon={<ClearIcon />}
                                sx={{ bgcolor: '#205697', '&:hover': { bgcolor: '#1565c0' }, flex: 1 }}
                                onClick={handleClear}
                            >
                                Clear
                            </Button>
                        </Box>
                    </Box>
                </Box>

                <Divider orientation="vertical" flexItem sx={{ borderColor: '#d6cfcf' }} />

                {/* Right column list */}
                <Box sx={{ flex: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body1">Sort:</Typography>
                            <Button 
                                variant="text" 
                                onClick={toggleSortOrder}
                                sx={{ color: '#205697', textTransform: 'none', fontWeight: 700 }}
                            >
                                Listeners ({sortOrder === 'desc' ? 'Hi-Lo' : 'Lo-Hi'})
                            </Button>
                        </Box>
                        <Typography variant="h6" sx={{ fontWeight: 700 }}>
                            {filteredPlaylists.length} Playlist{filteredPlaylists.length === 1 ? '' : 's'}
                        </Typography>
                    </Box>

                    {auth.loggedIn && (
                        <Box sx={{ textAlign: 'right' }}>
                            <Button 
                                variant="contained" 
                                sx={{ bgcolor: '#205697', '&:hover': { bgcolor: '#1565c0' } }}
                                onClick={handleCreatePlaylist}
                            >
                                + New Playlist
                            </Button>
                        </Box>
                    )}

                    {loading ? renderLoading : (
                        filteredPlaylists.length === 0 ? (
                            <Box sx={{
                                bgcolor: 'white',
                                borderRadius: 2,
                                padding: 4,
                                textAlign: 'center',
                                boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
                            }}>
                                <Typography variant="h6" sx={{ mb: 2 }}>
                                    No playlists found
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    Try adjusting your search filters.
                                </Typography>
                            </Box>
                        ) : renderList
                    )}
                </Box>
                </Box>
            </Box>
            <Menu
                anchorEl={menuAnchorEl}
                open={Boolean(menuAnchorEl)}
                onClose={handleMenuClose}
            >
                {auth.loggedIn ? (
                    <>
                        <MenuItem onClick={handleLogout}>Logout</MenuItem>
                    </>
                ) : (
                    <>
                        <MenuItem component="a" href="/login">Login</MenuItem>
                        <MenuItem component="a" href="/register">Create Account</MenuItem>
                    </>
                )}
            </Menu>
        </Box>
    );
}
