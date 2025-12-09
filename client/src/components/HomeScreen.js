import { useContext, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
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
import Divider from '@mui/material/Divider';
import CircularProgress from '@mui/material/CircularProgress';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import Avatar from '@mui/material/Avatar';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import AppBanner from './AppBanner';
import DeletePlaylistModal from './DeletePlaylistModal';
import EditPlaylistModal from './EditPlaylistModal';
import Collapse from '@mui/material/Collapse';
import PlayPlaylistModal from './PlayPlaylistModal';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';

export default function HomeScreen() {
    const { auth } = useContext(AuthContext);
    const { store } = useContext(GlobalStoreContext);
    const history = useHistory();
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
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedPlaylist, setSelectedPlaylist] = useState(null);
    const isLoggedIn = auth.loggedIn;
    const [expanded, setExpanded] = useState({});
    const [playDialogOpen, setPlayDialogOpen] = useState(false);
    const [playPlaylist, setPlayPlaylist] = useState(null);
    const [currentSongIndex, setCurrentSongIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(true);
    const [repeatAll, setRepeatAll] = useState(false);
    const [playOwnerInfo, setPlayOwnerInfo] = useState({ ownerName: '', ownerAvatar: null });

    const resolveOwnerInfo = (playlist) => {
        const ownerMatchesUser = auth.user && (
            playlist.owner?._id === auth.user._id ||
            (playlist.ownerEmail && playlist.ownerEmail === auth.user.email) ||
            (playlist.owner?.email && playlist.owner?.email === auth.user.email)
        );

        const ownerName = (() => {
            if (ownerMatchesUser) return auth.user.username || auth.user.email || 'Unknown';
            return (
                playlist.owner?.username ||
                playlist.ownerName ||
                playlist.ownerEmail ||
                playlist.owner?.email ||
                'Unknown'
            );
        })();

        const ownerAvatar = (() => {
            if (ownerMatchesUser) return auth.user.avatar || auth.user.image || null;
            return (
                playlist.owner?.avatar ||
                playlist.ownerAvatar ||
                playlist.owner?.profileImage ||
                playlist.owner?.avatarUrl ||
                playlist.owner?.image ||
                null
            );
        })();

        return { ownerName, ownerAvatar };
    };

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

    }, [auth.loggedIn, sortBy, sortOrder]);

    const handleCreatePlaylist = () => {
        store.createPlaylist();
    }

    const handleDeletePlaylist = (playlist, event) => {
        event.stopPropagation();
        setSelectedPlaylist(playlist);
        setDeleteDialogOpen(true);
    };

    const handleCopyPlaylist = (id, event) => {
        event.stopPropagation();
        store.copyPlaylist(id);
    }

    const handlePlayPlaylist = async (playlist, event) => {
        event.stopPropagation();
        const ownerInfo = resolveOwnerInfo(playlist);
        setPlayPlaylist(playlist);
        setPlayOwnerInfo(ownerInfo);
        setCurrentSongIndex(0);
        setIsPlaying(true);
        setPlayDialogOpen(true);
        try {
            const api = require('../store/requests').default;
            await api.playPlaylist(playlist._id);
        } catch (error) {
            console.error('Failed to play playlist:', error);
        }
    }

    const handlePlaylistClick = (id) => {
        if (!auth.loggedIn) {
            alert('Please login to view and edit playlist details');
        }
    }

    const handleOpenEdit = (playlist, event) => {
        event.stopPropagation();
        setSelectedPlaylist(playlist);
        setEditDialogOpen(true);
    };

    const handleEditSave = async (name, songs) => {
        if (!selectedPlaylist) return;
        await store.updatePlaylist(selectedPlaylist._id, name, songs || []);
        setEditDialogOpen(false);
        setSelectedPlaylist(null);
    };

    const handleDeleteConfirm = async () => {
        if (!selectedPlaylist) return;
        await store.deletePlaylist(selectedPlaylist._id);
        setDeleteDialogOpen(false);
        setSelectedPlaylist(null);
    };

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
    const handleFilterKeyDown = (event) => {
        if(event.key === 'Enter'){
            event.preventDefault();
            handleSearch();
        }
    }
    const toggleSortOrder = async () => {
        const nextOrder = sortOrder === 'asc' ? 'desc' : 'asc';
        setSortOrder(nextOrder);
    };

    // Filter and sort playlists
    const getFilteredPlaylists = () => {
        // Get the right playlist 
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
                    const ownerA = (a.owner?.username || a.ownerName || a.ownerEmail || a.owner?.email || '').toLowerCase();
                    const ownerB = (b.owner?.username || b.ownerName || b.ownerEmail || b.owner?.email || '').toLowerCase();
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

                const { ownerName, ownerAvatar } = resolveOwnerInfo(playlist);

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
                                <Avatar sx={{ bgcolor: '#e3f2fd', color: '#0d47a1' }} src={ownerAvatar || undefined}>
                                    {!ownerAvatar && ownerName.substring(0, 2).toUpperCase()}
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
                                                onClick={(e) => handleDeletePlaylist(playlist, e)}
                                            >
                                                Delete
                                            </Button>
                                            <Button 
                                                variant="contained" 
                                                sx={{ bgcolor: '#205697', '&:hover': { bgcolor: '#1565c0' } }}
                                                size="small"
                                                onClick={(e) => handleOpenEdit(playlist, e)}
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
                                        onClick={(e) => handlePlayPlaylist(playlist, e)}
                                    >
                                        Play
                                    </Button>
                                    <IconButton onClick={() => setExpanded(prev => ({ ...prev, [playlist._id]: !prev[playlist._id] }))}>
                                        <ArrowDropDownIcon />
                                    </IconButton>
                                </Box>
                            </Box>
                            <Collapse in={!!expanded[playlist._id]} timeout="auto" unmountOnExit>
                                <Box sx={{ mt: 1, pl: 6, pr: 2, pb: 1 }}>
                                    {playlist.songs && playlist.songs.length > 0 ? (
                                        playlist.songs.map((song, idx) => (
                                            <Typography key={idx} variant="body2" sx={{ color: '#333' }}>
                                                {idx + 1}. {song.title} by {song.artist} ({song.year})
                                            </Typography>
                                        ))
                                    ) : (
                                        <Typography variant="body2" color="text.secondary">
                                            No songs in this playlist.
                                        </Typography>
                                    )}
                                </Box>
                            </Collapse>
                        </Box>
                    </ListItem>
                );
            })}
        </List>
    );

    // playlists view
    return (
        <Box 
            sx={{ 
                padding: 3, 
                minHeight: '100vh', 
                bgcolor: '#e6f0ff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}
        >
            <Box
                sx={{
                    bgcolor: '#f5f9ff',
                    border: '2px solid #b5c7e0',
                    borderRadius: 1,
                    boxShadow: '0 6px 12px rgba(0,0,0,0.2)',
                    width: 'calc(100% - 48px)',
                    maxWidth: '1200px',
                    minHeight: '800px',
                    margin: '0 auto',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 3,
                    mt: 0
                }}
            >
                <AppBanner 
                    title="The Playlister" 
                    onHome={() => history.push('/')} 
                    mode="nav"
                    navButtons={[
                        { label: 'Playlists', to: '/playlists', bgcolor: '#e3f2fd', color: '#0d47a1', hoverBg: '#d0e6ff' },
                        { label: 'Song Catalog', to: '/songs', bgcolor: '#0d47a1', color: 'white', hoverBg: '#1565c0' }
                    ]}
                    menuVariant="auto"
                />

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
                            onKeyDown ={handleFilterKeyDown}
                            size="small"
                            sx={{ bgcolor: '#e8f0fb' }}
                        />
                        <TextField
                            fullWidth
                            placeholder="by User Name"
                            value={filters.ownerUsername}
                            onChange={(e) => handleFilterChange('ownerUsername', e.target.value)}
                            onKeyDown ={handleFilterKeyDown}
                            size="small"
                            sx={{ bgcolor: '#e8f0fb' }}
                        />
                        <TextField
                            fullWidth
                            placeholder="by Song Title"
                            value={filters.songTitle}
                            onChange={(e) => handleFilterChange('songTitle', e.target.value)}
                            onKeyDown ={handleFilterKeyDown}
                            size="small"
                            sx={{ bgcolor: '#e8f0fb' }}
                        />
                        <TextField
                            fullWidth
                            placeholder="by Song Artist"
                            value={filters.songArtist}
                            onChange={(e) => handleFilterChange('songArtist', e.target.value)}
                            onKeyDown ={handleFilterKeyDown}
                            size="small"
                            sx={{ bgcolor: '#e8f0fb' }}
                        />
                        <TextField
                            fullWidth
                            placeholder="by Song Year"
                            value={filters.songYear}
                            onChange={(e) => handleFilterChange('songYear', e.target.value)}
                            onKeyDown ={handleFilterKeyDown}
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
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                            <FormControl size="small" sx={{ minWidth: 220 }}>
                                    <InputLabel>Sort</InputLabel>
                                    <Select
                                        value={`${sortBy}-${sortOrder}`}
                                        label="Sort"
                                        onChange={(e) => {
                                            const [by, order] = e.target.value.split('-');
                                            setSortBy(by);
                                            setSortOrder(order);
                                        }}
                                    >
                                        <MenuItem value="listens-desc">Listeners (Hi-Lo)</MenuItem>
                                        <MenuItem value="listens-asc">Listeners (Lo-Hi)</MenuItem>
                                        <MenuItem value="name-asc">Playlist Name (A-Z)</MenuItem>
                                        <MenuItem value="name-desc">Playlist Name (Z-A)</MenuItem>
                                        <MenuItem value="owner-asc">User Name (A-Z)</MenuItem>
                                        <MenuItem value="owner-desc">User Name (Z-A)</MenuItem>
                                    </Select>
                                </FormControl>
                            
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
            <EditPlaylistModal
                open={editDialogOpen}
                playlist={selectedPlaylist}
                onSave={handleEditSave}
                onClose={() => { setEditDialogOpen(false); setSelectedPlaylist(null); }}
                onAddSong={() => history.push('/songs')}
            />
            <DeletePlaylistModal
                open={deleteDialogOpen}
                playlistName={selectedPlaylist?.name || ''}
                onConfirm={handleDeleteConfirm}
                onClose={() => setDeleteDialogOpen(false)}
            />
            <PlayPlaylistModal
                open={playDialogOpen}
                playlist={playPlaylist}
                currentSongIndex={currentSongIndex}
                onSelectSong={(idx) => { setCurrentSongIndex(idx); setIsPlaying(true); }}
                onClose={() => { setPlayDialogOpen(false); setPlayPlaylist(null); }}
                onPrev={() => {
                    if (!playPlaylist || !playPlaylist.songs?.length) return;
                    setCurrentSongIndex((prev) => {
                        const count = playPlaylist.songs.length;
                        const nextIndex = prev - 1;
                        if (nextIndex < 0) {
                            return repeatAll ? count - 1 : 0;
                        }
                        return nextIndex;
                    });
                    setIsPlaying(true);
                }}
                onNext={() => {
                    if (!playPlaylist || !playPlaylist.songs?.length) return;
                    setCurrentSongIndex((prev) => {
                        const count = playPlaylist.songs.length;
                        const nextIndex = prev + 1;
                        if (nextIndex >= count) {
                            return repeatAll ? 0 : prev;
                        }
                        return nextIndex;
                    });
                    setIsPlaying(true);
                }}
                isPlaying={isPlaying}
                onTogglePlay={() => setIsPlaying((p) => !p)}
                repeatAll={repeatAll}
                onToggleRepeat={() => setRepeatAll((p) => !p)}
                ownerName={playOwnerInfo.ownerName}
                ownerAvatar={playOwnerInfo.ownerAvatar}
            />
        </Box>
    );
}
